"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const requiredFiles = [
  "index.html",
  "style.css",
  "app.js",
  "puzzles.js",
  "manifest.webmanifest",
  "service-worker.js",
  "verify-static.js",
  "README.md",
  "OPEN_ME_FIRST.html"
];

const allowedDifficulties = new Set(["easy", "normal", "hard"]);

function fail(message) {
  throw new Error(message);
}

function assertRequiredFiles() {
  for (const file of requiredFiles) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) {
      fail(`Missing required file: ${file}`);
    }
  }
}

function loadPuzzles() {
  const code = fs.readFileSync(path.join(root, "puzzles.js"), "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: "puzzles.js" });
  return sandbox.window.SUDOKU_PUZZLES;
}

function isValidCompletedSudoku(solution) {
  const expected = "123456789";
  const sorted = (value) => value.split("").sort().join("");

  for (let row = 0; row < 9; row += 1) {
    const values = solution.slice(row * 9, row * 9 + 9);
    if (sorted(values) !== expected) {
      return false;
    }
  }

  for (let col = 0; col < 9; col += 1) {
    let values = "";
    for (let row = 0; row < 9; row += 1) {
      values += solution[row * 9 + col];
    }
    if (sorted(values) !== expected) {
      return false;
    }
  }

  for (let boxRow = 0; boxRow < 3; boxRow += 1) {
    for (let boxCol = 0; boxCol < 3; boxCol += 1) {
      let values = "";
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 3; col += 1) {
          const index = (boxRow * 3 + row) * 9 + (boxCol * 3 + col);
          values += solution[index];
        }
      }
      if (sorted(values) !== expected) {
        return false;
      }
    }
  }

  return true;
}

function countSolutions(givens, limit = 2) {
  const cells = givens.split("").map((value) => (value === "0" ? 0 : Number(value)));
  const rows = Array(9).fill(0);
  const cols = Array(9).fill(0);
  const boxes = Array(9).fill(0);

  for (let index = 0; index < 81; index += 1) {
    const value = cells[index];
    if (!value) {
      continue;
    }
    const row = Math.floor(index / 9);
    const col = index % 9;
    const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    const bit = 1 << value;
    if ((rows[row] & bit) || (cols[col] & bit) || (boxes[box] & bit)) {
      return 0;
    }
    rows[row] |= bit;
    cols[col] |= bit;
    boxes[box] |= bit;
  }

  let solutionCount = 0;

  function solve() {
    if (solutionCount >= limit) {
      return;
    }

    let bestIndex = -1;
    let bestMask = 0;
    let bestOptionCount = 10;

    for (let index = 0; index < 81; index += 1) {
      if (cells[index]) {
        continue;
      }
      const row = Math.floor(index / 9);
      const col = index % 9;
      const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
      const used = rows[row] | cols[col] | boxes[box];
      let mask = 0;
      let optionCount = 0;

      for (let value = 1; value <= 9; value += 1) {
        const bit = 1 << value;
        if (!(used & bit)) {
          mask |= bit;
          optionCount += 1;
        }
      }

      if (optionCount === 0) {
        return;
      }
      if (optionCount < bestOptionCount) {
        bestIndex = index;
        bestMask = mask;
        bestOptionCount = optionCount;
        if (optionCount === 1) {
          break;
        }
      }
    }

    if (bestIndex === -1) {
      solutionCount += 1;
      return;
    }

    const row = Math.floor(bestIndex / 9);
    const col = bestIndex % 9;
    const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
    for (let value = 1; value <= 9; value += 1) {
      const bit = 1 << value;
      if (!(bestMask & bit)) {
        continue;
      }
      cells[bestIndex] = value;
      rows[row] |= bit;
      cols[col] |= bit;
      boxes[box] |= bit;
      solve();
      rows[row] &= ~bit;
      cols[col] &= ~bit;
      boxes[box] &= ~bit;
      cells[bestIndex] = 0;
      if (solutionCount >= limit) {
        return;
      }
    }
  }

  solve();
  return solutionCount;
}

function assertPuzzleData(puzzles) {
  if (!Array.isArray(puzzles)) {
    fail("SUDOKU_PUZZLES must be an array.");
  }
  if (puzzles.length !== 60) {
    fail(`Expected exactly 60 puzzles, found ${puzzles.length}.`);
  }

  const ids = new Set();
  const givensSet = new Set();
  const puzzleSet = new Set();
  const counts = { easy: 0, normal: 0, hard: 0 };
  for (const puzzle of puzzles) {
    for (const field of ["id", "title", "difficulty", "givens", "solution"]) {
      if (!puzzle[field]) {
        fail(`Puzzle is missing field: ${field}`);
      }
    }

    if (ids.has(puzzle.id)) {
      fail(`Duplicate puzzle id: ${puzzle.id}`);
    }
    ids.add(puzzle.id);

    if (!allowedDifficulties.has(puzzle.difficulty)) {
      fail(`Invalid difficulty for ${puzzle.id}: ${puzzle.difficulty}`);
    }
    counts[puzzle.difficulty] += 1;
    if (!/^[0-9]{81}$/.test(puzzle.givens)) {
      fail(`Givens must be 81 digits for ${puzzle.id}.`);
    }
    if (!/^[1-9]{81}$/.test(puzzle.solution)) {
      fail(`Solution must be 81 digits from 1 to 9 for ${puzzle.id}.`);
    }
    if (!isValidCompletedSudoku(puzzle.solution)) {
      fail(`Solution is not a valid completed Sudoku for ${puzzle.id}.`);
    }
    if (givensSet.has(puzzle.givens)) {
      fail(`Duplicate givens found for ${puzzle.id}.`);
    }
    givensSet.add(puzzle.givens);
    const puzzleFingerprint = `${puzzle.givens}:${puzzle.solution}`;
    if (puzzleSet.has(puzzleFingerprint)) {
      fail(`Duplicate puzzle found for ${puzzle.id}.`);
    }
    puzzleSet.add(puzzleFingerprint);

    for (let index = 0; index < 81; index += 1) {
      const given = puzzle.givens[index];
      if (given !== "0" && given !== puzzle.solution[index]) {
        fail(`Given conflicts with solution in ${puzzle.id} at index ${index}.`);
      }
    }

    const solutionCount = countSolutions(puzzle.givens, 2);
    if (solutionCount !== 1) {
      const result = solutionCount >= 2 ? "multiple solutions" : "zero solutions";
      fail(`Puzzle ${puzzle.id} must have exactly one solution, found ${result}.`);
    }
  }

  for (const difficulty of allowedDifficulties) {
    if (counts[difficulty] !== 20) {
      fail(`Expected 20 ${difficulty} puzzles, found ${counts[difficulty]}.`);
    }
  }
}

assertRequiredFiles();
assertPuzzleData(loadPuzzles());
console.log("Static verification passed: 60 valid uniquely solvable puzzles, unique ids, and 20 puzzles per difficulty.");
