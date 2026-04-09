const app = document.querySelector("#app");
const toastStack = document.querySelector("#toast-stack");
const modalRoot = document.querySelector("#modal-root");

const state = {
  session: null,
  room: null,
  roomId: null,
  joinError: "",
  draft: "",
  socket: null,
  reconnectTimer: null,
  wsState: "idle",
  timerInterval: null,
  timerRemaining: null,
  // 로비 상태
  menuOpen: false,
  lobbyView: "home",  // "home" | "find"
  findRooms: null,
  findSearch: ""
};

const DEFAULT_HOME_FORM = {
  createGameType: "wordle",
  createVisibility: "private",
  createLength: 5,
  createName: "",
  joinName: "",
  joinCode: ""
};

const DEFAULT_SOLO_FORM = {
  gameType: "wordle",
  length: 5,
  runtime: 180,
  attempts: 6
};

const DEFAULT_CREATE_ROOM_FORM = {
  gameType: "wordle",
  length: 5,
  runtime: null,
  attempts: 6,
  maxPlayers: 4,
  visibility: "public",
  password: "",
  title: ""
};

let homeForm = { ...DEFAULT_HOME_FORM };
let soloForm = { ...DEFAULT_SOLO_FORM };
let createRoomForm = { ...DEFAULT_CREATE_ROOM_FORM };

// ── 부트스트랩 ────────────────────────────────────────────────────────────────

boot().catch((error) => {
  console.error(error);
  showToast("앱을 초기화하지 못했습니다.", "error");
});

async function boot() {
  await ensureSession();
  loadSoloDefaults();
  window.addEventListener("popstate", handleRoute);
  await handleRoute();
}

async function handleRoute() {
  state.roomId = getRoomIdFromPath();
  state.joinError = "";
  state.draft = "";
  state.lobbyView = "home";
  state.menuOpen = false;
  state.findRooms = null;
  state.findSearch = "";
  disconnectSocket();

  if (!state.roomId) {
    state.room = null;
    render();
    return;
  }

  try {
    const payload = await api(`/api/rooms/${state.roomId}/join`, {
      method: "POST",
      body: {
        guestId: state.session.guestId,
        name: state.session.name
      }
    });
    state.room = normalizeRoom(payload.room);
    render();
    connectSocket(state.roomId);
  } catch (error) {
    state.room = null;
    state.joinError = error.message;
    render();
  }
}

async function ensureSession() {
  const raw = localStorage.getItem("puzzle-session-v1");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.guestId && parsed.name) {
        state.session = parsed;
        return;
      }
    } catch {
      localStorage.removeItem("puzzle-session-v1");
    }
  }

  const payload = await api("/api/session", { method: "POST", body: {} });
  state.session = payload.session;
  persistSession();
}

function loadSoloDefaults() {
  const saved = localStorage.getItem("default_settings");
  if (saved) {
    try {
      soloForm = { ...DEFAULT_SOLO_FORM, ...JSON.parse(saved) };
    } catch {
      soloForm = { ...DEFAULT_SOLO_FORM };
    }
  }
}

function persistSession() {
  localStorage.setItem("puzzle-session-v1", JSON.stringify(state.session));
}

function render() {
  if (state.roomId && state.joinError) {
    renderJoinError();
    return;
  }
  if (!state.room) {
    renderHome();
    return;
  }
  renderRoom();
}

// ── 홈 (로비) ─────────────────────────────────────────────────────────────────

function renderHome() {
  if (state.lobbyView === "find") {
    renderFindRoomView();
  } else {
    renderLobbyHome();
  }
}

function renderLobbyHome() {
  app.innerHTML = `
    <section class="lobby-screen">
      ${renderTopBarHtml()}

      <div class="lobby-center" id="lobby-center">
        <div class="slide-menu slide-menu--left" id="menu-left">
          <button class="menu-btn menu-btn--solo" id="solo-play-btn">🎮 SOLO PLAY</button>
        </div>

        <button class="join-btn" id="join-btn">JOIN!</button>

        <div class="slide-menu slide-menu--right" id="menu-right">
          <button class="menu-btn menu-btn--create" id="create-room-btn">✚ CREATE ROOM</button>
          <button class="menu-btn" id="find-room-btn">🔍 FIND ROOM</button>
        </div>
      </div>

      ${renderCodeBarHtml()}
    </section>
  `;

  // 메뉴 열림 상태 복원
  if (state.menuOpen) {
    document.querySelector("#menu-left")?.classList.add("open");
    document.querySelector("#menu-right")?.classList.add("open");
    document.querySelector("#join-btn")?.classList.add("active");
  }

  // JOIN 버튼 토글
  document.querySelector("#join-btn").addEventListener("click", () => {
    state.menuOpen = !state.menuOpen;
    document.querySelector("#menu-left").classList.toggle("open", state.menuOpen);
    document.querySelector("#menu-right").classList.toggle("open", state.menuOpen);
    document.querySelector("#join-btn").classList.toggle("active", state.menuOpen);
  });

  document.querySelector("#solo-play-btn").addEventListener("click", openSoloModal);
  document.querySelector("#create-room-btn").addEventListener("click", openCreateRoomModal);
  document.querySelector("#find-room-btn").addEventListener("click", async () => {
    state.lobbyView = "find";
    state.menuOpen = false;
    state.findRooms = null;
    renderHome();
  });

  attachTopBarListeners();
  attachCodeBarListener();
}

// ── TopBar ────────────────────────────────────────────────────────────────────

function renderTopBarHtml() {
  return `
    <header class="topbar">
      <button class="topbar__btn" id="topbar-profile" title="프로필">👤</button>
      <button class="topbar__brand" id="topbar-brand">Join!</button>
      <div class="topbar__actions">
        <button class="topbar__btn" id="topbar-help" title="도움말">❓</button>
        <button class="topbar__btn" id="topbar-settings" title="설정">⚙️</button>
      </div>
    </header>
  `;
}

function attachTopBarListeners() {
  document.querySelector("#topbar-profile")?.addEventListener("click", openProfileModal);
  document.querySelector("#topbar-brand")?.addEventListener("click", () => {
    state.menuOpen = false;
    state.lobbyView = "home";
    renderHome();
  });
  document.querySelector("#topbar-help")?.addEventListener("click", openHelpModal);
  document.querySelector("#topbar-settings")?.addEventListener("click", openSettingsModal);
}

