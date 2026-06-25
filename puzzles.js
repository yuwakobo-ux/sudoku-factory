(function () {
  "use strict";

  const BASE_SOLUTIONS = [
    "534678912672195348198342567859761423426853791713924856961537284287419635345286179",
    "435269781682571493197834562826195347374682915951743628519326874248957136763418259",
    "462831957795426183381795426173984265659312748248567319926178534834259671517643892",
    "123456789456789123789123456214365897365897214897214365531642978642978531978531642"
  ];

  const DIFFICULTY_CONFIG = [
    { difficulty: "easy", title: "Easy", givens: 42 },
    { difficulty: "normal", title: "Normal", givens: 34 },
    { difficulty: "hard", title: "Hard", givens: 28 }
  ];

  function rotateGrid(solution, turns) {
    let current = solution;
    for (let turn = 0; turn < turns; turn += 1) {
      let next = "";
      for (let row = 0; row < 9; row += 1) {
        for (let col = 0; col < 9; col += 1) {
          next += current[(8 - col) * 9 + row];
        }
      }
      current = next;
    }
    return current;
  }

  function swapDigits(solution, seed) {
    const digits = "123456789".split("");
    for (let i = digits.length - 1; i > 0; i -= 1) {
      const j = (seed + i * 7 + seed * i) % (i + 1);
      const tmp = digits[i];
      digits[i] = digits[j];
      digits[j] = tmp;
    }
    const map = {};
    "123456789".split("").forEach((digit, index) => {
      map[digit] = digits[index];
    });
    return solution.split("").map((digit) => map[digit]).join("");
  }

  function shuffledIndexes(seed) {
    const indexes = Array.from({ length: 81 }, (_, index) => index);
    let value = seed * 1103515245 + 12345;
    for (let i = indexes.length - 1; i > 0; i -= 1) {
      value = (value * 1103515245 + 12345) & 0x7fffffff;
      const j = value % (i + 1);
      const tmp = indexes[i];
      indexes[i] = indexes[j];
      indexes[j] = tmp;
    }
    return indexes;
  }

  function makeGivens(solution, count, seed) {
    const cells = Array(81).fill("0");
    shuffledIndexes(seed).slice(0, count).forEach((index) => {
      cells[index] = solution[index];
    });
    return cells.join("");
  }

  const puzzles = [];
  DIFFICULTY_CONFIG.forEach((config, difficultyIndex) => {
    for (let number = 1; number <= 20; number += 1) {
      const seed = difficultyIndex * 100 + number;
      const base = BASE_SOLUTIONS[seed % BASE_SOLUTIONS.length];
      const solution = swapDigits(rotateGrid(base, seed % 4), seed + 17);
      puzzles.push({
        id: `${config.difficulty}-${String(number).padStart(3, "0")}`,
        title: `${config.title} ${String(number).padStart(3, "0")}`,
        difficulty: config.difficulty,
        givens: makeGivens(solution, config.givens, seed + 31),
        solution
      });
    }
  });

  window.SUDOKU_PUZZLES = puzzles;
})();
