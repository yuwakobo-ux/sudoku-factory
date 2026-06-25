# Sudoku Factory

Sudoku Factory / ナンプレ工場 Ver.0.2 is an ad-free, smartphone-friendly Sudoku PWA built with static HTML, CSS, and JavaScript.

## Ver.0.2 Summary

- One-screen-first smartphone layout with reduced vertical spacing
- Larger 9x9 Sudoku board
- Compact puzzle selector and status area
- Number pad directly under the board
- Compact action button grid
- Selected cell, row, column, 3x3 block, and same-number highlights
- User-entered numbers look different from fixed given numbers
- Wrong cells stay highlighted red after mistake check
- Three fixed puzzles: easy, normal, hard
- Local progress saving per puzzle with localStorage
- PWA basics with `manifest.webmanifest` and `service-worker.js`
- No ads, no backend, no paid API, no external dependencies

## File Structure

- `index.html` - main app screen
- `style.css` - compact smartphone-first layout and highlight styling
- `app.js` - game interaction, saving, checks, hints, reset, highlights, service worker registration
- `puzzles.js` - three fixed Ver.0.2 puzzles
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

- Ver.0.2 still uses only three fixed puzzles.
- There is no notes mode, timer, puzzle generator, account system, backend, or ads.
- Hints reveal correct values immediately and do not track a score.
- Very small phone screens may still need slight scrolling depending on browser toolbar height.

## Roadmap

- Test on real iPhone and Android screen sizes.
- Add more curated puzzles.
- Add optional notes mode only after the one-screen layout is stable.
- Add timer and simple completion stats later.
