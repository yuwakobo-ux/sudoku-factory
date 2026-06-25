# Sudoku Factory

Sudoku Factory / ナンプレ工場 Ver1.0 is the complete static edition of the smartphone Sudoku PWA.

## Ver1.0 Summary

- 60 fixed Sudoku puzzles
- Easy: 20
- Normal: 20
- Hard: 20
- Total: 60
- Home progress summary by difficulty and total completion
- Puzzle list with `not_started`, `playing`, and `cleared` states
- Continue button for the last playing puzzle
- Local progress saving with localStorage
- Completion check marks a puzzle as cleared
- Reset current puzzle
- Reset all progress with confirmation

## Kept Features

- 9x9 smartphone board
- Fixed givens cannot be edited
- Number pad 1 to 9
- Clear selected cell
- Mistake check
- Completion check
- Hints 1, 2, and 3
- PWA basics with `manifest.webmanifest` and `service-worker.js`
- No ads, no backend, no paid API, no external dependencies

## File Structure

- `index.html` - app screen and home/progress layout
- `style.css` - smartphone layout and high-contrast visual states
- `app.js` - gameplay, progress states, continue, resets, and localStorage
- `puzzles.js` - 60 generated fixed puzzle records
- `manifest.webmanifest` - PWA manifest
- `service-worker.js` - offline cache
- `verify-static.js` - static data verification
- `OPEN_ME_FIRST.html` - review guide
- `README.md` - project notes

## How To Verify

Run:

```bash
node --check app.js
node --check puzzles.js
node --check service-worker.js
node verify-static.js
```

The verifier checks required files, exactly 60 puzzles, 20 per difficulty, unique ids, valid difficulties, 81-character givens and solutions, valid completed Sudoku solutions, givens matching solutions, and duplicate puzzle data.

## GitHub Pages

https://yuwakobo-ux.github.io/sudoku-factory/

## Known Limits

- No notes mode
- No timer
- No puzzle generator
- No accounts
- No backend
- No ads
- The 60 puzzles are fixed static content
