# Sudoku Factory

Sudoku Factory / ナンプレ工場 Ver.0.1 is an ad-free, smartphone-friendly Sudoku PWA built with static HTML, CSS, and JavaScript.

## Ver.0.1 Summary

- 9x9 Sudoku board for mobile play
- Three fixed puzzles: easy, normal, hard
- Editable empty cells and locked given numbers
- Number pad, clear button, mistake check, completion check, hints, and reset
- Local progress saving per puzzle with localStorage
- PWA basics with `manifest.webmanifest` and `service-worker.js`
- No ads, no backend, no paid API, no external dependencies

## File Structure

- `index.html` - main app screen
- `style.css` - smartphone-first layout and styling
- `app.js` - game interaction, saving, checks, hints, reset, service worker registration
- `puzzles.js` - three fixed Ver.0.1 puzzles
- `manifest.webmanifest` - PWA manifest
- `service-worker.js` - simple offline cache
- `verify-static.js` - local static verification script
- `OPEN_ME_FIRST.html` - reviewer guide
- `README.md` - project notes

## How To Verify

Run these commands from the project folder:

```bash
node --check app.js
node --check puzzles.js
node --check service-worker.js
node verify-static.js
```

## GitHub Pages

Target URL:

https://yuwakobo-ux.github.io/sudoku-factory/

## Known Limitations

- Ver.0.1 uses only three fixed puzzles.
- There is no notes mode, timer, puzzle generator, account system, backend, or ads.
- Hints reveal correct values immediately and do not track a score.
- The service worker works after the app has been opened once from a web server or GitHub Pages.

## Roadmap

- Add more curated puzzles.
- Add optional notes mode.
- Add timer and simple completion stats.
- Add puzzle generator only after the static Ver.0.1 app is stable.
