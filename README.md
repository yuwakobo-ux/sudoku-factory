# Sudoku Factory

Sudoku Factory / ナンプレ工場 Ver1.1.1 is a static smartphone Sudoku PWA.

## Critical Puzzle Integrity Fix

- Replaced the Ver1.0/Ver1.1 puzzle set because many puzzles were not uniquely solvable.
- Every included puzzle now has exactly one solution.
- `verify-static.js` now counts Sudoku solutions and fails if any puzzle has zero or multiple solutions.
- This uniqueness check runs for all 60 puzzles on every future verification.
- Puzzle gameplay, buttons, progress saving, and layout are unchanged.

## Puzzle Content

- Easy: 20 puzzles
- Normal: 20 puzzles
- Hard: 20 puzzles
- Total: 60 puzzles
- All puzzle ids are unique.
- All givens match their stored completed solution.
- All puzzles are uniquely solvable.

## Ver1.1.1 Hotfix

- Fixed a smartphone black-board failure caused by cached/mismatched Ver1.1 assets.
- Added cache-busted CSS/JS/puzzle URLs.
- Updated the service worker cache.
- Uses network-first loading for HTML documents so updates are less likely to be hidden by old cache.
- Keeps one Hint button, 60 puzzles, progress saving, current reset, and all-progress reset.

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

## Verify

```bash
node --check app.js
node --check puzzles.js
node --check service-worker.js
node verify-static.js
```

Expected result:

```text
Static verification passed: 60 valid uniquely solvable puzzles, unique ids, and 20 puzzles per difficulty.
```

## GitHub Pages

https://yuwakobo-ux.github.io/sudoku-factory/
