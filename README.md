# Sudoku Factory

Sudoku Factory / ナンプレ工場 Ver.0.4 is an ad-free, smartphone-friendly Sudoku PWA built with static HTML, CSS, and JavaScript.

## Ver.0.4 Notes

Ver.0.4 is a professional smartphone UI polish release. It does not add gameplay features; it makes the existing board easier to read during actual play.

## Highlight System

- Wrong cells: strongest warning state with red fill, dark red border, and dark red text.
- Selected cell: strongest normal focus state with dark green fill, thick border, shadow, and slight scale.
- Same number: warm yellow fill with an inner accent.
- Same row and column: pale blue fill.
- Same 3x3 block: pale green-neutral fill.
- Fixed givens: black, bold text.
- User-entered numbers: blue-teal text with normal weight.
- Normal cells: warm white background.

## Number Pad

- The number matching the selected cell is strongly highlighted.
- Numbers that already appear 9 times are muted as completed.
- Completed numbers remain tappable for usability.

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
- `style.css` - compact smartphone layout and Ver.0.4 visual hierarchy
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

- Ver.0.4 still uses only three fixed puzzles.
- There is no notes mode, timer, puzzle generator, account system, backend, or ads.
- Hints reveal correct values immediately and do not track a score.
- Very small phone screens may still need slight scrolling depending on browser toolbar height.

## Roadmap

- Test Ver.0.4 on real iPhone and Android screens.
- Tune color intensity only if any state still feels ambiguous.
- Add more curated puzzles later.
