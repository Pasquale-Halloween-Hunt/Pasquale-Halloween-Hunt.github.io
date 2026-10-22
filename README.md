# Halloween Hunt — website prototype

It is a static, framework-free site with 12 challenges, local progress, a final anagram, and the CSS haunted house animation. Preview it through a local web server or deploy it to GitHub Pages; the reorganized JavaScript uses browser modules and should not be opened with a `file://` URL.

For deployment, upload `index.html` together with the `css`, `js`, `challenges`, and `assets` directories to a GitHub Pages repository.

The site installs an offline cache after the first successful page load. That first visit downloads the home page, styles, app code, and all 12 challenges, so scanned challenge links continue to work with weak or missing Wi-Fi afterward. Open the deployed site once on every device before the event and wait for that first load to finish. Service workers require HTTPS (GitHub Pages provides it) or `localhost`; they do not run from a `file://` URL.

Each challenge has two URL forms:

- NFC tags and QR codes use non-sequential token URLs such as `https://YOUR-SITE/?tag=pYX8yQ6OQdhQReHX`. Visiting a valid tag URL unlocks its mapped challenge in the current browser. The 12 tokens are stored in challenge order in `js/config.js`.
- Normal challenge links use `https://YOUR-SITE/?challenge=01` through `?challenge=12`. These links only open after their matching tag has been found.
- The organizer shortcut `https://YOUR-SITE/?tag=master` unlocks all 12 challenges in the current browser.

Unlocks and completed challenges are stored in the browser's `localStorage`.

On the first visit, players choose Normal, Challenging, or Nightmare difficulty. The selection is saved in `localStorage` and can be changed from the difficulty button beside the charm counter. Challenges can define different content and rules for each difficulty; the graveyard and potion challenges currently do so.

## Project structure

- `css/` contains shared site styles and the haunted-house scene styles.
- `js/` contains the overarching app, navigation, progress, and challenge registry.
- `challenges/` contains one JavaScript module per numbered challenge, plus a shared photo-challenge helper.
- `assets/` is reserved for images, audio, video, fonts, and other static media.

## Event photos

Photo challenges #5 and #10 upload JPEGs to the Cloudflare Worker configured in `js/config.js`. The browser resizes new uploads to at most 2,400 pixels on the longest side at JPEG quality 0.82. The Worker source is tracked in `worker/worker.js` and uses the R2 bucket binding `PHOTOS` (`pasquale-halloween-photos`). Deploy that source to the `halloween-photo-upload` Worker before using the directory or slideshow.

`gallery.html` is the organizer directory. It shows a bird folder and a tractor folder, with skip/include, delete, individual download, folder ZIP, and both-folders ZIP actions. `slideshow.html` is the organizer's full-screen display. It always combines both folders. Existing photos rotate in a queue; new photos play next in upload order and then join that rotation. The display checks for changes every four seconds. Skipped and deleted photos leave the queue on refresh. Photo pages, scripts, lists, and images use network requests without caching; the slideshow needs a connection.

The directory, slideshow, and image endpoints require a Cloudflare Worker secret named `ADMIN_TOKEN`. Set a long, random value in the Worker's **Settings → Variables and Secrets**. Enter it in the directory login; the page keeps it only for the current browser tab and passes it to the slideshow window on the same site. A direct visit to the slideshow asks for it. The Worker will return a 503 for organizer actions until the secret is set. Keep this token private. Player uploads do not require it.

The upload endpoint now issues a separate replacement token for each uploaded photo. It will delete a previous upload only when the browser provides that token. Older uploads made before this change have no replacement token, so re-uploading from the same browser may leave the earlier image in the directory; an organizer can remove it there.

## Other notes

- Unlocks and progress are stored in browser `localStorage` only. Clearing storage or switching devices loses them.
- The haunted house runs in the browser in this prototype. If desired, record it as MP4 and replace the scene with a video element for consistent playback on slower phones.
- The constellation and potion are implemented as browser interactions. Test touch interactions and camera upload on actual iOS and Android devices before the event.
- The final answer is `TRICK OR TREAT`.
- For production, consider hiding the all-challenges index if you want discovery to happen exclusively through physical tags.
