import test from 'node:test';
import assert from 'node:assert/strict';
import { windEnvelope } from '../src/lib/event-audio.ts';

test('wind follows speed in either direction, stays quiet, and silences when inactive', () => {
  assert.equal(windEnvelope(0, true).gain, 0);
  assert.ok(windEnvelope(.3, true).gain < windEnvelope(1, true).gain);
  assert.ok(windEnvelope(1, true).gain < windEnvelope(1.6, true).gain);
  assert.deepEqual(windEnvelope(-1.2, true), windEnvelope(1.2, true));
  assert.ok(windEnvelope(1000, true).gain <= .045);
  assert.equal(windEnvelope(1.6, false).gain, 0);
  assert.equal(windEnvelope(NaN, true).gain, 0);
});
