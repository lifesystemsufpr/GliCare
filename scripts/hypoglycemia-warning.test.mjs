import test from 'node:test';
import assert from 'node:assert/strict';
import { isRecentReading, RECENT_READING_MINUTES } from '../src/features/glucose/services/hypoglycemia-warning.ts';

const now = Date.parse('2026-11-16T15:00:00.000Z');
const minutesAgo = (m) => new Date(now - m * 60_000).toISOString();

test('medição da última hora recebe a orientação imediata', () => {
  assert.equal(isRecentReading(minutesAgo(0), now), true);
  assert.equal(isRecentReading(minutesAgo(RECENT_READING_MINUTES), now), true);
});

test('registro antigo não é tratado como emergência atual', () => {
  assert.equal(isRecentReading(minutesAgo(RECENT_READING_MINUTES + 1), now), false);
  assert.equal(isRecentReading(minutesAgo(60 * 24), now), false);
});

test('aceita pequena diferença de relógio e recusa data inválida', () => {
  assert.equal(isRecentReading(minutesAgo(-3), now), true);
  assert.equal(isRecentReading(minutesAgo(-30), now), false);
  assert.equal(isRecentReading('não é data', now), false);
});
