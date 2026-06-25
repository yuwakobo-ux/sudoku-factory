# Sudoku Factory

Sudoku Factory / ナンプレ工場 Ver1.1.1 is a static smartphone Sudoku PWA.

## Ver1.1.1 Hotfix

- Fixes a smartphone black-board failure caused by cached/mismatched Ver1.1 assets.
- Adds cache-busted CSS/JS/puzzle URLs.
- Updates the service worker cache to `sudoku-factory-ver1-1-1`.
- Uses network-first loading for HTML documents so updates are less likely to be hidden by the old cache.
- Removes `Array.flatMap` from the progress migration path for wider mobile browser compatibility.
- Keeps one Hint button, 60 puzzles, progress saving, current reset, and all-progress reset.

## Ver1.1 Summary

- Keeps the same 60 puzzles from Ver1.0.
- Removes Hint 2 and Hint 3.
- Keeps one Hint button.
- Adds clear puzzle selection with Difficulty and Puzzle number selects.
- Shows selected puzzle status as `new`, `playing`, or `cleared`.
- Keeps compact progress summary: Easy, Normal, Hard, Total.
- Keeps Continue as `続きから` for the last playing puzzle.
- Reorganizes actions into two rows:
  - Mistake Check / Completion Check / Hint
  - Reset Current / Reset All / Continue

## Puzzle Content

- Easy: 20
- Normal: 20
- Hard: 20
- Total: 60

## Kept Features

- 9x9 smartphone board
- Fixed givens cannot be edited
- Number pad 1 to 9
- Clear selected cell
- Mistake check
- Completion check
- One-cell hint
- Reset current puzzle
- Reset all progress with confirmation
- Local progress saving with localStorage
- PWA basics with `manifest.webmanifest` and `service-worker.js`

## Not Included

- Notes
- Timer
- Puzzle generator
- Ads
- Backend
- Accounts
- New puzzles

## Verify

```bash
node --check app.js
node --check puzzles.js
node --check service-worker.js
node verify-static.js
```

## GitHub Pages

https://yuwakobo-ux.github.io/sudoku-factory/
