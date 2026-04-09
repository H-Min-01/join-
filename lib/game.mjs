import crypto from "node:crypto";

export const GAME_LIMITS = {
  wordle: {
    minLength: 4,
    maxLength: 7,
    defaultAttempts: 6
  },
  baseball: {
    minLength: 3,
    maxLength: 5,
    defaultAttempts: 10
  }
};

export const WORDS_BY_LENGTH = {
  4: [
    "ARCH", "BOLT", "CODE", "ECHO", "FIRE", "GAME", "GLOW", "JUMP", "KING",
    "LINK", "MOON", "NOTE", "PLAY", "RING", "SAND", "STAR", "TIME", "WAVE",
    "WIND", "ZONE"
  ],
  5: [
    "APPLE", "BRICK", "CLOUD", "DREAM", "FIELD", "FRAME", "GRAPE", "LIGHT",
    "MATCH", "MUSIC", "PARTY", "PLANE", "QUEST", "RIVER", "SHARE", "SMILE",
    "STONE", "STORM", "TRAIN", "WORLD"
  ],
  6: [
    "BRIDGE", "BUTTON", "CANDLE", "FRIEND", "GALAXY", "GARDEN", "POCKET",
    "PUZZLE", "ROCKET", "SCREEN", "SHADOW", "SILVER", "SPIRIT", "STREAM",
    "SUMMER", "TARGET", "THRONE", "TUNNEL", "WINDOW", "WINTER"
  ],
  7: [
    "BALANCE", "CAPTAIN", "COMPASS", "CRYSTAL", "JOURNEY", "KINGDOM", "LIBRARY",
    "MEADOWS", "MYSTERY", "NETWORK", "PASSION", "PICTURE", "SUNRISE", "THUNDER",
    "TRIGGER", "VICTORY", "VIOLETS", "WHISPER"
  ]
};

const PLAYER_COLORS = [
  "#ff6b4a",
  "#0f8b8d",
  "#7b5cff",
  "#f59e0b",
  "#ef476f",
  "#118ab2",
  "#22c55e",
  "#ff7f50"
];

export class GameError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "GameError";
    this.statusCode = statusCode;
  }
}

export function createGuestSession(name = "") {
  const guestId = crypto.randomUUID();
  return {
    guestId,
    name: sanitizeName(name) || defaultGuestName(guestId),
    createdAt: new Date().toISOString()
  };
}

export function createRoom({ roomId, guestId, name, settings, now = new Date().toISOString() }) {
  const normalized = normalizeSettings(settings);
  const room = {
    id: roomId,
    hostGuestId: guestId,
    status: "lobby",
    createdAt: now,
    updatedAt: now,
    startedAt: null,
    finishedAt: null,
    expiresAt: new Date(Date.parse(now) + 24 * 60 * 60 * 1000).toISOString(),
    winnerGuestId: null,
    settings: normalized,
    secret: null,
    players: {}
  };

  joinRoom(room, { guestId, name, now });
  return room;
}

export function joinRoom(room, { guestId, name, password, now = new Date().toISOString() }) {
  const existing = room.players[guestId];

  if (!existing && room.status !== "lobby") {
    throw new GameError("이미 진행 중인 방에는 새로 입장할 수 없습니다.", 409);
  }

  if (!existing) {
    const playerCount = Object.keys(room.players).length;
    if (playerCount >= room.settings.maxPlayers) {
      throw new GameError("방이 가득 찼습니다.", 409);
    }

    if (room.settings.password && room.settings.password !== password) {
      throw new GameError("비밀번호가 틀렸습니다.", 403);
    }

    room.players[guestId] = createPlayer(guestId, name, now);
  } else {
    existing.name = sanitizeName(name) || existing.name;
    existing.connected = true;
    existing.lastSeenAt = now;
  }

  room.updatedAt = now;
  return room.players[guestId];
}

export function markPlayerConnection(room, guestId, connected, now = new Date().toISOString()) {
  const player = room.players[guestId];
  if (!player) {
    return;
  }

  player.connected = connected;
  player.lastSeenAt = now;
  room.updatedAt = now;
}

export function startRoom(room, { guestId, now = new Date().toISOString() }) {
  ensureHost(room, guestId);

  if (room.status !== "lobby") {
    throw new GameError("대기실 상태에서만 게임을 시작할 수 있습니다.", 409);
  }

  const players = Object.values(room.players);
  if (players.length === 0) {
    throw new GameError("참여자가 없어 게임을 시작할 수 없습니다.", 400);
  }

  room.secret = createSecret(room.settings);
  room.status = "playing";
  room.startedAt = now;
  room.finishedAt = null;
  room.winnerGuestId = null;
  room.updatedAt = now;

  for (const player of players) {
    player.attempts = [];
    player.status = "playing";
    player.solved = false;
    player.finishedAt = null;
    player.lastSeenAt = now;
  }

  return room;
}

