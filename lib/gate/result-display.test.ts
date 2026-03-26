import assert from "node:assert/strict";
import test from "node:test";

import { getGateResultDisplay } from "./result-display";

test("maps SUCCESS to positive operator feedback", () => {
  const display = getGateResultDisplay("SUCCESS");

  assert.equal(display.title, "Check-in Berhasil!");
  assert.equal(display.tone, "success");
  assert.match(display.description, /berhasil/i);
});

test("maps ALREADY_CHECKED_IN to warning feedback", () => {
  const display = getGateResultDisplay("ALREADY_CHECKED_IN");

  assert.equal(display.title, "Sudah Check-in");
  assert.equal(display.tone, "warning");
});

test("maps WRONG_EVENT to explicit wrong-event feedback", () => {
  const display = getGateResultDisplay("WRONG_EVENT");

  assert.equal(display.title, "Event Berbeda");
  assert.equal(display.tone, "danger");
});

test("maps ACCESS_DENIED to operational access feedback", () => {
  const display = getGateResultDisplay("ACCESS_DENIED");

  assert.equal(display.title, "Akses Gate Ditolak");
  assert.equal(display.tone, "danger");
  assert.match(display.description, /login ulang|akses/i);
});

test("maps SESSION_INACTIVE to session-specific feedback", () => {
  const display = getGateResultDisplay("SESSION_INACTIVE");

  assert.equal(display.title, "Sesi Gate Tidak Aktif");
  assert.equal(display.tone, "danger");
  assert.match(display.description, /sesi/i);
});
