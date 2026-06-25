# Sudoku Factory

Sudoku Factory / ナンプレ工場 Ver.0.6 is an ad-free, smartphone-friendly Sudoku PWA built with static HTML, CSS, and JavaScript.

## Ver.0.6 Notes

Ver.0.6 fixes real-device iPhone Safari/Chrome layout differences and makes the highlight states much more forceful. It does not add gameplay features.

## Safari / Chrome Layout Fix

- Board sizing is now width-first: `width: min(96vw, 608px)`.
- The board no longer depends on `100dvh` for its main size, avoiding Safari toolbar-height shrinkage.
- The app shell uses `100svh` and `100dvh` together for better mobile viewport behavior.
- The legend is hidden by default so it cannot reduce board size.
- Board remains square through `aspect-ratio: 1`.

## High-Contrast Highlight System

Priority is enforced as:

wrong > selected > same number > row/column > block > normal

- Selected cell: strong blue background, white text, thick dark outline, shadow, and slight scale.
- Same number: bright yellow background.
- Row and column: obvious light blue background.
- 3x3 block: obvious light green background.
- Wrong cells: strong pink/red background, dark red border, red text.
- Fixed givens: black, bold text.
- User-entered numbers: clear blue text.

## Visual Test Mode

Open this URL to force a quick visual style check:

https://yuwakobo-ux.github.io/sudoku-factory/?color-test=1

Use it only for review. Normal gameplay does not show a debug control.

## Current Features

- 9x9 Sudoku board for mobile play
- Three fixed puzzles: easy, normal, hard
- Editable empty cells and locked given numbers
- Number pad, clear button, mistake check, completion check, hints, and reset
- Local progress saving per puzzle with localStorage
- PWA basics with `manifest.webmanifest` and `service-worker.js`
- No ads, no backend, no paid API, no external dependencies

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

- Ver.0.6 still uses only three fixed puzzles.
- There is no notes mode, timer, puzzle generator, account system, backend, or ads.
- On very small phones, vertical scrolling may still happen depending on browser toolbar height.

## Roadmap

- Compare Safari and Chrome screenshots on the same iPhone.
- Use `?color-test=1` to confirm all visual states are unmistakable.
- Tune spacing only if one-screen play still fails on a specific model.
