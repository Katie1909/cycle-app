# Cycle

A personal cycle-tracking app: what to eat and how to train today, based on
where you are in your cycle. Single user, no accounts, no server — everything
lives in your phone's browser storage.

## Run it locally

No build step. From this folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000 — or http://localhost:8000/test.html to run
the logic tests.

## Deploy (GitHub Pages)

1. Push this repo to GitHub.
2. Repo Settings → Pages → Deploy from branch → `main` / root.
3. Open the published URL on your phone, then Share → Add to Home Screen.

## Files

- `index.html` — the three screens (Home, History, Settings)
- `app.js` — cycle-day/phase math + all UI wiring
- `content.js` — the food/training copy for each phase
- `styles.css` — one styling pass, phone-first
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` — PWA/offline setup
- `test.html` — plain-JS assertions for the cycle math, no framework

## Backup

localStorage is not a backup. Use Settings → Export my data occasionally.