export function submitGuess(room, { guestId, guess, now = new Date().toISOString() }) {
  if (room.status !== "playing") {
    throw new GameError("현재 진행 중인 게임이 없습니다.", 409);
  }

  const player = room.players[guestId];
  if (!player) {
    throw new GameError("방에 참여한 사용자만 추측을 제출할 수 있습니다.", 403);
  }

  if (player.status !== "playing") {
    throw new GameError("이미 완료된 플레이어는 더 이상 추측을 제출할 수 없습니다.", 409);
  }

  const normalizedGuess = normalizeGuess(guess, room.settings);
  const result = evaluateGuess(room, normalizedGuess);

  player.attempts.push({
    guess: normalizedGuess,
    feedback: result.feedback,
    summary: result.summary,
    solved: result.solved,
    submittedAt: now
  });
  player.lastSeenAt = now;

  if (result.solved) {
    player.solved = true;
    player.status = "won";
    player.finishedAt = now;
    room.status = "finished";
    room.winnerGuestId = guestId;
    room.finishedAt = now;
    room.expiresAt = new Date(Date.parse(now) + 60 * 60 * 1000).toISOString();

    for (const other of Object.values(room.players)) {
      if (other.guestId !== guestId && other.status === "playing") {
        other.status = "lost";
        other.finishedAt = now;
      }
    }
  } else {
    const maxAtt = getMaxAttempts(room.settings);
    if (maxAtt !== null && player.attempts.length >= maxAtt) {
      player.status = "lost";
      player.finishedAt = now;

      if (allPlayersFinished(room)) {
        room.status = "finished";
        room.finishedAt = now;
        room.winnerGuestId = null;
        room.expiresAt = new Date(Date.parse(now) + 60 * 60 * 1000).toISOString();
      }
    }
  }

  room.updatedAt = now;
  return {
    player,
    result
  };
}

export function resetRoom(room, { guestId, now = new Date().toISOString() }) {
  ensureHost(room, guestId);

  room.status = "lobby";
  room.secret = null;
  room.startedAt = null;
  room.finishedAt = null;
  room.winnerGuestId = null;
  room.updatedAt = now;
  room.expiresAt = new Date(Date.parse(now) + 24 * 60 * 60 * 1000).toISOString();

  for (const player of Object.values(room.players)) {
    player.attempts = [];
    player.status = "waiting";
    player.solved = false;
    player.finishedAt = null;
    player.lastSeenAt = now;
  }

  return room;
}

export function buildRoomSnapshot(room, viewerGuestId, origin = "") {
  const viewer = room.players[viewerGuestId] ?? null;
  const maxAtt = getMaxAttempts(room.settings);

  const players = Object.values(room.players)
    .sort(sortPlayers(room.hostGuestId))
    .map((player) => ({
      guestId: player.guestId,
      name: player.name,
      color: player.color,
      isHost: player.guestId === room.hostGuestId,
      connected: Boolean(player.connected),
      joinedAt: player.joinedAt,
      lastSeenAt: player.lastSeenAt,
      attemptCount: player.attempts.length,
      status: player.status,
      solved: Boolean(player.solved),
      finishedAt: player.finishedAt,
      maxAttempts: maxAtt,
      progressPercent: maxAtt === null ? 0 : Math.round((player.attempts.length / maxAtt) * 100)
    }));

  // password는 노출하지 않고 hasPassword로 대체
  const settings = {
    gameType: room.settings.gameType,
    visibility: room.settings.visibility,
    length: room.settings.length,
    attempts: room.settings.attempts,
    runtime: room.settings.runtime,
    maxPlayers: room.settings.maxPlayers,
    title: room.settings.title,
    hasPassword: Boolean(room.settings.password),
    isSolo: Boolean(room.settings.isSolo)
  };

  return {
    id: room.id,
    shareUrl: origin ? `${origin}/room/${room.id}` : `/room/${room.id}`,
    isSolo: Boolean(room.settings.isSolo),
    title: room.settings.title || null,
    hostGuestId: room.hostGuestId,
    status: room.status,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    startedAt: room.startedAt,
    finishedAt: room.finishedAt,
    expiresAt: room.expiresAt ?? null,
    settings,
    maxAttempts: maxAtt,
    viewerGuestId,
    me: viewer
      ? {
          guestId: viewer.guestId,
          name: viewer.name,
          color: viewer.color,
          isHost: viewer.guestId === room.hostGuestId,
          status: viewer.status,
          solved: Boolean(viewer.solved),
          connected: Boolean(viewer.connected),
          attempts: viewer.attempts,
          attemptCount: viewer.attempts.length,
          finishedAt: viewer.finishedAt
        }
      : null,
    players,
    result:
      room.status === "finished"
        ? {
            winnerGuestId: room.winnerGuestId,
            winnerName: room.winnerGuestId ? room.players[room.winnerGuestId]?.name ?? null : null,
            secret: room.secret,
            hasWinner: Boolean(room.winnerGuestId)
          }
        : null
  };
}

