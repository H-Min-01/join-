import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRoomSnapshot,
  createRoom,
  evaluateBaseball,
  evaluateWordle,
  joinRoom,
  startRoom,
  submitGuess
} from "../lib/game.mjs";

test("evaluateWordle handles duplicate letters", () => {
  const result = evaluateWordle("APPLE", "ALLEY").map((item) => item.state);
  assert.deepEqual(result, ["correct", "present", "absent", "present", "absent"]);
});

test("evaluateBaseball returns strike and ball counts", () => {
  const result = evaluateBaseball("427", "472");
  assert.equal(result.strikes, 1);
  assert.equal(result.balls, 2);
});

test("host can create room, start game, and win the round", () => {
  const room = createRoom({
    roomId: "ABCD12",
    guestId: "host-user",
    name: "Host",
    settings: {
      gameType: "wordle",
      visibility: "invite",
      length: 4
    },
    now: "2026-04-02T00:00:00.000Z"
  });

  joinRoom(room, {
    guestId: "guest-user",
    name: "Guest",
    now: "2026-04-02T00:00:01.000Z"
  });

  startRoom(room, {
    guestId: "host-user",
    now: "2026-04-02T00:00:02.000Z"
  });

  room.secret = "CODE";

  submitGuess(room, {
    guestId: "host-user",
    guess: "CODE",
    now: "2026-04-02T00:00:03.000Z"
  });

  assert.equal(room.status, "finished");
  assert.equal(room.winnerGuestId, "host-user");
  assert.equal(room.players["host-user"].status, "won");
  assert.equal(room.players["guest-user"].status, "lost");

  const snapshot = buildRoomSnapshot(room, "host-user", "http://localhost:3000");
  assert.equal(snapshot.result.secret, "CODE");
  assert.equal(snapshot.me.attempts.length, 1);
});