// ── 코드 바 ───────────────────────────────────────────────────────────────────

function renderCodeBarHtml() {
  return `
    <div class="code-bar">
      <input
        class="code-bar__input"
        id="code-input"
        placeholder="ENTER CODE / LINK"
        maxlength="80"
        spellcheck="false"
        autocomplete="off"
      />
      <button class="code-bar__btn" id="code-submit" title="입장">🔍</button>
    </div>
  `;
}

function attachCodeBarListener() {
  const input = document.querySelector("#code-input");
  const btn = document.querySelector("#code-submit");
  if (!input || !btn) return;

  async function submit() {
    const roomId = parseCodeOrUrl(input.value);
    if (!roomId) {
      showToast("유효하지 않은 코드 또는 링크입니다.", "error");
      return;
    }
    navigateTo(`/room/${roomId}`);
    await handleRoute();
  }

  btn.addEventListener("click", submit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });
}

function parseCodeOrUrl(input) {
  const trimmed = (input || "").trim();
  // URL인 경우
  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/^\/room\/([A-Z0-9]+)$/i);
    if (match) return match[1].toUpperCase();
  } catch {}
  // 코드 직접 입력
  const code = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return code.length >= 4 ? code.slice(0, 6) : null;
}

// ── FIND ROOM ─────────────────────────────────────────────────────────────────

function renderFindRoomView() {
  app.innerHTML = `
    <section class="lobby-screen">
      ${renderTopBarHtml()}

      <div class="find-room-view">
        <div class="find-room__header">
          <button class="ghost-button" id="find-back">← 뒤로</button>
          <h2>FIND ROOM</h2>
          <input
            class="find-room__search"
            id="find-search"
            placeholder="방 제목 검색..."
            value="${escapeHtml(state.findSearch)}"
          />
          <button class="tonal-button" id="find-refresh">새로고침</button>
        </div>

        <div class="find-room__list" id="find-list">
          <p class="empty-state">방 목록을 불러오는 중...</p>
        </div>
      </div>

      ${renderCodeBarHtml()}
    </section>
  `;

  attachTopBarListeners();
  attachCodeBarListener();

  document.querySelector("#find-back").addEventListener("click", () => {
    state.lobbyView = "home";
    renderHome();
  });

  let searchDebounce = null;
  document.querySelector("#find-search").addEventListener("input", (e) => {
    state.findSearch = e.target.value;
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => loadFindRooms(), 380);
  });

  document.querySelector("#find-refresh").addEventListener("click", () => loadFindRooms());

  loadFindRooms();
}

async function loadFindRooms() {
  const listEl = document.querySelector("#find-list");
  try {
    const params = new URLSearchParams({ limit: "50" });
    if (state.findSearch) params.set("search", state.findSearch);
    const payload = await api(`/api/rooms?${params}`);
    state.findRooms = payload.rooms;
    if (listEl) {
      listEl.innerHTML = renderRoomCards(state.findRooms);
      attachRoomCardListeners();
    }
  } catch (error) {
    if (listEl) {
      listEl.innerHTML = '<p class="empty-state">방 목록을 불러오지 못했습니다.</p>';
    }
    showToast("방 목록을 불러오지 못했습니다.", "error");
  }
}

function renderRoomCards(rooms) {
  if (!rooms || rooms.length === 0) {
    return '<p class="empty-state">현재 입장 가능한 공개 방이 없습니다.</p>';
  }
  return rooms.map(renderRoomCard).join("");
}

function renderRoomCard(room) {
  const isWaiting = room.status === "lobby";
  const modeLabel = room.mode === "wordle" ? "Word" : "Number";
  const runtimeLabel = room.runtime ? `${Math.floor(room.runtime / 60)}분` : "무제한";
  const attemptsLabel = room.attempts ? `${room.attempts}회` : "무제한";

  return `
    <article class="room-card">
      <div class="room-card__header">
        <span class="room-card__title">${escapeHtml(room.title)}</span>
        <div class="room-card__badges">
          ${room.hasPassword ? '<span class="badge badge--lock">🔒</span>' : ""}
          <span class="badge ${isWaiting ? "badge--waiting" : "badge--playing"}">
            ${isWaiting ? "🟡 대기" : "🟢 진행"}
          </span>
        </div>
      </div>
      <p class="room-card__meta">
        ${room.players}/${room.maxPlayers}명 &middot; ${modeLabel} ${room.length}자리<br />
        제한: ${runtimeLabel} &middot; ${attemptsLabel}
      </p>
      <button
        class="tonal-button"
        style="width:100%;justify-content:center;"
        data-join-id="${escapeHtml(room.id)}"
        data-has-pw="${room.hasPassword ? "1" : "0"}"
      >방 입장</button>
    </article>
  `;
}

function attachRoomCardListeners() {
  const listEl = document.querySelector("#find-list");
  if (!listEl) return;

  listEl.querySelectorAll("[data-join-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const roomId = btn.dataset.joinId;
      const hasPw = btn.dataset.hasPw === "1";
      joinRoomFromCard(roomId, hasPw);
    });
  });
}

async function joinRoomFromCard(roomId, hasPassword) {
  if (hasPassword) {
    showPasswordModal(roomId);
  } else {
    try {
      const payload = await api("/api/rooms/join-by-code", {
        method: "POST",
        body: {
          guestId: state.session.guestId,
          name: state.session.name,
          code: roomId
        }
      });
      openRoom(normalizeRoom(payload.room));
    } catch (error) {
      showToast(error.message, "error");
    }
  }
}

