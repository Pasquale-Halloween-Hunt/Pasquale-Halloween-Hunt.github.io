import { PHOTO_API_URL } from '../js/config.js';

async function shrinkImage(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');

  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(Error('Image conversion failed')),
      'image/jpeg',
      0.82,
    );
  });
}

export function renderPhotoChallenge(
  { app, $, frame, feedback, award, tag },
  { number, ornament, instructions },
) {
  const photoKey = `photo-challenge-${number}`;
  const uploadedKey = `photo-upload-key-${number}`;
  const uploadTokenKey = `photo-upload-token-${number}`;
  // Clear image data saved by older versions; only small upload keys remain locally.
  localStorage.removeItem(photoKey);
  const hasUpload = Boolean(localStorage.getItem(uploadedKey));
  const status = PHOTO_API_URL
    ? 'Your photo will be uploaded to the event gallery.'
    : 'Demo mode: no photo server is configured. Your photo will be previewed locally only.';
  const buttonLabel = PHOTO_API_URL ? 'Upload photo' : 'Complete demo challenge';

  app.innerHTML = frame(number, `
    <div class="center ornament">${ornament}</div>
    <p class="lead center">${instructions}</p>
    <p class="notice center">
      Photos submitted to the event may be displayed on the event slideshow.
      Please only upload photos you are comfortable sharing.
    </p>
    <div class="center">
      <p class="tiny ${hasUpload ? '' : 'hidden'}" id="replace-warning">Choosing a new photo will replace your current photo.</p>
      <label for="photo" class="btn secondary">${hasUpload ? 'Replace current photo' : 'Choose or take photo'}</label>
      <input type="file" id="photo" accept="image/*" class="hidden">
      <img id="preview" class="upload-preview hidden" alt="Your selected photo">
      <p class="tiny" id="photo-status">${status}</p>
      <div class="button-row">
        <button class="btn" id="submit-photo" disabled>${buttonLabel}</button>
      </div>
      <div class="feedback" id="feedback" aria-live="polite"></div>
    </div>
  `);

  let selected = null;
  let previewUrl = null;

  $('#photo').addEventListener('change', event => {
    selected = event.target.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!selected) return;

    previewUrl = URL.createObjectURL(selected);
    $('#preview').src = previewUrl;
    $('#preview').alt = 'Your new photo';
    $('#preview').classList.remove('hidden');
    $('#submit-photo').disabled = false;
    $('#photo-status').textContent = `Selected: ${selected.name} (${(selected.size / 1048576).toFixed(1)} MB)`;
  });

  $('#submit-photo').addEventListener('click', async () => {
    if (!selected) return;

    const submitButton = $('#submit-photo');
    submitButton.disabled = true;
    feedback('Preparing your photo…');

    try {
      if (PHOTO_API_URL) {
        const blob = await shrinkImage(selected);
        const formData = new FormData();
        formData.append('photo', blob, 'photo.jpg');
        formData.append('challenge', String(number));
        const previousUploadKey = localStorage.getItem(uploadedKey);
        const previousToken = localStorage.getItem(uploadTokenKey);
        if (previousUploadKey) {
          formData.append('previousKey', previousUploadKey);
          if (previousToken) formData.append('previousToken', previousToken);
        }

        const response = await fetch(`${PHOTO_API_URL.replace(/\/$/, '')}/upload`, {
          method: 'POST',
          body: formData,
          cache: 'no-store',
        });

        if (!response.ok) throw Error(`Upload failed (${response.status})`);
        const result = await response.json();
        if (result.key) localStorage.setItem(uploadedKey, result.key);
        if (result.replaceToken) localStorage.setItem(uploadTokenKey, result.replaceToken);
        if (previousUploadKey && result.replaced === false) {
          feedback('Photo uploaded, but the previous photo could not be removed. Please ask the organizer to remove it.', true);
        } else {
          feedback('Photo uploaded successfully!', true);
        }
      } else {
        feedback('Demo photo accepted locally. Real uploads require a backend.', true);
      }

      setTimeout(() => {
        if (tag() === number) award(number);
      }, 650);
    } catch (error) {
      feedback(`Could not upload: ${error.message}. Please retry.`);
      submitButton.disabled = false;
    }
  });
}
