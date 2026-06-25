(function () {
  "use strict";

  const VERSION = "v1.0";
  const puzzles = window.SUDOKU_PUZZLES || [];
  const boardEl = document.getElementById("board");
  const numberPadEl = document.getElementById("numberPad");
  const puzzleSelectEl = document.getElementById("puzzleSelect");
  const messageEl = document.getElementById("message");
  const progressSummaryEl = document.getElementById("progressSummary");
  const puzzleListEl = document.getElementById("puzzleList");
  const continuePuzzleBtn = document.getElementById("continuePuzzle");
  const resetAllProgressBtn = document.getElementById("resetAllProgress");
  const clearCellBtn = document.getElementById("clearCell");
  const checkMistakesBtn = document.getElementById("checkMistakes");
  const checkCompleteBtn = document.getElementById("checkComplete");
  const hintOneBtn = document.getElementById("hintOne");
  const hintTwoBtn = document.getElementById("hintTwo");
  const hintThreeBtn = document.getElementById("hintThree");
  const resetPuzzleBtn = document.getElementById("resetPuzzle");

  let currentPuzzle = puzzles[0];
  let board = currentPuzzle ? currentPuzzle.givens.split("") : [];
  let selectedIndex = -1;
  let wrongIndexes = new Set();
  let revealedIndexes = new Set();

  function boardKey(puzzleId) {
    return `sudoku-factory:${VERSION}:board:${puzzleId}`;
  }

  function stateKey(puzzleId) {
    return `sudoku-factory:${VERSION}:state:${puzzleId}`;
  }

  function lastKey() {
    return `sudoku-factory:${VERSION}:last-playing`;
  }

  function oldBoardKeys(puzzleId) {
    return ["v0.6", "v0.5", "v0.4", "v0.3", "v0.2", "v0.1"].map((version) => `sudoku-factory:${version}:${puzzleId}`);
  }

  function setMessage(text) {
    messageEl.textContent = text;
  }

  function savedBoardFor(puzzle) {
    const current = localStorage.getItem(boardKey(puzzle.id));
    if (current && current.length === 81) {
      return current;
    }
    for (const key of oldBoardKeys(puzzle.id)) {
      const saved = localStorage.getItem(key);
      if (saved && saved.length === 81) {
        return saved;
      }
    }
    return "";
  }

  function getPuzzleState(puzzle) {
    const explicit = localStorage.getItem(stateKey(puzzle.id));
    if (explicit === "cleared") {
      return "cleared";
    }
    const saved = savedBoardFor(puzzle);
    if (saved && saved !== puzzle.givens) {
      return "playing";
    }
    return "not_started";
  }

  function setPuzzleState(puzzleId, state) {
    localStorage.setItem(stateKey(puzzleId), state);
  }

  function loadProgress(puzzle) {
    const saved = savedBoardFor(puzzle);
    if (saved && saved.length === 81) {
      board = saved.split("");
      for (let i = 0; i < 81; i += 1) {
        if (puzzle.givens[i] !== "0") {
          board[i] = puzzle.givens[i];
        }
      }
      saveProgress(false);
      return;
    }
    board = puzzle.givens.split("");
  }

  function saveProgress(markPlaying) {
    if (!currentPuzzle) {
      return;
    }
    localStorage.setItem(boardKey(currentPuzzle.id), board.join(""));
    if (markPlaying && board.join("") !== currentPuzzle.givens && getPuzzleState(currentPuzzle) !== "cleared") {
      setPuzzleState(currentPuzzle.id, "playing");
      localStorage.setItem(lastKey(), currentPuzzle.id);
    }
    renderHome();
  }

  function clearProgressForPuzzle(puzzle) {
    localStorage.removeItem(boardKey(puzzle.id));
    localStorage.removeItem(stateKey(puzzle.id));
    oldBoardKeys(puzzle.id).forEach((key) => localStorage.removeItem(key));
  }

  function isFixed(index) {
    return currentPuzzle.givens[index] !== "0";
  }

  function sameBlock(a, b) {
    const aRow = Math.floor(a / 9);
    const aCol = a % 9;
    const bRow = Math.floor(b / 9);
    const bCol = b % 9;
    return Math.floor(aRow / 3) === Math.floor(bRow / 3) &&
      Math.floor(aCol / 3) === Math.floor(bCol / 3);
  }

  function numberCounts() {
    const counts = {};
    for (let number = 1; number <= 9; number += 1) {
      counts[String(number)] = 0;
    }
    board.forEach((value) => {
      if (counts[value] !== undefined) {
        counts[value] += 1;
      }
    });
    return counts;
  }

  function difficultyLabel(difficulty) {
    return { easy: "Easy", normal: "Normal", hard: "Hard" }[difficulty] || difficulty;
  }

  function puzzleNumber(puzzle) {
    return puzzle.id.split("-")[1] || puzzle.id;
  }

  function progressStats() {
    const stats = {
      easy: { cleared: 0, total: 0 },
      normal: { cleared: 0, total: 0 },
      hard: { cleared: 0, total: 0 },
      total: { cleared: 0, total: puzzles.length }
    };
    puzzles.forEach((puzzle) => {
      stats[puzzle.difficulty].total += 1;
      if (getPuzzleState(puzzle) === "cleared") {
        stats[puzzle.difficulty].cleared += 1;
        stats.total.cleared += 1;
      }
    });
    return stats;
  }

  function renderHome() {
    const stats = progressStats();
    const percent = stats.total.total === 0 ? 0 : Math.round((stats.total.cleared / stats.total.total) * 100);
    progressSummaryEl.innerHTML = `
      <span>Easy ${stats.easy.cleared} / ${stats.easy.total}</span>
      <span>Normal ${stats.normal.cleared} / ${stats.normal.total}</span>
      <span>Hard ${stats.hard.cleared} / ${stats.hard.total}</span>
      <span>Total ${stats.total.cleared} / ${stats.total.total}</span>
      <strong>Completion ${percent}%</strong>
    `;

    puzzleListEl.innerHTML = "";
    ["easy", "normal", "hard"].forEach((difficulty) => {
      const group = document.createElement("div");
      group.className = "puzzle-group";
      const heading = document.createElement("strong");
      heading.textContent = difficultyLabel(difficulty);
      group.appendChild(heading);
      puzzles.filter((puzzle) => puzzle.difficulty === difficulty).forEach((puzzle) => {
        const button = document.createElement("button");
        const state = getPuzzleState(puzzle);
        button.type = "button";
        button.className = `puzzle-chip ${state}`;
        button.textContent = `${puzzleNumber(puzzle)} ${state}`;
        button.addEventListener("click", () => switchPuzzle(puzzle.id));
        group.appendChild(button);
      });
      puzzleListEl.appendChild(group);
    });

    continuePuzzleBtn.disabled = !findContinuePuzzle();
  }

  function findContinuePuzzle() {
    const last = localStorage.getItem(lastKey());
    if (last) {
      const lastPuzzle = puzzles.find((puzzle) => puzzle.id === last && getPuzzleState(puzzle) === "playing");
      if (lastPuzzle) {
        return lastPuzzle;
      }
    }
    return puzzles.find((puzzle) => getPuzzleState(puzzle) === "playing");
  }

  function applyHighlightClasses(cell, index, value) {
    if (selectedIndex < 0) {
      return;
    }
    const selectedValue = board[selectedIndex];
    const sameRow = Math.floor(index / 9) === Math.floor(selectedIndex / 9);
    const sameCol = index % 9 === selectedIndex % 9;
    if (sameBlock(index, selectedIndex)) {
      cell.classList.add("block-peer");
    }
    if (sameRow || sameCol) {
      cell.classList.add("line-peer");
    }
    if (selectedValue !== "0" && value === selectedValue) {
      cell.classList.add("same-number");
    }
    if (index === selectedIndex) {
      cell.classList.add("selected");
    }
  }

  function renderBoard() {
    boardEl.innerHTML = "";
    board.forEach((value, index) => {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `row ${Math.floor(index / 9) + 1} column ${(index % 9) + 1}`);
      cell.dataset.index = String(index);
      cell.textContent = value === "0" ? "" : value;
      if (isFixed(index)) {
        cell.classList.add("fixed");
        cell.setAttribute("aria-readonly", "true");
      }
      applyHighlightClasses(cell, index, value);
      if (revealedIndexes.has(index)) {
        cell.classList.add("revealed");
      }
      if (wrongIndexes.has(index)) {
        cell.classList.add("wrong");
      }
      cell.addEventListener("click", () => selectCell(index));
      boardEl.appendChild(cell);
    });
    revealedIndexes = new Set();
  }

  function renderNumberPad() {
    const selectedValue = selectedIndex >= 0 ? board[selectedIndex] : "0";
    const counts = numberCounts();
    numberPadEl.innerHTML = "";
    for (let number = 1; number <= 9; number += 1) {
      const value = String(number);
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = value;
      button.setAttribute("aria-label", `${value} input`);
      if (selectedValue === value) {
        button.classList.add("active-number");
        button.setAttribute("aria-current", "true");
      }
      if (counts[value] >= 9) {
        button.classList.add("completed-number");
        button.title = `${value} complete`;
      }
      button.addEventListener("click", () => fillSelectedCell(value));
      numberPadEl.appendChild(button);
    }
  }

  function renderAll() {
    renderBoard();
    renderNumberPad();
    renderHome();
  }

  function renderPuzzleSelect() {
    puzzleSelectEl.innerHTML = "";
    puzzles.forEach((puzzle) => {
      const option = document.createElement("option");
      option.value = puzzle.id;
      option.textContent = `${difficultyLabel(puzzle.difficulty)} ${puzzleNumber(puzzle)}`;
      puzzleSelectEl.appendChild(option);
    });
  }

  function selectCell(index) {
    selectedIndex = index;
    renderAll();
    setMessage(isFixed(index) ? "固定数字です" : "数字を入力できます");
  }

  function fillSelectedCell(value) {
    if (selectedIndex < 0) {
      setMessage("先にマスを選んでください");
      return;
    }
    if (isFixed(selectedIndex)) {
      setMessage("固定数字は変更できません");
      return;
    }
    board[selectedIndex] = value;
    wrongIndexes.delete(selectedIndex);
    saveProgress(true);
    renderAll();
    setMessage(`${value} を入力`);
  }

  function clearSelectedCell() {
    if (selectedIndex < 0) {
      setMessage("消すマスを選んでください");
      return;
    }
    if (isFixed(selectedIndex)) {
      setMessage("固定数字は消せません");
      return;
    }
    board[selectedIndex] = "0";
    wrongIndexes.delete(selectedIndex);
    saveProgress(true);
    renderAll();
    setMessage("消しました");
  }

  function checkMistakes() {
    wrongIndexes = new Set();
    board.forEach((value, index) => {
      if (value !== "0" && value !== currentPuzzle.solution[index]) {
        wrongIndexes.add(index);
      }
    });
    renderAll();
    setMessage(wrongIndexes.size === 0 ? "ミスはありません" : `${wrongIndexes.size} 個のミス`);
  }

  function markCleared() {
    setPuzzleState(currentPuzzle.id, "cleared");
    localStorage.setItem(boardKey(currentPuzzle.id), currentPuzzle.solution);
    if (localStorage.getItem(lastKey()) === currentPuzzle.id) {
      localStorage.removeItem(lastKey());
    }
  }

  function checkComplete() {
    if (board.join("") === currentPuzzle.solution) {
      wrongIndexes = new Set();
      markCleared();
      renderAll();
      setMessage("クリア！Ver1.0");
      return;
    }
    checkMistakes();
    if (board.includes("0")) {
      setMessage("まだ空きマスがあります");
    } else if (wrongIndexes.size > 0) {
      setMessage("間違いがあります");
    }
  }

  function revealHints(count) {
    const emptyIndexes = board
      .map((value, index) => (value === "0" && !isFixed(index) ? index : -1))
      .filter((index) => index >= 0);
    if (emptyIndexes.length === 0) {
      setMessage("空きマスがありません");
      return;
    }
    const shuffled = emptyIndexes.sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);
    revealedIndexes = new Set(picked);
    picked.forEach((index) => {
      board[index] = currentPuzzle.solution[index];
      wrongIndexes.delete(index);
    });
    saveProgress(true);
    renderAll();
    setMessage(`${picked.length} 個ヒント`);
  }

  function resetPuzzle() {
    clearProgressForPuzzle(currentPuzzle);
    board = currentPuzzle.givens.split("");
    selectedIndex = -1;
    wrongIndexes = new Set();
    revealedIndexes = new Set();
    renderAll();
    setMessage("この問題をリセットしました");
  }

  function resetAllProgress() {
    if (!window.confirm("すべての進捗をリセットしますか？")) {
      return;
    }
    puzzles.forEach(clearProgressForPuzzle);
    localStorage.removeItem(lastKey());
    board = currentPuzzle.givens.split("");
    selectedIndex = -1;
    wrongIndexes = new Set();
    revealedIndexes = new Set();
    renderAll();
    setMessage("全進捗をリセットしました");
  }

  function switchPuzzle(puzzleId) {
    const nextPuzzle = puzzles.find((puzzle) => puzzle.id === puzzleId);
    if (!nextPuzzle) {
      return;
    }
    currentPuzzle = nextPuzzle;
    puzzleSelectEl.value = currentPuzzle.id;
    selectedIndex = -1;
    wrongIndexes = new Set();
    revealedIndexes = new Set();
    loadProgress(currentPuzzle);
    renderAll();
    setMessage(`${difficultyLabel(currentPuzzle.difficulty)} ${puzzleNumber(currentPuzzle)} を開始`);
  }

  function continuePuzzle() {
    const puzzle = findContinuePuzzle();
    if (puzzle) {
      switchPuzzle(puzzle.id);
    } else {
      setMessage("続きの問題はありません");
    }
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("service-worker.js").catch(() => {
        setMessage("オフライン準備に失敗");
      });
    }
  }

  function boot() {
    if (puzzles.length === 0) {
      setMessage("問題データがありません");
      return;
    }
    renderPuzzleSelect();
    switchPuzzle(puzzles[0].id);
    puzzleSelectEl.addEventListener("change", (event) => switchPuzzle(event.target.value));
    continuePuzzleBtn.addEventListener("click", continuePuzzle);
    resetAllProgressBtn.addEventListener("click", resetAllProgress);
    clearCellBtn.addEventListener("click", clearSelectedCell);
    checkMistakesBtn.addEventListener("click", checkMistakes);
    checkCompleteBtn.addEventListener("click", checkComplete);
    hintOneBtn.addEventListener("click", () => revealHints(1));
    hintTwoBtn.addEventListener("click", () => revealHints(2));
    hintThreeBtn.addEventListener("click", () => revealHints(3));
    resetPuzzleBtn.addEventListener("click", resetPuzzle);
    registerServiceWorker();
  }

  boot();
})();
