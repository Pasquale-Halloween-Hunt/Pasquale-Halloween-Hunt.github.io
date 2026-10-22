const ALLOWED_ORIGINS = new Set([
  'https://pasquale-halloween-hunt.github.io',
  'http://localhost:8080',
  'http://localhost:8000',
]);

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const PHOTO_KEY = /^(birds|skeletons)\/\d{13}-[0-9a-f-]{36}\.jpg$/;
const FOLDERS = { '5': 'birds', '10': 'skeletons' };

function corsHeaders(origin) {
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
  });
  if (ALLOWED_ORIGINS.has(origin)) headers.set('Access-Control-Allow-Origin', origin);
  return headers;
}

function json(data, status, headers) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { status, headers: responseHeaders });
}

function adminError(request, env, headers) {
  if (!env.ADMIN_TOKEN) return json({ error: 'Organizer access is not configured' }, 503, headers);
  if (request.headers.get('Authorization') !== `Bearer ${env.ADMIN_TOKEN}`) {
    return json({ error: 'Organizer authorization required' }, 401, headers);
  }
  return null;
}

function validKey(key) {
  return PHOTO_KEY.test(key);
}

function requestedKey(url) {
  try {
    return decodeURIComponent(url.pathname.slice('/photo/'.length));
  } catch {
    return '';
  }
}

async function hiddenKeys(bucket, folder) {
  const keys = new Set();
  let cursor;
  do {
    const page = await bucket.list({ prefix: `hidden/${folder}/`, cursor, limit: 1000 });
    for (const item of page.objects) keys.add(item.key.slice('hidden/'.length));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  return keys;
}

async function listPhotos(url, env, headers) {
  const challenge = url.searchParams.get('challenge');
  const folder = FOLDERS[challenge];
  if (!folder) return json({ error: 'Choose challenge 5 or 10' }, 400, headers);

  const page = await env.PHOTOS.list({
    prefix: `${folder}/`,
    cursor: url.searchParams.get('cursor') || undefined,
    limit: Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 100)),
  });
  const hidden = await hiddenKeys(env.PHOTOS, folder);
  const items = page.objects
    .filter(item => validKey(item.key))
    .map(item => ({
      key: item.key,
      challenge: Number(challenge),
      uploadedAt: item.uploaded?.toISOString() || null,
      size: item.size,
      skipped: hidden.has(item.key),
      url: `${url.origin}/photo/${encodeURIComponent(item.key)}`,
    }));
  return json({ items, nextCursor: page.truncated ? page.cursor : null }, 200, headers);
}

async function getPhoto(request, url, env, headers) {
  const unauthorized = adminError(request, env, headers);
  if (unauthorized) return unauthorized;
  const key = requestedKey(url);
  if (!validKey(key)) return json({ error: 'Not found' }, 404, headers);
  const photo = await env.PHOTOS.get(key);
  if (!photo) return json({ error: 'Not found' }, 404, headers);

  const responseHeaders = new Headers(headers);
  responseHeaders.set('Content-Type', 'image/jpeg');
  if (url.searchParams.get('download') === '1') {
    responseHeaders.set('Content-Disposition', `attachment; filename="${key.split('/').pop()}"`);
  }
  return new Response(photo.body, { status: 200, headers: responseHeaders });
}

async function upload(request, env, headers) {
  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > MAX_UPLOAD_BYTES) return json({ error: 'Image is too large' }, 413, headers);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Expected multipart form data' }, 400, headers);
  }
  const file = form.get('photo');
  const challenge = String(form.get('challenge') || '');
  const folder = FOLDERS[challenge];
  if (!(file instanceof File) || file.type !== 'image/jpeg') {
    return json({ error: 'Please upload a JPEG image' }, 400, headers);
  }
  if (!folder) return json({ error: 'Invalid challenge' }, 400, headers);
  if (file.size > MAX_UPLOAD_BYTES) return json({ error: 'Image is too large' }, 413, headers);

  const key = `${folder}/${Date.now()}-${crypto.randomUUID()}.jpg`;
  const replaceToken = crypto.randomUUID();
  const previousKey = String(form.get('previousKey') || '');
  const previousToken = String(form.get('previousToken') || '');
  let replaced = false;
  await env.PHOTOS.put(key, file.stream(), {
    httpMetadata: { contentType: 'image/jpeg' },
    customMetadata: { replaceToken },
  });
  if (validKey(previousKey) && previousKey.startsWith(`${folder}/`)) {
    const previous = await env.PHOTOS.head(previousKey);
    const storedToken = previous?.customMetadata?.replaceToken;
    // Legacy uploads have no token; the unguessable saved object key is their proof.
    if (previous && (storedToken ? storedToken === previousToken : !previousToken)) {
      await env.PHOTOS.delete(previousKey);
      await env.PHOTOS.delete(`hidden/${previousKey}`);
      replaced = true;
    }
  }
  return json({ ok: true, key, replaceToken, replaced }, 201, headers);
}

async function setSkipped(request, env, headers) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Expected JSON' }, 400, headers);
  }
  if (!validKey(data.key) || typeof data.skipped !== 'boolean') {
    return json({ error: 'Invalid photo or skipped value' }, 400, headers);
  }
  if (!(await env.PHOTOS.head(data.key))) return json({ error: 'Photo not found' }, 404, headers);
  if (data.skipped) await env.PHOTOS.put(`hidden/${data.key}`, '');
  else await env.PHOTOS.delete(`hidden/${data.key}`);
  return json({ ok: true, key: data.key, skipped: data.skipped }, 200, headers);
}

async function deletePhoto(url, env, headers) {
  const key = url.searchParams.get('key') || '';
  if (!validKey(key)) return json({ error: 'Invalid photo' }, 400, headers);
  if (!(await env.PHOTOS.head(key))) return json({ error: 'Photo not found' }, 404, headers);
  await env.PHOTOS.delete(key);
  await env.PHOTOS.delete(`hidden/${key}`);
  return json({ ok: true, key }, 200, headers);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);
    if (request.method === 'OPTIONS') {
      return ALLOWED_ORIGINS.has(origin)
        ? new Response(null, { status: 204, headers })
        : json({ error: 'Origin not allowed' }, 403, headers);
    }
    if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ error: 'Origin not allowed' }, 403, headers);

    const url = new URL(request.url);
    if (url.pathname === '/upload' && request.method === 'POST') {
      if (!origin) return json({ error: 'Origin required' }, 403, headers);
      return upload(request, env, headers);
    }
    if (url.pathname.startsWith('/photo/') && request.method === 'GET') return getPhoto(request, url, env, headers);

    if (url.pathname.startsWith('/admin/')) {
      const unauthorized = adminError(request, env, headers);
      if (unauthorized) return unauthorized;
      if (url.pathname === '/admin/photos' && request.method === 'GET') return listPhotos(url, env, headers);
      if (url.pathname === '/admin/skip' && request.method === 'POST') return setSkipped(request, env, headers);
      if (url.pathname === '/admin/photo' && request.method === 'DELETE') return deletePhoto(url, env, headers);
    }
    return json({ error: 'Not found' }, 404, headers);
  },
};