export function hydrateRooms(rawRooms = {}) {
  const rooms = {};

  for (const [roomId, rawRoom] of Object.entries(rawRooms)) {
    const room = {
      id: rawRoom.id ?? roomId,
      hostGuestId: rawRoom.hostGuestId,
      status: rawRoom.status ?? "lobby",
      createdAt: rawRoom.createdAt ?? new Date().toISOString(),
      updatedAt: rawRoom.updatedAt ?? rawRoom.createdAt ?? new Date().toISOString(),
      startedAt: rawRoom.startedAt ?? null,
      finishedAt: rawRoom.finishedAt ?? null,
      expiresAt: rawRoom.expiresAt ?? null,
      winnerGuestId: rawRoom.winnerGuestId ?? null,
      settings: normalizeSettings(rawRoom.settings),
      secret: rawRoom.secret ?? null,
      players: {}
    };

    for (const [guestId, rawPlayer] of Object.entries(rawRoom.players ?? {})) {
      room.players[guestId] = {
        guestId,
        name: sanitizeName(rawPlayer.name) || defaultGuestName(guestId),
        color: rawPlayer.color || colorForGuest(guestId),
        connected: false,
        joinedAt: rawPlayer.joinedAt ?? room.createdAt,
        lastSeenAt: rawPlayer.lastSeenAt ?? rawPlayer.joinedAt ?? room.createdAt,
        attempts: Array.isArray(rawPlayer.attempts) ? rawPlayer.attempts : [],
        status: rawPlayer.status ?? "waiting",
        solved: Boolean(rawPlayer.solved),
        finishedAt: rawPlayer.finishedAt ?? null
      };
    }

    rooms[roomId] = room;
  }

  return rooms;
}

export function normalizeSettings(settings = {}) {
  const gameType = settings.gameType === "baseball" ? "baseball" : "wordle";
  // "invite"는 이전 값이므로 "private"와 동일하게 처리
  const visibility = settings.visibility === "public" ? "public" : "private";
  const rawLength = Number(settings.length);
  const limits = GAME_LIMITS[gameType];
  const defaultLength = gameType === "wordle" ? 5 : 4;
  const length = Number.isFinite(rawLength)
    ? clamp(rawLength, limits.minLength, limits.maxLength)
    : defaultLength;

  // attempts: 숫자 또는 null(무제한)
  let attempts;
  if (settings.attempts === null || settings.attempts === "unlimited") {
    attempts = null;
  } else {
    const n = Number(settings.attempts);
    attempts = Number.isFinite(n) && n > 0 ? clamp(n, 1, 30) : limits.defaultAttempts;
  }

  // runtime: 초 단위 숫자 또는 null(무제한)
  let runtime;
  if (settings.runtime === null || settings.runtime === "unlimited" || settings.runtime === 0) {
    runtime = null;
  } else {
    const n = Number(settings.runtime);
    runtime = Number.isFinite(n) && n > 0 ? clamp(n, 30, 600) : null;
  }

  // maxPlayers: 1~10 (solo는 1)
  const rawMaxPlayers = Number(settings.maxPlayers);
  const maxPlayers = Number.isFinite(rawMaxPlayers)
    ? clamp(rawMaxPlayers, 1, 10)
    : 4;

  return {
    gameType,
    visibility,
    length,
    attempts,
    runtime,
    maxPlayers,
    title: sanitizeTitle(settings.title),
    password: settings.password ? String(settings.password).slice(0, 20) : null,
    isSolo: Boolean(settings.isSolo)
  };
}

export function getMaxAttempts(settings) {
  // null = 무제한
  if (settings.attempts === null || settings.attempts === undefined) {
    return GAME_LIMITS[settings.gameType].defaultAttempts;
  }
  return settings.attempts;
}

