# Sudoku Factory

Sudoku Factory / ナンプレ工場 Ver.0.5 is an ad-free, smartphone-friendly Sudoku PWA built with static HTML, CSS, and JavaScript.

## Ver.0.5 Notes

Ver.0.5 is a high-contrast visual redesign. It does not add gameplay features; it makes the existing highlights obvious on a real smartphone screen.

## High-Contrast Highlight System

- Selected cell: strong blue fill, thick dark border, visible outline, shadow, and slight scale.
- Same number: clear yellow fill with an inner accent ring.
- Row and column: light blue fill.
- 3x3 block: light green fill.
- Wrong cells: strong red/pink fill with dark red border and red text.
- Fixed givens: black, bold text.
- User-entered numbers: clear blue text, visually different from fixed givens.
- Compact legend: shows 選択中, 同じ数字, and 関連マス when screen height allows.

## Number Pad

- The number matching the selected cell is strongly highlighted in yellow.
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
- `style.css` - compact smartphone layout and Ver.0.5 high-contrast highlight system
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

- Ver.0.5 still uses only three fixed puzzles.
- There is no notes mode, timer, puzzle generator, account system, backend, or ads.
- Hints reveal correct values immediately and do not track a score.
- Very small phone screens hide the legend and may still need slight scrolling depending on browser toolbar height.

## Roadmap

- Compare Ver.0.5 screenshots against Ver.0.4 on a real iPhone.
- Tune only color intensity if any state still feels unclear.
- Add more curated puzzles later.