function showPasswordModal(roomId) {
  showModal(`
    <div class="modal__header">
      <h2>🔒 비밀번호 입력</h2>
      <button class="modal__close" id="modal-close">✕</button>
    </div>
    <p class="muted">비공개 방입니다. 비밀번호를 입력하세요.</p>
    <form id="pw-form" class="form-grid">
      <div class="field">
        <label for="pw-input">비밀번호</label>
        <input id="pw-input" name="password" type="text" maxlength="20" autocomplete="off" />
      </div>
      <div class="button-row">
        <button type="button" class="ghost-button" id="pw-cancel">취소</button>
        <button type="submit" class="button">입장하기</button>
      </div>
    </form>
  `);

  document.querySelector("#modal-close").addEventListener("click", closeModal);
  document.querySelector("#pw-cancel").addEventListener("click", closeModal);
  document.querySelector("#pw-input").focus();

  document.querySelector("#pw-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = document.querySelector("#pw-input").value.trim();
    try {
      const payload = await api("/api/rooms/join-by-code", {
        method: "POST",
        body: {
          guestId: state.session.guestId,
          name: state.session.name,
          code: roomId,
          password
        }
      });
      closeModal();
      openRoom(normalizeRoom(payload.room));
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

// ── CREATE ROOM 모달 ──────────────────────────────────────────────────────────

function openCreateRoomModal() {
  createRoomForm = { ...DEFAULT_CREATE_ROOM_FORM };
  renderCreateRoomModal();
}

function renderCreateRoomModal() {
  const f = createRoomForm;

  const runtimeOptions = [
    { value: "", label: "무제한" },
    { value: "60", label: "1분 (60초)" },
    { value: "120", label: "2분 (120초)" },
    { value: "180", label: "3분 (180초)" },
    { value: "300", label: "5분 (300초)" }
  ].map(({ value, label }) =>
    `<option value="${value}" ${String(f.runtime ?? "") === value ? "selected" : ""}>${label}</option>`
  ).join("");

  const attemptsOptions = [
    { value: "6", label: "6회" },
    { value: "8", label: "8회" },
    { value: "", label: "무제한" }
  ].map(({ value, label }) =>
    `<option value="${value}" ${String(f.attempts ?? "") === value ? "selected" : ""}>${label}</option>`
  ).join("");

  const maxPlayersOptions = [2, 3, 4, 5, 6, 8, 10].map((n) =>
    `<option value="${n}" ${f.maxPlayers === n ? "selected" : ""}>${n}명</option>`
  ).join("");

  showModal(`
    <div class="modal__header">
      <h2>✚ CREATE ROOM</h2>
      <button class="modal__close" id="modal-close">✕</button>
    </div>
    <form id="create-room-form" class="form-grid">
      <div class="field">
        <label for="cr-title">방 제목 <span style="font-weight:400;color:var(--ink-soft)">(선택)</span></label>
        <input id="cr-title" name="title" maxlength="50" placeholder="예: 친구들이랑 Wordle" value="${escapeHtml(f.title)}" />
      </div>
      <div class="field">
        <label for="cr-game-type">게임 모드</label>
        <select id="cr-game-type" name="gameType">
          <option value="wordle" ${f.gameType === "wordle" ? "selected" : ""}>Word (Wordle)</option>
          <option value="baseball" ${f.gameType === "baseball" ? "selected" : ""}>Number (숫자야구)</option>
        </select>
      </div>
      <div class="field">
        <label for="cr-length" id="cr-length-label">${f.gameType === "wordle" ? "글자 수" : "자릿수"}</label>
        <select id="cr-length" name="length">
          ${renderLengthOptions(f.gameType, f.length)}
        </select>
      </div>
      <div class="field">
        <label for="cr-runtime">제한 시간</label>
        <select id="cr-runtime" name="runtime">${runtimeOptions}</select>
      </div>
      <div class="field">
        <label for="cr-attempts">시도 횟수</label>
        <select id="cr-attempts" name="attempts">${attemptsOptions}</select>
      </div>
      <div class="field">
        <label for="cr-maxplayers">최대 인원</label>
        <select id="cr-maxplayers" name="maxPlayers">${maxPlayersOptions}</select>
      </div>
      <div class="field">
        <label for="cr-visibility">공개 여부</label>
        <select id="cr-visibility" name="visibility">
          <option value="public" ${f.visibility === "public" ? "selected" : ""}>Public (방 목록 노출)</option>
          <option value="private" ${f.visibility === "private" ? "selected" : ""}>Private (링크/코드 전용)</option>
        </select>
      </div>
      <div id="cr-password-field" class="field" style="display:${f.visibility === "private" ? "grid" : "none"}">
        <label for="cr-password">비밀번호 <span style="font-weight:400;color:var(--ink-soft)">(선택)</span></label>
        <input id="cr-password" name="password" type="text" maxlength="20" placeholder="4~20자" />
      </div>
      <div class="button-row">
        <button type="button" class="ghost-button" id="cr-cancel">취소</button>
        <button type="submit" class="button">방 만들기</button>
      </div>
    </form>
  `);

  document.querySelector("#modal-close").addEventListener("click", closeModal);
  document.querySelector("#cr-cancel").addEventListener("click", closeModal);

  document.querySelector("#cr-game-type").addEventListener("change", (e) => {
    createRoomForm.gameType = e.target.value;
    createRoomForm.length = e.target.value === "wordle" ? 5 : 4;
    const lengthEl = document.querySelector("#cr-length");
    const labelEl = document.querySelector("#cr-length-label");
    if (lengthEl) lengthEl.innerHTML = renderLengthOptions(createRoomForm.gameType, createRoomForm.length);
    if (labelEl) labelEl.textContent = createRoomForm.gameType === "wordle" ? "글자 수" : "자릿수";
  });

  document.querySelector("#cr-visibility").addEventListener("change", (e) => {
    const pwField = document.querySelector("#cr-password-field");
    if (pwField) pwField.style.display = e.target.value === "private" ? "grid" : "none";
  });

  document.querySelector("#create-room-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = String(formData.get("title") || "").trim();
    const gameType = String(formData.get("gameType"));
    const length = Number(formData.get("length"));
    const runtimeRaw = formData.get("runtime");
    const attemptsRaw = formData.get("attempts");
    const maxPlayers = Number(formData.get("maxPlayers"));
    const visibility = String(formData.get("visibility"));
    const password = String(formData.get("password") || "").trim();

    try {
      const payload = await api("/api/rooms", {
        method: "POST",
        body: {
          guestId: state.session.guestId,
          name: state.session.name,
          settings: {
            title,
            gameType,
            length,
            runtime: runtimeRaw ? Number(runtimeRaw) : null,
            attempts: attemptsRaw ? Number(attemptsRaw) : null,
            maxPlayers,
            visibility,
            password: password || null
          }
        }
      });
      closeModal();
      openRoom(normalizeRoom(payload.room));
      showToast("방을 만들었습니다. 친구를 초대해 보세요.", "success");
    } catch (error) {
      showToast(error.message, "error");
    }
  });
}

// ── SOLO 모달 ─────────────────────────────────────────────────────────────────

function openSoloModal() {
  loadSoloDefaults();
  renderSoloModal();
}

function renderSoloModal() {
  const f = soloForm;
  const runtimeOptions = [
    { value: "60", label: "1분 (60초)" },
    { value: "120", label: "2분 (120초)" },
    { value: "180", label: "3분 (180초)" },
    { value: "300", label: "5분 (300초)" },
    { value: "", label: "무제한" }
  ].map(({ value, label }) =>
    `<option value="${value}" ${String(f.runtime ?? "") === value ? "selected" : ""}>${label}</option>`
  ).join("");

  const attemptsOptions = [
    { value: "6", label: "6회" },
    { value: "8", label: "8회" },
    { value: "", label: "무제한" }
  ].map(({ value, label }) =>
    `<option value="${value}" ${String(f.attempts ?? "") === value ? "selected" : ""}>${label}</option>`
  ).join("");

  showModal(`
    <div class="modal__header">
      <h2>🎮 SOLO 게임 설정</h2>
      <button class="modal__close" id="modal-close">✕</button>
    </div>
    <form id="solo-settings-form" class="form-grid">
      <div class="field">
        <label for="solo-name">닉네임</label>
        <input id="solo-name" name="name" maxlength="18" value="${escapeHtml(state.session.name)}" />
      </div>
      <div class="field">
        <label for="solo-game-type">게임 모드</label>
        <select id="solo-game-type" name="gameType">
          <option value="wordle" ${f.gameType === "wordle" ? "selected" : ""}>Word (Wordle)</option>
          <option value="baseball" ${f.gameType === "baseball" ? "selected" : ""}>Number (숫자야구)</option>
        </select>
      </div>
      <div class="field">
        <label for="solo-length" id="solo-length-label">${f.gameType === "wordle" ? "글자 수" : "자릿수"}</label>
        <select id="solo-length" name="length">
          ${renderLengthOptions(f.gameType, f.length)}
        </select>
      </div>
      <div class="field">
        <label for="solo-runtime">제한 시간</label>
        <select id="solo-runtime" name="runtime">${runtimeOptions}</select>
      </div>
      <div class="field">
        <label for="solo-attempts">시도 횟수</label>
        <select id="solo-attempts" name="attempts">${attemptsOptions}</select>
      </div>
      <div class="button-row">
        <button type="button" class="ghost-button" id="solo-cancel">취소</button>
        <button type="submit" class="button">START GAME</button>
      </div>
    </form>
  `);

  document.querySelector("#modal-close").addEventListener("click", closeModal);
  document.querySelector("#solo-cancel").addEventListener("click", closeModal);

  document.querySelector("#solo-game-type").addEventListener("change", (e) => {
    soloForm.gameType = e.target.value;
    soloForm.length = e.target.value === "wordle" ? 5 : 4;
    const lengthEl = document.querySelector("#solo-length");
    const labelEl = document.querySelector("#solo-length-label");
    if (lengthEl) lengthEl.innerHTML = renderLengthOptions(soloForm.gameType, soloForm.length);
    if (labelEl) labelEl.textContent = soloForm.gameType === "wordle" ? "글자 수" : "자릿수";
  });

  document.querySelector("#solo-settings-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = String(formData.get("name") || "").trim() || state.session.name;
    const gameType = String(formData.get("gameType"));
    const length = Number(formData.get("length"));
    const runtimeRaw = formData.get("runtime");
    const attemptsRaw = formData.get("attempts");
    const runtime = runtimeRaw ? Number(runtimeRaw) : null;
    const attempts = attemptsRaw ? Number(attemptsRaw) : null;

    const settings = { gameType, length, runtime, attempts };
    updateSessionName(name);

    if (!localStorage.getItem("default_settings")) {
      showSaveSettingsPrompt(settings, name);
    } else {
      closeModal();
      await startSoloGame(settings, name);
    }
  });
}

function showSaveSettingsPrompt(settings, name) {
  const modal = modalRoot.querySelector(".modal");
  if (!modal) return;

  modal.innerHTML = `
    <div class="modal__header">
      <h2>기본 설정으로 저장할까요?</h2>
    </div>
    <p class="muted">다음 번 SOLO 게임 시 이 설정이 자동으로 선택됩니다.<br />설정에서 언제든지 변경할 수 있습니다.</p>
    <div class="button-row">
      <button class="ghost-button" id="prompt-no">아니요</button>
      <button class="button" id="prompt-yes">저장하기</button>
    </div>
  `;

  document.querySelector("#prompt-yes").addEventListener("click", async () => {
    localStorage.setItem("default_settings", JSON.stringify(settings));
    closeModal();
    await startSoloGame(settings, name);
  });
  document.querySelector("#prompt-no").addEventListener("click", async () => {
    closeModal();
    await startSoloGame(settings, name);
  });
}

async function startSoloGame(settings, name) {
  try {
    const payload = await api("/api/games/solo", {
      method: "POST",
      body: {
        guestId: state.session.guestId,
        name: name || state.session.name,
        settings
      }
    });
    openRoom(normalizeRoom(payload.room));
    showToast("SOLO 게임을 시작합니다!", "success");
  } catch (error) {
    showToast(error.message, "error");
  }
}

// ── Profile 모달 ──────────────────────────────────────────────────────────────

async function openProfileModal() {
  showModal(`
    <div class="modal__header">
      <h2>👤 프로필</h2>
      <button class="modal__close" id="modal-close">✕</button>
    </div>
    <p class="muted">닉네임: <strong>${escapeHtml(state.session.name)}</strong></p>
    <div id="profile-stats"><p class="muted">통계를 불러오는 중...</p></div>
    <button class="ghost-button" id="profile-close" style="width:100%;justify-content:center;">닫기</button>
  `);

  document.querySelector("#modal-close").addEventListener("click", closeModal);
  document.querySelector("#profile-close").addEventListener("click", closeModal);

  try {
    const { stats } = await api(`/api/users/${encodeURIComponent(state.session.guestId)}/stats`);
    const el = document.querySelector("#profile-stats");
    if (el) {
      el.innerHTML = `
        <div class="metrics">
          <article class="metric">
            <span class="muted">승리</span>
            <strong>${stats.gamesWon}</strong>
          </article>
          <article class="metric">
            <span class="muted">총 게임</span>
            <strong>${stats.gamesPlayed}</strong>
          </article>
          <article class="metric">
            <span class="muted">승률</span>
            <strong>${stats.winRate}%</strong>
          </article>
          <article class="metric">
            <span class="muted">평균 시도</span>
            <strong>${stats.averageAttempts}회</strong>
          </article>
        </div>
        <p class="muted" style="margin-top:4px">Word: ${stats.wordGames}게임 &middot; Number: ${stats.numberGames}게임</p>
      `;
    }
  } catch {
    const el = document.querySelector("#profile-stats");
    if (el) el.innerHTML = '<p class="muted">통계를 불러오지 못했습니다.</p>';
  }
}

// ── Help 모달 ─────────────────────────────────────────────────────────────────

function openHelpModal() {
  showModal(`
    <div class="modal__header">
      <h2>❓ 게임 방법</h2>
      <button class="modal__close" id="modal-close">✕</button>
    </div>
    <div style="display:grid;gap:16px">
      <div>
        <h3 style="margin:0 0 8px">🟢 Word (Wordle)</h3>
        <p class="muted" style="margin:0 0 8px">영단어를 추측하세요. 각 글자별 피드백 제공:</p>
        <ul class="muted" style="padding-left:20px;margin:0;line-height:1.9">
          <li>🟩 초록 — 글자 + 위치 모두 맞음</li>
          <li>🟨 노랑 — 글자는 맞지만 위치 다름</li>
          <li>⬜ 회색 — 해당 글자 없음</li>
        </ul>
      </div>
      <div>
        <h3 style="margin:0 0 8px">🟡 Number (숫자야구)</h3>
        <p class="muted" style="margin:0 0 8px">중복 없는 숫자를 추측하세요. 집계 결과만 표시:</p>
        <ul class="muted" style="padding-left:20px;margin:0;line-height:1.9">
          <li>Strike — 숫자 + 위치 모두 맞음</li>
          <li>Ball — 숫자는 맞지만 위치 다름</li>
        </ul>
      </div>
      <p class="muted">링크나 6자리 코드를 공유하면 친구들이 즉시 입장할 수 있습니다.</p>
    </div>
    <button class="button" id="help-close" style="width:100%;justify-content:center;">확인</button>
  `);

  document.querySelector("#modal-close").addEventListener("click", closeModal);
  document.querySelector("#help-close").addEventListener("click", closeModal);
}

// ── Settings 모달 ─────────────────────────────────────────────────────────────

function openSettingsModal() {
  const saved = JSON.parse(localStorage.getItem("default_settings") || "null");

  showModal(`
    <div class="modal__header">
      <h2>⚙️ 설정</h2>
      <button class="modal__close" id="modal-close">✕</button>
    </div>
    <div class="tabs-row">
      <button class="tab-btn active" data-target="tab-user">유저 설정</button>
      <button class="tab-btn" data-target="tab-game">게임 기본값</button>
    </div>
    <div id="tab-user" class="tab-content">
      <div class="field">
        <label for="settings-name">닉네임</label>
        <input id="settings-name" maxlength="18" value="${escapeHtml(state.session.name)}" />
      </div>
      <div class="button-row">
        <button class="button" id="save-name">저장</button>
      </div>
    </div>
    <div id="tab-game" class="tab-content" style="display:none">
      ${saved
        ? `<p class="muted">저장된 기본값:<br />
            <strong>${saved.gameType === "wordle" ? "Word" : "Number"} / ${saved.length}자리 / ${saved.runtime ? Math.floor(saved.runtime / 60) + "분" : "무제한"} / ${saved.attempts ? saved.attempts + "회" : "무제한"}</strong>
           </p>
           <div class="button-row">
             <button class="ghost-button" id="clear-defaults">기본값 초기화</button>
           </div>`
        : `<p class="muted">저장된 기본 설정이 없습니다.</p>
           <p class="muted">SOLO 게임 시작 시 설정을 저장할 수 있습니다.</p>`
      }
    </div>
  `);

  document.querySelector("#modal-close").addEventListener("click", closeModal);

  // 탭 전환
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => (c.style.display = "none"));
      btn.classList.add("active");
      const target = document.querySelector(`#${btn.dataset.target}`);
      if (target) target.style.display = "";
    });
  });

  document.querySelector("#save-name")?.addEventListener("click", () => {
    const name = document.querySelector("#settings-name").value.trim();
    if (name) {
      updateSessionName(name);
      showToast("닉네임이 변경되었습니다.", "success");
      closeModal();
    }
  });

  document.querySelector("#clear-defaults")?.addEventListener("click", () => {
    localStorage.removeItem("default_settings");
    soloForm = { ...DEFAULT_SOLO_FORM };
    showToast("기본 설정이 초기화되었습니다.", "success");
    closeModal();
  });
}

