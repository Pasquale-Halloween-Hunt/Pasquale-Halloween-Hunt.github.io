import assert from 'node:assert/strict';
import test from 'node:test';
import worker from './worker.js';

const ORIGIN = 'https://pasquale-halloween-hunt.github.io';
const BASE = 'https://example.workers.dev';

function bucket() {
  const objects = new Map();
  return {
    objects,
    async put(key, value, options = {}) {
      const bytes = value instanceof ReadableStream
        ? new Uint8Array(await new Response(value).arrayBuffer())
        : new TextEncoder().encode(value);
      objects.set(key, {
        bytes,
        size: bytes.length,
        uploaded: new Date(),
        customMetadata: options.customMetadata || {},
      });
    },
    async head(key) { return objects.get(key) || null; },
    async get(key) {
      const item = objects.get(key);
      return item ? { ...item, body: new Blob([item.bytes]).stream() } : null;
    },
    async delete(key) { objects.delete(key); },
    async list({ prefix = '', cursor, limit = 1000 }) {
      const keys = [...objects.keys()].filter(key => key.startsWith(prefix)).sort();
      const start = Number(cursor || 0);
      const selected = keys.slice(start, start + limit);
      const next = start + selected.length;
      return {
        objects: selected.map(key => ({ key, ...objects.get(key) })),
        truncated: next < keys.length,
        cursor: String(next),
      };
    },
  };
}

function request(path, options = {}) {
  return new Request(`${BASE}${path}`, {
    ...options,
    headers: { Origin: ORIGIN, ...options.headers },
  });
}

async function upload(env, challenge = '5', previous = {}) {
  const form = new FormData();
  form.append('photo', new File(['jpeg bytes'], 'photo.jpg', { type: 'image/jpeg' }));
  form.append('challenge', challenge);
  if (previous.key) form.append('previousKey', previous.key);
  if (previous.replaceToken) form.append('previousToken', previous.replaceToken);
  const response = await worker.fetch(request('/upload', { method: 'POST', body: form }), env);
  assert.equal(response.status, 201);
  return response.json();
}

test('new uploads appear in their folder and can be fetched', async () => {
  const env = { PHOTOS: bucket(), ADMIN_TOKEN: 'organizer-secret' };
  const bird = await upload(env);
  const tractor = await upload(env, '10');
  assert.match(bird.key, /^birds\//);
  assert.match(tractor.key, /^skeletons\//);

  const headers = { Authorization: 'Bearer organizer-secret' };
  const deniedList = await worker.fetch(request('/admin/photos?challenge=5'), env);
  assert.equal(deniedList.status, 401);
  const deniedImage = await worker.fetch(request(`/photo/${encodeURIComponent(bird.key)}`), env);
  assert.equal(deniedImage.status, 401);
  const list = await worker.fetch(request('/admin/photos?challenge=5', { headers }), env);
  const data = await list.json();
  assert.deepEqual(data.items.map(item => item.key), [bird.key]);
  const image = await worker.fetch(request(`/photo/${encodeURIComponent(bird.key)}`, { headers }), env);
  assert.equal(image.headers.get('Content-Type'), 'image/jpeg');
  assert.equal(await image.text(), 'jpeg bytes');
});

test('skipping hides a photo from the slideshow but keeps it in organizer view', async () => {
  const env = { PHOTOS: bucket(), ADMIN_TOKEN: 'organizer-secret' };
  const photo = await upload(env);
  const body = JSON.stringify({ key: photo.key, skipped: true });
  const denied = await worker.fetch(request('/admin/skip', { method: 'POST', body }), env);
  assert.equal(denied.status, 401);

  const authorization = { Authorization: 'Bearer organizer-secret' };
  const skipped = await worker.fetch(request('/admin/skip', { method: 'POST', body, headers: authorization }), env);
  assert.equal(skipped.status, 200);
  const publicList = await worker.fetch(request('/photos?challenge=5'), env);
  assert.equal(publicList.status, 404);
  const publicImage = await worker.fetch(request(`/photo/${encodeURIComponent(photo.key)}`), env);
  assert.equal(publicImage.status, 401);
  const adminList = await worker.fetch(request('/admin/photos?challenge=5', { headers: authorization }), env);
  assert.equal((await adminList.json()).items[0].skipped, true);
  const adminImage = await worker.fetch(request(`/photo/${encodeURIComponent(photo.key)}`, { headers: authorization }), env);
  assert.equal(adminImage.status, 200);
});

test('organizer endpoints stay unavailable until a token is configured', async () => {
  const env = { PHOTOS: bucket() };
  assert.equal((await worker.fetch(request('/admin/photos?challenge=5'), env)).status, 503);
  const key = 'birds/1234567890123-00000000-0000-4000-8000-000000000000.jpg';
  assert.equal((await worker.fetch(request(`/photo/${encodeURIComponent(key)}`), env)).status, 503);
});

test('replacement requires the original upload token', async () => {
  const env = { PHOTOS: bucket(), ADMIN_TOKEN: 'organizer-secret' };
  const original = await upload(env);
  await upload(env, '5', { key: original.key, replaceToken: 'wrong-token' });
  assert.ok(await env.PHOTOS.head(original.key));
  await upload(env, '5', original);
  assert.equal(await env.PHOTOS.head(original.key), null);
});

test('replacement removes a legacy upload using its saved object key', async () => {
  const env = { PHOTOS: bucket(), ADMIN_TOKEN: 'organizer-secret' };
  const legacyKey = 'birds/1234567890123-00000000-0000-4000-8000-000000000000.jpg';
  await env.PHOTOS.put(legacyKey, 'legacy photo');
  const result = await upload(env, '5', { key: legacyKey });
  assert.equal(result.replaced, true);
  assert.equal(await env.PHOTOS.head(legacyKey), null);
});

test('organizer deletion removes the photo and skip marker', async () => {
  const env = { PHOTOS: bucket(), ADMIN_TOKEN: 'organizer-secret' };
  const photo = await upload(env);
  const headers = { Authorization: 'Bearer organizer-secret' };
  const deletePath = `/admin/photo?key=${encodeURIComponent(photo.key)}`;
  const unauthorized = await worker.fetch(request(deletePath, { method: 'DELETE' }), env);
  assert.equal(unauthorized.status, 401);
  const wrongToken = await worker.fetch(request(deletePath, {
    method: 'DELETE', headers: { Authorization: 'Bearer wrong-token' },
  }), env);
  assert.equal(wrongToken.status, 401);
  assert.ok(await env.PHOTOS.head(photo.key));
  await worker.fetch(request('/admin/skip', {
    method: 'POST', headers,
    body: JSON.stringify({ key: photo.key, skipped: true }),
  }), env);
  const deleted = await worker.fetch(request(deletePath, {
    method: 'DELETE', headers,
  }), env);
  assert.equal(deleted.status, 200);
  assert.equal(await env.PHOTOS.head(photo.key), null);
  assert.equal(await env.PHOTOS.head(`hidden/${photo.key}`), null);
});
