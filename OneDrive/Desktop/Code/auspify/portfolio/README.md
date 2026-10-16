# Personal Portfolio Website

A responsive personal portfolio built with plain HTML, CSS, and JavaScript.
It contains four sections — **Home**, **About**, **Projects**, and **Contact** —
and can be deployed as a static site.

## Files

- `index.html` — page structure (hero, about, projects, contact, footer)
- `style.css` — responsive styling and the site's color theme
- `script.js` — navigation, animations, and the contact form

## Running locally

Open `index.html` in any browser, or serve the folder with any static server, for
example:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploying to Netlify

1. Push these files to a Git repository on GitHub.
2. Go to [Netlify](https://app.netlify.com) and choose **Add new site → Import an existing project**.
3. Connect the Git repository and deploy. Netlify detects the static `index.html` automatically.
4. The site is published at `https://<site-name>.netlify.app`.

The contact form runs entirely in the browser, so no backend is required.