// ── 모달 유틸 ─────────────────────────────────────────────────────────────────

function showModal(html) {
  modalRoot.innerHTML = `
    <div class="modal-overlay" tabindex="-1">
      <div class="modal">${html}</div>
    </div>
  `;
  const overlay = modalRoot.querySelector(".modal-overlay");
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  overlay.focus();
  document.addEventListener("keydown", handleModalEsc);
}

function closeModal() {
  modalRoot.innerHTML = "";
  document.removeEventListener("keydown", handleModalEsc);
}

function handleModalEsc(e) {
  if (e.key === "Escape") closeModal();
}

// ── 방 화면 ───────────────────────────────────────────────────────────────────

function renderJoinError() {
  app.innerHTML = `
    <section class="page">
      <article class="error-card">
        <span class="hero__eyebrow">입장 실패</span>
        <h1>방에 들어갈 수 없습니다</h1>
        <p>${escapeHtml(state.joinError)}</p>
        <div class="button-row">
          <button class="button" id="go-home">홈으로 돌아가기</button>
        </div>
      </article>
    </section>
  `;
  document.querySelector("#go-home").addEventListener("click", async () => {
    navigateTo("/");
    await handleRoute();
  });
}

function renderRoom() {
  const room = state.room;
  const me = room.me;
  const isHost = Boolean(me?.isHost);
  const isSolo = Boolean(room.isSolo);
  const timeUp = Boolean(
    room.settings.runtime && state.timerRemaining !== null && state.timerRemaining <= 0
  );
  const canPlay = room.status === "playing" && me?.status === "playing" && !timeUp;

  const roomTitle = isSolo
    ? `SOLO — ${room.settings.gameType === "wordle" ? "Wordle" : "숫자야구"} ${room.settings.length}${room.settings.gameType === "wordle" ? "글자" : "자리"}`
    : room.settings.gameType === "wordle"
      ? `Wordle ${room.settings.length}글자`
      : `숫자야구 ${room.settings.length}자리`;

  const remainingInit = calcRemainingSeconds(room);
  const timerHtml = room.status === "playing" && room.settings.runtime
    ? `<span class="status-pill timer-pill" id="timer-display">${remainingInit !== null ? formatTimer(remainingInit) : "--:--"}</span>`
    : "";

  app.innerHTML = `
    <section class="page">
      <header class="room-header">
        <div class="room-title">
          <span class="hero__eyebrow">${isSolo ? "SOLO" : `룸 코드 ${escapeHtml(room.id)}`}</span>
          <h1>${escapeHtml(roomTitle)}</h1>
          <div class="status-row">
            <span class="status-pill ${room.status}">${labelForRoomStatus(room.status)}</span>
            ${timerHtml}
            ${!isSolo ? `<span class="status-pill connection-pill ${state.wsState === "connected" ? "connected" : "disconnected"}">
              ${state.wsState === "connected" ? "실시간 연결 중" : "재연결 시도 중"}
            </span>` : ""}
          </div>
          <div class="meta-row">
            ${!isSolo ? `<span class="mini-pill">${room.settings.visibility === "public" ? "Public" : "Private"}</span>` : ""}
            ${room.maxAttempts ? `<span class="mini-pill">${room.maxAttempts}회 제한</span>` : '<span class="mini-pill">무제한</span>'}
            <span class="mini-pill">내 닉네임 ${escapeHtml(me?.name || state.session.name)}</span>
          </div>
        </div>
        <div class="button-row">
          <button class="ghost-button" id="go-home">홈</button>
          ${room.status === "lobby" && isHost ? '<button class="button" id="start-game">게임 시작</button>' : ""}
          ${room.status === "finished" && isHost ? '<button class="button" id="rematch-game">다시 하기</button>' : ""}
        </div>
      </header>

      <section class="room-layout ${isSolo ? "room-layout--solo" : ""}">
        <div class="panel">
          ${renderMainPanel(room, canPlay, isSolo)}
        </div>

        ${!isSolo ? `
        <aside class="room-sidebar">
          <section class="panel share-box">
            <div>
              <h2>초대 링크</h2>
              <p class="muted">메신저에 링크를 공유하거나 룸 코드를 전달하세요.</p>
            </div>
            <div class="share-link">
              <code>${escapeHtml(room.shareUrl)}</code>
            </div>
            <div class="button-row">
              <button class="tonal-button" id="copy-link">링크 복사</button>
              <button class="tonal-button" id="share-kakao">카카오톡</button>
              <button class="ghost-button" id="share-more">다른 앱</button>
            </div>
          </section>
          <section class="panel">
            <h2>참여자 진행 현황</h2>
            <div class="players-grid">
              ${room.players.map(renderPlayerCard).join("")}
            </div>
          </section>
        </aside>
        ` : ""}
      </section>
    </section>
  `;

  // 타이머
  if (room.status === "playing" && room.settings.runtime) {
    startTimerIfNeeded(room);
    if (state.timerRemaining !== null) {
      const el = document.querySelector("#timer-display");
      if (el) {
        el.textContent = formatTimer(state.timerRemaining);
        el.classList.toggle("urgent", state.timerRemaining <= 30);
      }
    }
  } else {
    stopTimer();
  }

  document.querySelector("#go-home").addEventListener("click", async () => {
    navigateTo("/");
    await handleRoute();
  });

  if (!isSolo) {
    document.querySelector("#copy-link")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(room.shareUrl);
        showToast("초대 링크를 복사했습니다.", "success");
      } catch {
        showToast("링크를 복사하지 못했습니다.", "error");
      }
    });
    document.querySelector("#share-kakao")?.addEventListener("click", () => shareRoom(room, true));
    document.querySelector("#share-more")?.addEventListener("click", () => shareRoom(room, false));
  }

  document.querySelector("#start-game")?.addEventListener("click", async () => {
    try {
      const payload = await api(`/api/rooms/${room.id}/start`, {
        method: "POST",
        body: { guestId: state.session.guestId }
      });
      state.room = normalizeRoom(payload.room);
      render();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  document.querySelector("#rematch-game")?.addEventListener("click", async () => {
    try {
      const payload = await api(`/api/rooms/${room.id}/rematch`, {
        method: "POST",
        body: { guestId: state.session.guestId }
      });
      state.room = normalizeRoom(payload.room);
      state.draft = "";
      render();
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  const guessForm = document.querySelector("#guess-form");
  if (guessForm) {
    const guessInput = document.querySelector("#guess-input");
    guessInput.addEventListener("input", (e) => {
      state.draft = e.target.value.toUpperCase().slice(0, room.settings.length);
      e.target.value = state.draft;
    });
    guessForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!state.draft.trim()) {
        showToast("추측 값을 입력해 주세요.", "error");
        return;
      }
      try {
        const payload = await api(`/api/rooms/${room.id}/guess`, {
          method: "POST",
          body: { guestId: state.session.guestId, guess: state.draft.trim() }
        });
        state.room = normalizeRoom(payload.room);
        state.draft = "";
        render();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }
}

function renderMainPanel(room, canPlay, isSolo = false) {
  if (room.status === "lobby") {
    return `
      <div class="result-panel">
        <div>
          <h2>대기실</h2>
          <p class="muted">방장이 시작 버튼을 누르면 모든 참여자가 같은 정답으로 경쟁을 시작합니다.</p>
        </div>
        <div class="metrics">
          <article class="metric">
            <span class="muted">게임</span>
            <strong>${room.settings.gameType === "wordle" ? "Wordle" : "숫자야구"}</strong>
          </article>
          <article class="metric">
            <span class="muted">${room.settings.gameType === "wordle" ? "글자 수" : "자릿수"}</span>
            <strong>${room.settings.length}</strong>
          </article>
          ${room.settings.runtime ? `<article class="metric"><span class="muted">제한 시간</span><strong>${Math.floor(room.settings.runtime / 60)}분</strong></article>` : ""}
          ${room.maxAttempts ? `<article class="metric"><span class="muted">시도 횟수</span><strong>${room.maxAttempts}회</strong></article>` : ""}
        </div>
        <div class="panel" style="padding:16px">
          <h3>규칙</h3>
          ${room.settings.gameType === "wordle"
            ? '<p class="muted">위치·글자 모두 맞으면 초록, 글자만 맞으면 노랑, 없으면 회색.</p>'
            : '<p class="muted">중복 없는 숫자 입력 → 스트라이크/볼 개수로 힌트 제공.</p>'
          }
        </div>
      </div>
    `;
  }

  return `
    <div class="guess-panel">
      ${room.status === "finished"
        ? renderResultBanner(room, isSolo)
        : `
          <div>
            <h2>게임 진행</h2>
            <p class="muted">
              ${isSolo
                ? (room.settings.gameType === "wordle"
                    ? `영문 ${room.settings.length}글자를 입력하세요.`
                    : "중복 없는 숫자로 정답을 찾으세요.")
                : "다른 플레이어의 입력값은 보이지 않습니다. 시도 횟수와 완료 여부만 공유됩니다."
              }
            </p>
          </div>
          <form id="guess-form" class="guess-form">
            <div class="guess-form__row">
              <input
                id="guess-input"
                class="guess-input"
                autocomplete="off"
                autocapitalize="characters"
                spellcheck="false"
                maxlength="${room.settings.length}"
                placeholder="${room.settings.gameType === "wordle" ? `${room.settings.length}글자 단어` : `${room.settings.length}자리 숫자`}"
                value="${escapeHtml(state.draft)}"
                ${canPlay ? "" : "disabled"}
              />
              <button class="button" type="submit" ${canPlay ? "" : "disabled"}>제출</button>
            </div>
            <p class="footer-note">
              ${room.settings.gameType === "wordle"
                ? `영문 ${room.settings.length}글자를 입력하세요.`
                : "첫 자리는 0이 될 수 없고 숫자는 중복될 수 없습니다."
              }
            </p>
          </form>
        `
      }
      ${room.settings.gameType === "wordle" ? renderWordleBoard(room) : renderBaseballBoard(room)}
      ${!canPlay && room.status === "playing" ? '<p class="empty-state">이번 라운드 입력이 종료되었습니다.</p>' : ""}
    </div>
  `;
}

function renderWordleBoard(room) {
  const attempts = room.me?.attempts ?? [];
  const rows = [];
  for (let i = 0; i < room.maxAttempts; i++) {
    const attempt = attempts[i];
    const letters = attempt
      ? attempt.guess.split("")
      : i === attempts.length && room.status === "playing"
        ? state.draft.padEnd(room.settings.length, " ").split("")
        : Array.from({ length: room.settings.length }, () => " ");
    const states = attempt
      ? attempt.feedback.map((fb) => fb.state)
      : Array.from({ length: room.settings.length }, () => (i === attempts.length ? "active" : ""));

    rows.push(`
      <div class="wordle-row" style="grid-template-columns:repeat(${room.settings.length},minmax(0,1fr))">
        ${letters.map((l, j) => `<div class="wordle-cell ${states[j] || ""}">${escapeHtml(l)}</div>`).join("")}
      </div>
    `);
  }
  return `<div class="wordle-board">${rows.join("")}</div>`;
}

function renderBaseballBoard(room) {
  const attempts = room.me?.attempts ?? [];
  if (attempts.length === 0) {
    return '<div class="empty-state">첫 번째 추측을 입력하면 기록이 여기에 쌓입니다.</div>';
  }
  return `
    <div class="history-list">
      ${attempts.map((a) => `
        <div class="history-item">
          <div>
            <div class="history-guess">${escapeHtml(a.guess)}</div>
            <div class="muted">${formatTimestamp(a.submittedAt)}</div>
          </div>
          <strong>${escapeHtml(a.summary)}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function renderResultBanner(room, isSolo = false) {
  const result = room.result;
  const iWon = result?.winnerGuestId === state.session.guestId;
  const attemptsUsed = room.me?.attemptCount ?? 0;
  const attemptsLabel = room.maxAttempts ? `${attemptsUsed} / ${room.maxAttempts}회` : `${attemptsUsed}회`;

  let title;
  if (isSolo) {
    title = iWon ? "🎉 정답을 맞췄습니다!" : "😢 아쉽게도 실패했습니다";
  } else {
    title = result?.hasWinner
      ? iWon ? "당신이 먼저 정답을 맞췄습니다" : `${escapeHtml(result.winnerName)} 님이 먼저 정답을 맞췄습니다`
      : "이번 라운드는 승자가 없었습니다";
  }

  return `
    <div class="result-banner">
      <span class="hero__eyebrow">${isSolo ? "게임 종료" : "라운드 종료"}</span>
      <strong>${title}</strong>
      <p class="muted">정답은 <strong>${escapeHtml(result?.secret ?? "-")}</strong> 입니다.</p>
      <p class="muted">시도 횟수: ${attemptsLabel}</p>
      <p class="muted">${isSolo
        ? "다시 하기를 누르면 같은 설정으로 새 게임을 시작합니다."
        : (room.me?.isHost ? "방장이 다시 하기를 누르면 새 라운드를 시작할 수 있습니다." : "방장이 다시 하기를 누르면 새 라운드가 시작됩니다.")
      }</p>
    </div>
  `;
}

function renderPlayerCard(player) {
  return `
    <article class="player-card">
      <div class="player-card__head">
        <div class="player-name">
          <span class="player-dot" style="background:${player.color}"></span>
          <span>${escapeHtml(player.name)}</span>
        </div>
        ${player.isHost ? '<span class="mini-pill">방장</span>' : ""}
      </div>
      <div class="mini-pills">
        <span class="mini-pill">${player.connected ? "접속 중" : "오프라인"}</span>
        <span class="mini-pill">${labelForPlayerStatus(player.status)}</span>
        <span class="mini-pill">${player.maxAttempts ? `${player.attemptCount}/${player.maxAttempts}회` : `${player.attemptCount}회`}</span>
      </div>
      <div class="progress-bar">
        <span style="width:${Math.min(player.progressPercent, 100)}%"></span>
      </div>
      <div class="muted">
        ${player.finishedAt ? `완료 ${formatTimestamp(player.finishedAt)}` : `활동 ${formatTimestamp(player.lastSeenAt)}`}
      </div>
    </article>
  `;
}

// ── 타이머 ───────────────────────────────────────────────────────────────────

function startTimerIfNeeded(room) {
  if (state.timerInterval) return;
  startTimer(room);
}

function startTimer(room) {
  stopTimer();
  if (!room.settings.runtime || !room.startedAt) return;

  function tick() {
    const r = state.room;
    if (!r || r.status !== "playing" || !r.settings.runtime) { stopTimer(); return; }
    const remaining = calcRemainingSeconds(r);
    if (remaining === null) return;
    state.timerRemaining = remaining;

    const el = document.querySelector("#timer-display");
    if (el) {
      el.textContent = formatTimer(remaining);
      el.classList.toggle("urgent", remaining <= 30);
    }

    if (remaining <= 0) {
      stopTimer();
      showToast("시간이 초과되었습니다!", "error");
      const inp = document.querySelector("#guess-input");
      const btn = document.querySelector("#guess-form button[type=submit]");
      if (inp) inp.disabled = true;
      if (btn) btn.disabled = true;
    }
  }

  tick();
  state.timerInterval = setInterval(tick, 1000);
}

function stopTimer() {
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
  state.timerRemaining = null;
}

function calcRemainingSeconds(room) {
  if (!room.settings.runtime || !room.startedAt) return null;
  const elapsed = (Date.now() - new Date(room.startedAt).getTime()) / 1000;
  return Math.max(0, Math.ceil(room.settings.runtime - elapsed));
}

function formatTimer(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ── 공유 ─────────────────────────────────────────────────────────────────────

async function shareRoom(room, preferNative) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: `함께 ${room.settings.gameType === "wordle" ? "Wordle" : "숫자야구"} 하자`,
        text: `룸 코드 ${room.id}로 바로 입장할 수 있어요.`,
        url: room.shareUrl
      });
      showToast("공유 시트를 열었습니다.", "success");
      return;
    } catch (e) { if (e.name !== "AbortError") console.error(e); }
  }
  try {
    await navigator.clipboard.writeText(room.shareUrl);
    showToast("링크를 복사했습니다.", "success");
  } catch {
    showToast("공유 링크를 복사하지 못했습니다.", "error");
  }
}

// ── 소켓 ─────────────────────────────────────────────────────────────────────

function connectSocket(roomId) {
  disconnectSocket();
  state.wsState = "connecting";
  render();

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const socket = new WebSocket(
    `${protocol}://${window.location.host}/ws?roomId=${encodeURIComponent(roomId)}&guestId=${encodeURIComponent(state.session.guestId)}`
  );
  state.socket = socket;

  socket.addEventListener("open", () => {
    if (state.socket !== socket) return;
    state.wsState = "connected";
    render();
  });
  socket.addEventListener("message", (e) => {
    const payload = JSON.parse(e.data);
    if (payload.type === "snapshot" && payload.room?.id === state.roomId) {
      state.room = normalizeRoom(payload.room);
      render();
    }
  });
  socket.addEventListener("close", () => {
    if (state.socket !== socket) return;
    state.socket = null;
    state.wsState = "disconnected";
    render();
    state.reconnectTimer = window.setTimeout(() => {
      if (getRoomIdFromPath() === roomId) connectSocket(roomId);
    }, 1500);
  });
  socket.addEventListener("error", () => socket.close());
}

function disconnectSocket() {
  if (state.reconnectTimer) { clearTimeout(state.reconnectTimer); state.reconnectTimer = null; }
  if (state.socket) { const s = state.socket; state.socket = null; s.close(); }
  state.wsState = "idle";
  stopTimer();
}

// ── 라우팅 ───────────────────────────────────────────────────────────────────

function openRoom(room) {
  state.room = room;
  state.roomId = room.id;
  state.joinError = "";
  state.draft = "";
  navigateTo(`/room/${room.id}`, false);
  render();
  if (room.isSolo) {
    state.wsState = "idle";
    if (room.status === "playing" && room.settings.runtime) startTimerIfNeeded(room);
  } else {
    connectSocket(room.id);
  }
}

function normalizeRoom(room) {
  if (!room) return room;
  return { ...room, shareUrl: new URL(room.shareUrl, window.location.origin).toString() };
}

function navigateTo(path, replace = false) {
  if (replace) history.replaceState({}, "", path);
  else history.pushState({}, "", path);
}

function getRoomIdFromPath() {
  const match = window.location.pathname.match(/^\/room\/([A-Z0-9]+)$/);
  return match ? match[1] : "";
}

// ── API ──────────────────────────────────────────────────────────────────────

async function api(url, options = {}) {
  const response = await fetch(url, {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "요청을 처리하지 못했습니다.");
  return payload;
}

// ── 세션 ─────────────────────────────────────────────────────────────────────

function updateSessionName(name) {
  state.session.name = name.trim().slice(0, 18) || state.session.name;
  persistSession();
}

// ── UI 유틸 ──────────────────────────────────────────────────────────────────

function showToast(message, kind = "default") {
  const toast = document.createElement("div");
  toast.className = `toast ${kind}`;
  toast.textContent = message;
  toastStack.appendChild(toast);
  window.setTimeout(() => toast.remove(), 2800);
}

function renderLengthOptions(gameType, selectedValue) {
  const lengths = gameType === "wordle" ? [4, 5, 6, 7] : [3, 4, 5];
  return lengths.map((v) =>
    `<option value="${v}" ${selectedValue === v ? "selected" : ""}>${v}</option>`
  ).join("");
}

function labelForRoomStatus(status) {
  if (status === "playing") return "진행 중";
  if (status === "finished") return "결과 확인";
  return "대기실";
}

function labelForPlayerStatus(status) {
  if (status === "won") return "정답";
  if (status === "lost") return "종료";
  if (status === "playing") return "플레이 중";
  return "대기 중";
}

function formatTimestamp(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
