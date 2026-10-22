import assert from 'node:assert/strict';
import test from 'node:test';
import { PhotoQueue } from './slideshow-queue.js';

function photo(key, time) { return { key, uploadedAt: `2026-10-21T00:00:${String(time).padStart(2, '0')}Z` }; }

test('existing photos rotate while new uploads play next in upload order', () => {
  const queue = new PhotoQueue();
  const a = photo('birds/a', 1);
  const b = photo('skeletons/b', 2);
  const c = photo('birds/c', 3);
  const d = photo('skeletons/d', 4);
  const e = photo('birds/e', 5);
  assert.equal(queue.sync([b, a]).key, a.key);
  queue.sync([a, b, d, c]);
  assert.equal(queue.next().key, c.key);
  queue.sync([a, b, c, d, e]);
  assert.equal(queue.next().key, d.key);
  assert.equal(queue.next().key, e.key);
  assert.equal(queue.next().key, b.key);
  assert.equal(queue.next().key, a.key);
  assert.equal(queue.next().key, c.key);
});

test('removed or skipped photos leave both queues', () => {
  const queue = new PhotoQueue();
  const a = photo('birds/a', 1);
  const b = photo('skeletons/b', 2);
  const c = photo('birds/c', 3);
  queue.sync([a, b]);
  queue.sync([a, b, c]);
  assert.equal(queue.sync([b]).key, b.key);
  assert.equal(queue.next().key, b.key);
  assert.equal(queue.newQueue.length, 0);
});