function evaluateGuess(room, guess) {
  if (room.settings.gameType === "baseball") {
    const result = evaluateBaseball(room.secret, guess);
    return {
      solved: result.strikes === room.settings.length,
      feedback: result.feedback,
      summary: `${result.strikes}S ${result.balls}B`
    };
  }

  const feedback = evaluateWordle(room.secret, guess);
  return {
    solved: guess === room.secret,
    feedback,
    summary: feedback.map((item) => item.state).join(",")
  };
}

export function evaluateWordle(secret, guess) {
  const feedback = Array.from({ length: secret.length }, (_, index) => ({
    letter: guess[index],
    state: "absent"
  }));
  const remaining = new Map();

  for (let index = 0; index < secret.length; index += 1) {
    if (secret[index] === guess[index]) {
      feedback[index].state = "correct";
    } else {
      remaining.set(secret[index], (remaining.get(secret[index]) ?? 0) + 1);
    }
  }

  for (let index = 0; index < secret.length; index += 1) {
    if (feedback[index].state === "correct") {
      continue;
    }

    const letter = guess[index];
    const count = remaining.get(letter) ?? 0;
    if (count > 0) {
      feedback[index].state = "present";
      remaining.set(letter, count - 1);
    }
  }

  return feedback;
}

export function evaluateBaseball(secret, guess) {
  let strikes = 0;
  let balls = 0;

  for (let index = 0; index < secret.length; index += 1) {
    if (secret[index] === guess[index]) {
      strikes += 1;
    } else if (secret.includes(guess[index])) {
      balls += 1;
    }
  }

  return {
    strikes,
    balls,
    feedback: [
      {
        label: "strikes",
        value: strikes
      },
      {
        label: "balls",
        value: balls
      }
    ]
  };
}

function createSecret(settings) {
  if (settings.gameType === "baseball") {
    return createBaseballSecret(settings.length);
  }

  const words = WORDS_BY_LENGTH[settings.length];
  return words[Math.floor(Math.random() * words.length)];
}

function createBaseballSecret(length) {
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const secret = [];

  while (secret.length < length) {
    const index = Math.floor(Math.random() * digits.length);
    const digit = digits.splice(index, 1)[0];
    if (secret.length === 0 && digit === "0") {
      digits.push(digit);
      continue;
    }
    secret.push(digit);
  }

  return secret.join("");
}

function normalizeGuess(guess, settings) {
  const raw = String(guess ?? "").trim().toUpperCase();
  if (raw.length !== settings.length) {
    throw new GameError(`정확히 ${settings.length}자리로 입력해 주세요.`, 400);
  }

  if (settings.gameType === "baseball") {
    if (!/^\d+$/.test(raw)) {
      throw new GameError("숫자야구는 숫자만 입력할 수 있습니다.", 400);
    }
    if (raw[0] === "0") {
      throw new GameError("첫 번째 숫자는 0이 될 수 없습니다.", 400);
    }
    if (new Set(raw).size !== raw.length) {
      throw new GameError("숫자야구는 중복 없는 숫자만 입력할 수 있습니다.", 400);
    }
    return raw;
  }

  if (!/^[A-Z]+$/.test(raw)) {
    throw new GameError("Wordle은 영문 알파벳만 입력할 수 있습니다.", 400);
  }

  return raw;
}

function createPlayer(guestId, name, now) {
  return {
    guestId,
    name: sanitizeName(name) || defaultGuestName(guestId),
    color: colorForGuest(guestId),
    connected: true,
    joinedAt: now,
    lastSeenAt: now,
    attempts: [],
    status: "waiting",
    solved: false,
    finishedAt: null
  };
}

function allPlayersFinished(room) {
  return Object.values(room.players).every((player) => player.status !== "playing");
}

function ensureHost(room, guestId) {
  if (room.hostGuestId !== guestId) {
    throw new GameError("방장만 실행할 수 있는 작업입니다.", 403);
  }
}

function sortPlayers(hostGuestId) {
  return (left, right) => {
    if (left.guestId === hostGuestId) {
      return -1;
    }
    if (right.guestId === hostGuestId) {
      return 1;
    }
    return left.joinedAt.localeCompare(right.joinedAt);
  };
}

function sanitizeName(input) {
  return String(input ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 18);
}

function sanitizeTitle(input) {
  return String(input ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 50);
}

function defaultGuestName(guestId) {
  return `게스트-${guestId.slice(0, 4)}`;
}

function colorForGuest(guestId) {
  const hash = guestId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PLAYER_COLORS[hash % PLAYER_COLORS.length];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
