# Halloween Hunt — website prototype

Open `index.html` in a browser. It is a static, framework-free site with 12 challenges, local progress, a final anagram, and the CSS haunted house animation.

For deployment, upload `index.html`, `style.css`, `house.css`, and `app.js` to a GitHub Pages repository. NFC tags and QR codes can use `https://YOUR-SITE/?tag=01` through `?tag=12`.

## IMPORTANT: Photo submissions are in DEMO MODE

Photo challenges #5 and #10 currently preview a selected image locally and allow **demo completion**, but **do not upload or store the photo**. For the actual event, deploy a photo backend and set `PHOTO_API_URL` near the top of `app.js`. The expected endpoint is `POST /upload` with multipart form fields `photo` (JPEG) and `challenge` (`5` or `10`). A real backend should enforce CORS for your GitHub Pages domain, content type/size checks, rate limits, safe public image delivery, and private organizer moderation. Do not use the demo completion mode at the event.

The live photo slideshow and organizer moderation interface are **not implemented in this prototype**. They require the backend and should be added before the event.

## Other notes

- Progress is stored in browser `localStorage` only. Clearing storage or switching devices loses progress.
- The haunted house runs in the browser in this prototype. If desired, record it as MP4 and replace the scene with a video element for consistent playback on slower phones.
- The constellation and potion are implemented as browser interactions. Test touch interactions and camera upload on actual iOS and Android devices before the event.
- The final answer is `TRICK OR TREAT`.
- For production, consider hiding the all-challenges index if you want discovery to happen exclusively through physical tags.
