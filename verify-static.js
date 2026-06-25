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

function assertPuzzleData(puzzles) {
  if (!Array.isArray(puzzles)) {
    fail("SUDOKU_PUZZLES must be an array.");
  }
  if (puzzles.length !== 3) {
    fail(`Expected exactly 3 puzzles, found ${puzzles.length}.`);
  }

  const ids = new Set();
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
    if (!/^[0-9]{81}$/.test(puzzle.givens)) {
      fail(`Givens must be 81 digits for ${puzzle.id}.`);
    }
    if (!/^[1-9]{81}$/.test(puzzle.solution)) {
      fail(`Solution must be 81 digits from 1 to 9 for ${puzzle.id}.`);
    }
    if (!isValidCompletedSudoku(puzzle.solution)) {
      fail(`Solution is not a valid completed Sudoku for ${puzzle.id}.`);
    }

    for (let index = 0; index < 81; index += 1) {
      const given = puzzle.givens[index];
      if (given !== "0" && given !== puzzle.solution[index]) {
        fail(`Given conflicts with solution in ${puzzle.id} at index ${index}.`);
      }
    }
  }
}

assertRequiredFiles();
assertPuzzleData(loadPuzzles());
console.log("Static verification passed: required files and puzzle data are valid.");
