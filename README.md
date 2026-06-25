# Sudoku Factory

Sudoku Factory / ナンプレ工場 Ver.0.3 is an ad-free, smartphone-friendly Sudoku PWA built with static HTML, CSS, and JavaScript.

## Ver.0.3 Notes

- Keeps the Ver.0.2 one-screen smartphone layout.
- Improves visual clarity with distinct color roles.
- Selected cell is the strongest normal highlight.
- Same number uses a warm pale yellow.
- Same row and column use pale blue.
- Same 3x3 block uses pale green-neutral.
- Wrong cells use red/pink and keep highest priority.
- Fixed givens use dark bold text.
- User-entered numbers use blue-teal text.
- Number pad highlights the selected cell's number.
- Number pad mutes numbers that already appear 9 times.

## Current Features

- 9x9 Sudoku board for mobile play
- Three fixed puzzles: easy, normal, hard
- Editable empty cells and locked given numbers
- Number pad, clear button, mistake check, completion check, hints, and reset
- Local progress saving per puzzle with localStorage
- PWA basics with `manifest.webmanifest` and `service-worker.js`
- No ads, no backend, no paid API, no external dependencies

## File Structure

- `index.html` - main app screen
- `style.css` - compact smartphone layout and Ver.0.3 color roles
- `app.js` - game interaction, saving, checks, hints, reset, highlights, number-pad feedback, service worker registration
- `puzzles.js` - three fixed puzzles
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

Published URL:

https://yuwakobo-ux.github.io/sudoku-factory/

## Known Limitations

- Ver.0.3 still uses only three fixed puzzles.
- There is no notes mode, timer, puzzle generator, account system, backend, or ads.
- Hints reveal correct values immediately and do not track a score.
- Very small phone screens may still need slight scrolling depending on browser toolbar height.

## Roadmap

- Test Ver.0.3 color contrast on real iPhone and Android screens.
- Tune colors if a highlight role still feels ambiguous.
- Add more curated puzzles.
- Add optional notes mode only after the one-screen layout stays stable.
