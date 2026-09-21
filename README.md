# Steven Paré – site recreation

Static site: HTML + CSS + JS, no build step.

## Files you still need to add
Put these in `images/` (get the originals from the site owner):

| File               | Used on                        |
|--------------------|--------------------------------|
| `hero.jpg`         | home hero + About-me background |
| `about.jpg`        | textured background under the sections |

`images/starry-night.jpg` and `audio/starry-night.mp3` are included.

## Things to fill in
- Videos: in each `<div class="yt" data-id="YOUR_VIDEO_ID">` replace `YOUR_VIDEO_ID` with the YouTube ID (the part after `v=`).
- `contact.html`: replace `YOUR_FORM_ID` in the form action (free at formspree.io).
- `about.html`: the original page's text didn't load, so it reuses the home bio.

## Deploy on GitHub Pages
1. Create a repo and push the contents of this folder to the root of `main`.
2. Repo > Settings > Pages > Source: "Deploy from a branch" > `main` / `(root)`.

## Tuning
- Tab-switch backdrop: `VEIL_HOLD` in `js/main.js` (400 = stays 0.4 s once the page has loaded; fades add ~0.6 s).
- Hero parallax speed: `RATE` near the top of `js/main.js` (0.75 = photo moves at 25% of scroll speed).

## Testing locally (important for the YouTube videos)
YouTube shows "Error 153" if the page sends no Referer, which is what happens when you double-click
`index.html` (a `file://` address). In that case the site shows a poster that opens the video on YouTube.
To see the real inline players, use a local server or deploy to GitHub Pages:

    cd stevenpar-site
    python -m http.server 8000      # then open http://localhost:8000

## Making the contact form send email (Formspree)
GitHub Pages is static, so the form posts to a form service.
1. Sign up at https://formspree.io with the email address that should receive the messages.
2. Create a new form and copy its endpoint, which looks like `https://formspree.io/f/abcdwxyz`.
3. In `contact.html`, replace `https://formspree.io/f/YOUR_FORM_ID` in the `<form action="...">` with that endpoint.
4. Deploy (or run the local server above), send a test message, and confirm anything Formspree emails you.
The hidden `_gotcha` field is a spam trap; leave it in place. Any other form service works the same way:
change only the `action` URL.
