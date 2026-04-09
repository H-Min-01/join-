import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";

import {
  GameError,
  buildRoomSnapshot,
  createGuestSession,
  createRoom,
  hydrateRooms,
  joinRoom,
  markPlayerConnection,
  resetRoom,
  startRoom,
  submitGuess
} from "./lib/game.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const DATA_DIR = path.join(__dirname, "data");
const STATE_FILE = path.join(DATA_DIR, "state.json");
const PUBLIC_DIR = path.join(__dirname, "public");
const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const state = {
  rooms: {}
};

const roomSockets = new Map();
const socketMeta = new Map();
let persistTimer = null;

await loadState();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, getOrigin(req));

    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    await serveApp(req, res, url);
  } catch (error) {
    handleError(res, error);
  }
});

server.on("upgrade", (req, socket) => {
  handleUpgrade(req, socket);
});

server.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

async function handleApi(req, res, url) {
  const pathname = url.pathname;
  const method = req.method;

  // ── 헬스 체크 ──────────────────────────────────────────────
  if (method === "GET" && pathname === "/api/health") {
    writeJson(res, 200, { ok: true });
    return;
  }

  // ── 세션 생성 ──────────────────────────────────────────────
  if (method === "POST" && pathname === "/api/session") {
    const body = await readJson(req);
    const session = createGuestSession(body?.name);
    writeJson(res, 201, { session });
    return;
  }

  // ── 공개 방 목록 조회 (FIND ROOM) ──────────────────────────
  if (method === "GET" && pathname === "/api/rooms") {
    const search = url.searchParams.get("search") || "";
    const limit = Math.min(Number(url.searchParams.get("limit") || "50"), 50);

    const publicRooms = Object.values(state.rooms)
      .filter((room) => {
        if (room.settings.visibility !== "public") return false;
        if (room.status === "finished") return false;
        if (search) {
          const title = room.settings.title || room.id;
          if (!title.toLowerCase().includes(search.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // 1순위: 대기 중(lobby) 우선
        if (a.status === "lobby" && b.status !== "lobby") return -1;
        if (a.status !== "lobby" && b.status === "lobby") return 1;
        // 2순위: 인원 많은 순
        const aCount = Object.keys(a.players).length;
        const bCount = Object.keys(b.players).length;
        if (bCount !== aCount) return bCount - aCount;
        // 3순위: 최신순
        return b.createdAt.localeCompare(a.createdAt);
      })
      .slice(0, limit)
      .map((room) => ({
        id: room.id,
        title: room.settings.title ||
          `${room.settings.gameType === "wordle" ? "Wordle" : "숫자야구"} ${room.settings.length}자리`,
        mode: room.settings.gameType,
        status: room.status,
        players: Object.keys(room.players).length,
        maxPlayers: room.settings.maxPlayers,
        visibility: room.settings.visibility,
        hasPassword: Boolean(room.settings.password),
        length: room.settings.length,
        runtime: room.settings.runtime,
        attempts: room.settings.attempts,
        createdAt: room.createdAt
      }));

    writeJson(res, 200, { rooms: publicRooms, total: publicRooms.length });
    return;
  }

  // ── 방 생성 ────────────────────────────────────────────────
  if (method === "POST" && pathname === "/api/rooms") {
    const body = await readJson(req);
    const { guestId, name, settings } = body ?? {};
    ensureGuestId(guestId);

    const roomId = generateRoomId();
    const room = createRoom({
      roomId,
      guestId,
      name,
      settings
    });

    state.rooms[roomId] = room;
    schedulePersist();
    writeJson(res, 201, { room: buildRoomSnapshot(room, guestId, getOrigin(req)) });
    return;
  }

  // ── 코드로 방 입장 (join-by-code) ──────────────────────────
  if (method === "POST" && pathname === "/api/rooms/join-by-code") {
    const body = await readJson(req);
    const { guestId, name, code, password } = body ?? {};
    ensureGuestId(guestId);

    const roomId = String(code || "").trim().toUpperCase();
    if (!roomId) {
      throw new GameError("룸 코드를 입력해 주세요.", 400);
    }

    const room = getRoom(roomId);
    joinRoom(room, { guestId, name, password });
    schedulePersist();
    broadcastRoom(roomId);
    writeJson(res, 200, { room: buildRoomSnapshot(room, guestId, getOrigin(req)) });
    return;
  }

  // ── SOLO 게임 생성 ─────────────────────────────────────────
  if (method === "POST" && pathname === "/api/games/solo") {
    const body = await readJson(req);
    const { guestId, name, settings } = body ?? {};
    ensureGuestId(guestId);

    const roomId = generateRoomId();
    const room = createRoom({
      roomId,
      guestId,
      name,
      settings: {
        ...settings,
        maxPlayers: 1,
        visibility: "private",
        isSolo: true
      }
    });

    // SOLO는 즉시 시작
    startRoom(room, { guestId });

    state.rooms[roomId] = room;
    schedulePersist();
    writeJson(res, 201, { room: buildRoomSnapshot(room, guestId, getOrigin(req)) });
    return;
  }

  // ── 유저 스탯 조회 ─────────────────────────────────────────
  const statsMatch = pathname.match(/^\/api\/users\/([^/]+)\/stats$/);
  if (method === "GET" && statsMatch) {
    const guestId = decodeURIComponent(statsMatch[1]);

    let gamesPlayed = 0;
    let gamesWon = 0;
    let totalAttempts = 0;
    let wordGames = 0;
    let numberGames = 0;

    for (const room of Object.values(state.rooms)) {
      const player = room.players[guestId];
      if (!player || room.status !== "finished") continue;

      gamesPlayed++;
      if (player.status === "won") gamesWon++;
      totalAttempts += player.attempts.length;
      if (room.settings.gameType === "wordle") wordGames++;
      else numberGames++;
    }

    writeJson(res, 200, {
      stats: {
        guestId,
        gamesPlayed,
        gamesWon,
        gamesLost: gamesPlayed - gamesWon,
        winRate: gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0,
        averageAttempts:
          gamesPlayed > 0 ? Math.round((totalAttempts / gamesPlayed) * 10) / 10 : 0,
        wordGames,
        numberGames
      }
    });
    return;
  }

  // ── 방 단건 조회 ───────────────────────────────────────────
  const roomMatch = pathname.match(/^\/api\/rooms\/([A-Z0-9]+)$/);
  if (method === "GET" && roomMatch) {
    const roomId = roomMatch[1];
    const guestId = url.searchParams.get("guestId");
    const room = getRoom(roomId);
    writeJson(res, 200, { room: buildRoomSnapshot(room, guestId, getOrigin(req)) });
    return;
  }

  // ── 방 액션 (join / start / guess / rematch) ───────────────
  const actionMatch = pathname.match(/^\/api\/rooms\/([A-Z0-9]+)\/(join|start|guess|rematch)$/);
  if (!actionMatch || method !== "POST") {
    throw new GameError("요청한 경로를 찾을 수 없습니다.", 404);
  }

  const [, roomId, action] = actionMatch;
  const room = getRoom(roomId);
  const body = await readJson(req);
  const { guestId, name, guess, password } = body ?? {};
  ensureGuestId(guestId);

  switch (action) {
    case "join": {
      joinRoom(room, { guestId, name, password });
      schedulePersist();
      broadcastRoom(roomId);
      writeJson(res, 200, { room: buildRoomSnapshot(room, guestId, getOrigin(req)) });
      return;
    }
    case "start": {
      startRoom(room, { guestId });
      schedulePersist();
      broadcastRoom(roomId);
      writeJson(res, 200, { room: buildRoomSnapshot(room, guestId, getOrigin(req)) });
      return;
    }
    case "guess": {
      const payload = submitGuess(room, { guestId, guess });
      schedulePersist();
      broadcastRoom(roomId);
      writeJson(res, 200, {
        room: buildRoomSnapshot(room, guestId, getOrigin(req)),
        result: payload.result
      });
      return;
    }
    case "rematch": {
      resetRoom(room, { guestId });
      schedulePersist();
      broadcastRoom(roomId);
      writeJson(res, 200, { room: buildRoomSnapshot(room, guestId, getOrigin(req)) });
      return;
    }
    default:
      throw new GameError("지원하지 않는 요청입니다.", 404);
  }
}

async function serveApp(req, res, url) {
  const pathname = decodeURIComponent(url.pathname);
  let filePath = path.join(PUBLIC_DIR, pathname);

  if (pathname === "/" || pathname.startsWith("/room/")) {
    filePath = path.join(PUBLIC_DIR, "index.html");
  }

  if (!filePath.startsWith(PUBLIC_DIR)) {
    throw new GameError("잘못된 파일 경로입니다.", 400);
  }

  const extension = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] ?? "application/octet-stream";

  try {
    const contents = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(contents);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new GameError("요청한 리소스를 찾을 수 없습니다.", 404);
    }
    throw error;
  }
}

function handleUpgrade(req, socket) {
  const url = new URL(req.url, getOrigin(req));
  if (url.pathname !== "/ws") {
    socket.destroy();
    return;
  }

  const roomId = url.searchParams.get("roomId")?.toUpperCase();
  const guestId = url.searchParams.get("guestId");
  if (!roomId || !guestId || !state.rooms[roomId]) {
    socket.destroy();
    return;
  }

  const key = req.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }

  const accept = crypto
    .createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");

  socket.write(
    [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${accept}`,
      "\r\n"
    ].join("\r\n")
  );

  socket.setNoDelay(true);

  registerSocket(roomId, guestId, socket);
  const room = state.rooms[roomId];
  markPlayerConnection(room, guestId, true);
  schedulePersist();
  sendSnapshot(socket, room, guestId, getOrigin(req));
  broadcastRoom(roomId);

  socket.on("data", () => {
    // MVP에서는 서버 푸시 전용. 클라이언트 프레임은 무시.
  });

  socket.on("close", () => {
    unregisterSocket(socket);
  });

  socket.on("error", () => {
    unregisterSocket(socket);
  });

  socket.on("end", () => {
    unregisterSocket(socket);
  });
}

function registerSocket(roomId, guestId, socket) {
  if (!roomSockets.has(roomId)) {
    roomSockets.set(roomId, new Set());
  }

  roomSockets.get(roomId).add(socket);
  socketMeta.set(socket, { roomId, guestId });
}

function unregisterSocket(socket) {
  const meta = socketMeta.get(socket);
  if (!meta) {
    return;
  }

  socketMeta.delete(socket);

  const sockets = roomSockets.get(meta.roomId);
  if (sockets) {
    sockets.delete(socket);
    if (sockets.size === 0) {
      roomSockets.delete(meta.roomId);
    }
  }

  const room = state.rooms[meta.roomId];
  if (room && !hasActiveGuestSocket(meta.roomId, meta.guestId)) {
    markPlayerConnection(room, meta.guestId, false);
    schedulePersist();
    broadcastRoom(meta.roomId);
  }
}

function hasActiveGuestSocket(roomId, guestId) {
  const sockets = roomSockets.get(roomId);
  if (!sockets) {
    return false;
  }

  for (const socket of sockets) {
    const meta = socketMeta.get(socket);
    if (meta?.guestId === guestId && !socket.destroyed) {
      return true;
    }
  }
  return false;
}

function broadcastRoom(roomId) {
  const room = state.rooms[roomId];
  const sockets = roomSockets.get(roomId);
  if (!room || !sockets) {
    return;
  }

  for (const socket of sockets) {
    const meta = socketMeta.get(socket);
    if (!meta || socket.destroyed) {
      continue;
    }
    sendSnapshot(socket, room, meta.guestId);
  }
}

function sendSnapshot(socket, room, guestId, origin = "") {
  const payload = JSON.stringify({
    type: "snapshot",
    room: buildRoomSnapshot(room, guestId, origin)
  });
  socket.write(encodeWebSocketFrame(payload));
}

function encodeWebSocketFrame(payload) {
  const payloadBuffer = Buffer.from(payload);
  const length = payloadBuffer.length;

  if (length < 126) {
    return Buffer.concat([Buffer.from([0x81, length]), payloadBuffer]);
  }

  if (length < 65536) {
    const header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
    return Buffer.concat([header, payloadBuffer]);
  }

  const header = Buffer.alloc(10);
  header[0] = 0x81;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(length), 2);
  return Buffer.concat([header, payloadBuffer]);
}

async function loadState() {
  try {
    const raw = await fs.readFile(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    state.rooms = hydrateRooms(parsed.rooms ?? {});
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to load state:", error);
    }
    state.rooms = {};
  }
}

function schedulePersist() {
  if (persistTimer) {
    clearTimeout(persistTimer);
  }

  persistTimer = setTimeout(async () => {
    persistTimer = null;
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(
        STATE_FILE,
        JSON.stringify(
          {
            rooms: state.rooms
          },
          null,
          2
        ),
        "utf8"
      );
    } catch (error) {
      console.error("Failed to persist state:", error);
    }
  }, 100);
}

async function readJson(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new GameError("JSON 형식의 요청만 지원합니다.", 400);
  }
}

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(payload));
}

function handleError(res, error) {
  const statusCode = error instanceof GameError ? error.statusCode : 500;
  const message = error instanceof GameError ? error.message : "서버 오류가 발생했습니다.";

  if (statusCode >= 500) {
    console.error(error);
  }

  writeJson(res, statusCode, {
    error: message
  });
}

function getRoom(roomId) {
  const room = state.rooms[roomId];
  if (!room) {
    throw new GameError("존재하지 않거나 만료된 방입니다.", 404);
  }
  return room;
}

function ensureGuestId(guestId) {
  if (!guestId || typeof guestId !== "string") {
    throw new GameError("게스트 ID가 필요합니다.", 400);
  }
}

function generateRoomId() {
  while (true) {
    let id = "";
    for (let index = 0; index < 6; index += 1) {
      const randomIndex = crypto.randomInt(0, ROOM_CODE_ALPHABET.length);
      id += ROOM_CODE_ALPHABET[randomIndex];
    }

    if (!state.rooms[id]) {
      return id;
    }
  }
}

function getOrigin(req) {
  const host = req.headers.host || `${HOST}:${PORT}`;
  return `http://${host}`;
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};
