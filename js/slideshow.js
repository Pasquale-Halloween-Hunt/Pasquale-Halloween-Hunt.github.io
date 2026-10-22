import { PHOTO_API_URL } from './config.js';
import { PhotoQueue } from './slideshow-queue.js';

const slide = document.querySelector('#slide');
const nextSlide = document.querySelector('#slide-next');
const slides = [slide, nextSlide];
const empty = document.querySelector('#empty');
const login = document.querySelector('#slide-login');
const loginError = document.querySelector('#slide-login-error');
const tokenKey = 'halloween-gallery-token';
let token = sessionStorage.getItem(tokenKey) || '';
let authorized = false;
let queue = new PhotoQueue();
let refreshPromise = null;
let slideUrls = [null, null];
let activeIndex = -1;
let showVersion = 0;

function clearSlides() {
  slides.forEach((image, index) => {
    image.style.display = 'none';
    image.style.opacity = '0';
    image.removeAttribute('src');
    if (slideUrls[index]) URL.revokeObjectURL(slideUrls[index]);
    slideUrls[index] = null;
  });
  activeIndex = -1;
}

function showLogin(message = '') {
  authorized = false;
  token = '';
  sessionStorage.removeItem(tokenKey);
  login.classList.remove('hidden');
  loginError.textContent = message;
  empty.style.display = 'none';
  showVersion++;
  clearSlides();
  queue = new PhotoQueue();
}

async function api(path) {
  const response = await fetch(`${PHOTO_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = Error(data.error || `Could not load photos (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return response;
}

async function folderPhotos(challenge) {
  const photos = [];
  let cursor = null;
  do {
    const parameters = new URLSearchParams({ challenge, limit: '100' });
    if (cursor) parameters.set('cursor', cursor);
    const data = await (await api(`/admin/photos?${parameters}`)).json();
    photos.push(...data.items.filter(item => !item.skipped));
    cursor = data.nextCursor;
  } while (cursor);
  return photos;
}

async function show(item) {
  const version = ++showVersion;
  if (!item) {
    clearSlides();
    empty.textContent = 'Waiting for photos…';
    empty.style.display = 'block';
    return;
  }
  try {
    const blob = await (await api(`/photo/${encodeURIComponent(item.key)}`)).blob();
    if (version !== showVersion || !authorized || queue.current?.key !== item.key) return;
    const nextUrl = URL.createObjectURL(blob);
    const incomingIndex = activeIndex === 0 ? 1 : 0;
    const incoming = slides[incomingIndex];
    const outgoing = activeIndex >= 0 ? slides[activeIndex] : null;
    incoming.src = nextUrl;
    incoming.alt = item.challenge === 5 ? 'Bird photo from the Halloween Hunt' : 'Tractor photo from the Halloween Hunt';
    await incoming.decode();
    if (version !== showVersion || !authorized || queue.current?.key !== item.key) {
      URL.revokeObjectURL(nextUrl);
      return;
    }
    incoming.style.display = 'block';
    incoming.style.opacity = '0';
    if (outgoing) outgoing.style.opacity = '1';
    void incoming.offsetWidth;
    await new Promise(resolve => requestAnimationFrame(resolve));
    incoming.style.opacity = '1';
    if (outgoing) outgoing.style.opacity = '0';
    await new Promise(resolve => setTimeout(resolve, 950));
    if (version !== showVersion || !authorized || queue.current?.key !== item.key) {
      URL.revokeObjectURL(nextUrl);
      return;
    }
    activeIndex = incomingIndex;
    slideUrls[incomingIndex] = nextUrl;
    if (outgoing) {
      const outgoingIndex = 1 - incomingIndex;
      outgoing.style.display = 'none';
      outgoing.style.opacity = '0';
      outgoing.removeAttribute('src');
      if (slideUrls[outgoingIndex]) URL.revokeObjectURL(slideUrls[outgoingIndex]);
      slideUrls[outgoingIndex] = null;
    }
    empty.style.display = 'none';
  } catch (error) {
    if (version !== showVersion) return;
    if (error.status === 401 || error.status === 503) showLogin(error.message);
    else if (queue.known.size > 1) void show(queue.next());
    else { empty.textContent = error.message; empty.style.display = 'block'; }
  }
}

async function refresh() {
  if (!authorized) return;
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const photos = (await Promise.all([folderPhotos('5'), folderPhotos('10')])).flat();
    if (!authorized) return;
    const before = queue.current?.key;
    const current = queue.sync(photos);
    if (current?.key !== before) await show(current);
  })().catch(error => {
    if (error.status === 401 || error.status === 503) showLogin(error.message);
    else if (!queue.current) { empty.textContent = error.message; empty.style.display = 'block'; }
  }).finally(() => { refreshPromise = null; });
  return refreshPromise;
}

async function start(candidate) {
  token = candidate.trim();
  if (!token) return;
  loginError.textContent = 'Opening slideshow…';
  try {
    await api('/admin/photos?challenge=5&limit=1');
    sessionStorage.setItem(tokenKey, token);
    queue = new PhotoQueue();
    authorized = true;
    login.classList.add('hidden');
    empty.style.display = 'block';
    await refresh();
  } catch (error) { showLogin(error.message); }
}

document.querySelector('#slide-login-form').addEventListener('submit', event => {
  event.preventDefault();
  void start(document.querySelector('#slide-token').value);
});
window.addEventListener('message', event => {
  if (event.origin === location.origin && event.source === window.opener &&
      event.data?.type === 'organizer-token' && typeof event.data.token === 'string') {
    void start(event.data.token);
  }
});
window.opener?.postMessage({ type: 'slideshow-ready' }, location.origin);

for (const image of slides) image.addEventListener('error', () => {
  if (queue.known.size > 1) void show(queue.next());
  else { empty.textContent = 'Waiting for photos…'; empty.style.display = 'block'; }
});
const fullscreenButton = document.querySelector('#fullscreen');
fullscreenButton.addEventListener('click', () => {
  if (!document.fullscreenElement) void document.documentElement.requestFullscreen();
});
document.addEventListener('fullscreenchange', () => {
  fullscreenButton.hidden = Boolean(document.fullscreenElement);
});

if (token) void start(token);
else showLogin();
setInterval(() => { void refresh(); }, 4000);
setInterval(async () => {
  if (!authorized) return;
  const previousKey = queue.current?.key;
  await refresh();
  if (authorized && queue.known.size > 1 && queue.current && queue.current.key === previousKey) {
    void show(queue.next());
  }
}, 10000);
