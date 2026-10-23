import { PHOTO_API_URL } from './config.js';
import { createZip } from './zip.js';

const $ = selector => document.querySelector(selector);
const tokenKey = 'halloween-gallery-token';
const folders = { '5': 'Bird photos', '10': 'Tractor photos', all: 'View all photos' };
let token = sessionStorage.getItem(tokenKey) || '';
let challenge = null;
let nextCursor = null;
let allCursors = { '5': null, '10': null };
let observer = null;
let slideshowWindow = null;
const imageUrls = new Set();

function status(message) { $('#status').textContent = message; }

function clearImages() {
  observer?.disconnect();
  observer = null;
  for (const url of imageUrls) URL.revokeObjectURL(url);
  imageUrls.clear();
  $('#grid').replaceChildren();
}

async function api(path, options = {}) {
  const response = await fetch(`${PHOTO_API_URL}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
    cache: 'no-store',
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw Error(data.error || `Request failed (${response.status})`);
  }
  return response;
}

function showLogin() {
  $('#login').classList.remove('hidden');
  $('#directory').classList.add('hidden');
  clearImages();
}

async function showDirectory() {
  await api('/admin/photos?challenge=5&limit=1');
  $('#login').classList.add('hidden');
  $('#directory').classList.remove('hidden');
  status('');
}

async function photoBlob(item) {
  return (await api(`/photo/${encodeURIComponent(item.key)}`)).blob();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function renderCard(item) {
  const card = document.createElement('article');
  card.className = `photo-card${item.skipped ? ' skipped' : ''}`;
  const image = document.createElement('img');
  image.alt = `${folders[String(item.challenge)]} uploaded ${new Date(item.uploadedAt).toLocaleString()}`;
  const details = document.createElement('div');
  details.className = 'details';
  const meta = document.createElement('small');
  const actions = document.createElement('div');
  actions.className = 'card-actions';
  const skip = document.createElement('button');
  skip.className = 'subtle';
  const download = document.createElement('button');
  download.className = 'subtle';
  download.textContent = 'Download';
  const remove = document.createElement('button');
  remove.className = 'danger';
  remove.textContent = 'Delete';

  function update() {
    skip.textContent = item.skipped ? 'Include in slideshow' : 'Skip in slideshow';
    meta.textContent = `${item.skipped ? 'Skipped · ' : ''}${new Date(item.uploadedAt).toLocaleString()} · ${(item.size / 1048576).toFixed(1)} MB`;
    card.classList.toggle('skipped', item.skipped);
  }
  update();

  skip.addEventListener('click', async () => {
    skip.disabled = true;
    try {
      await api('/admin/skip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: item.key, skipped: !item.skipped }),
      });
      item.skipped = !item.skipped;
      update();
      status(item.skipped ? 'Photo skipped in the slideshow.' : 'Photo included in the slideshow.');
    } catch (error) { status(error.message); }
    finally { skip.disabled = false; }
  });
  download.addEventListener('click', async () => {
    download.disabled = true;
    try { downloadBlob(await photoBlob(item), item.key.split('/').pop()); }
    catch (error) { status(error.message); }
    finally { download.disabled = false; }
  });
  remove.addEventListener('click', async () => {
    if (!confirm('Delete this photo permanently?')) return;
    remove.disabled = true;
    try {
      await api(`/admin/photo?key=${encodeURIComponent(item.key)}`, { method: 'DELETE' });
      observer?.unobserve(image);
      card.remove();
      status('Photo deleted.');
    } catch (error) { status(error.message); remove.disabled = false; }
  });

  actions.append(skip, download, remove);
  details.append(meta, actions);
  card.append(image, details);
  $('#grid').append(card);
  observer.observe(image);
  image.dataset.key = item.key;
}

function observeImages() {
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      const key = entry.target.dataset.key;
      photoBlob({ key }).then(blob => {
        if (!entry.target.isConnected) return;
        const url = URL.createObjectURL(blob);
        imageUrls.add(url);
        entry.target.src = url;
      }).catch(error => status(error.message));
    }
  }, { rootMargin: '300px' });
}

async function loadPage() {
  if (challenge === 'all') {
    let hasMore = false;
    for (const number of ['5', '10']) {
      if (allCursors[number] === false) continue;
      const parameters = new URLSearchParams({ challenge: number, limit: '40' });
      if (allCursors[number]) parameters.set('cursor', allCursors[number]);
      const data = await (await api(`/admin/photos?${parameters}`)).json();
      allCursors[number] = data.nextCursor || false;
      hasMore ||= Boolean(data.nextCursor);
      for (const item of data.items) renderCard(item);
    }
    nextCursor = hasMore ? 'all' : null;
    $('#load-more').classList.toggle('hidden', !hasMore);
    if (!$('#grid').children.length) status('No photos have been uploaded yet.');
    return;
  }
  const parameters = new URLSearchParams({ challenge, limit: '40' });
  if (nextCursor) parameters.set('cursor', nextCursor);
  const data = await (await api(`/admin/photos?${parameters}`)).json();
  nextCursor = data.nextCursor;
  for (const item of data.items) renderCard(item);
  $('#load-more').classList.toggle('hidden', !nextCursor);
  if (!$('#grid').children.length) status('No photos in this folder yet.');
}

async function openFolder(number) {
  challenge = number;
  nextCursor = null;
  allCursors = { '5': null, '10': null };
  clearImages();
  observeImages();
  $('#page-title').textContent = folders[number];
  $('#folders').classList.add('hidden');
  $('#folder-view').classList.remove('hidden');
  status('Loading photos…');
  try { await loadPage(); if ($('#grid').children.length) status(''); }
  catch (error) { status(error.message); }
}

async function allItems(numbers) {
  const result = [];
  for (const number of numbers) {
    let cursor = null;
    do {
      const parameters = new URLSearchParams({ challenge: number, limit: '100' });
      if (cursor) parameters.set('cursor', cursor);
      const data = await (await api(`/admin/photos?${parameters}`)).json();
      result.push(...data.items);
      cursor = data.nextCursor;
    } while (cursor);
  }
  return result;
}

async function downloadArchive(numbers, filename) {
  const buttons = [$('#download-folder'), $('#download-all')];
  buttons.forEach(button => { button.disabled = true; });
  try {
    status('Collecting photo list…');
    const items = await allItems(numbers);
    if (!items.length) { status('There are no photos to download.'); return; }
    const archive = await createZip(items, async item => (await photoBlob(item)).arrayBuffer(),
      (done, total) => status(`Adding image ${done} of ${total} to ZIP…`));
    downloadBlob(archive, filename);
    status(`Downloaded ${items.length} photos.`);
  } catch (error) { status(error.message); }
  finally { buttons.forEach(button => { button.disabled = false; }); }
}

$('#login-form').addEventListener('submit', async event => {
  event.preventDefault();
  token = $('#admin-token').value.trim();
  sessionStorage.setItem(tokenKey, token);
  status('Opening directory…');
  try { await showDirectory(); }
  catch (error) { sessionStorage.removeItem(tokenKey); status(error.message); }
});
$('#lock').addEventListener('click', () => {
  token = '';
  sessionStorage.removeItem(tokenKey);
  $('#admin-token').value = '';
  showLogin();
  status('Directory locked.');
});
document.querySelectorAll('.folder').forEach(folder => {
  folder.addEventListener('click', () => openFolder(folder.dataset.challenge));
});
$('#back-folders').addEventListener('click', () => {
  clearImages();
  $('#folder-view').classList.add('hidden');
  $('#folders').classList.remove('hidden');
  $('#page-title').textContent = 'Choose a folder';
  status('');
});
$('#load-more').addEventListener('click', async () => {
  $('#load-more').disabled = true;
  try { await loadPage(); }
  catch (error) { status(error.message); }
  finally { $('#load-more').disabled = false; }
});
$('#download-folder').addEventListener('click', () => {
  if (challenge === 'all') downloadArchive(['5', '10'], 'halloween-hunt-photos.zip');
  else downloadArchive([challenge], `${challenge === '5' ? 'birds' : 'skeletons'}-photos.zip`);
});
$('#download-all').addEventListener('click', () => downloadArchive(['5', '10'], 'halloween-hunt-photos.zip'));
function startSlideshow() {
  slideshowWindow = window.open('slideshow.html', 'halloween-slideshow');
  if (!slideshowWindow) status('Allow pop-ups to open the slideshow.');
}
$('#start-slideshow').addEventListener('click', startSlideshow);
$('#start-folder-slideshow').addEventListener('click', startSlideshow);
window.addEventListener('message', event => {
  if (event.origin === location.origin && event.source === slideshowWindow &&
      event.data?.type === 'slideshow-ready' && token) {
    slideshowWindow.postMessage({ type: 'organizer-token', token }, location.origin);
  }
});

if (token) showDirectory().catch(error => { showLogin(); status(error.message); });
