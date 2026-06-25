(function () {
  "use strict";

  const VERSION = "v1.1";
  const puzzles = window.SUDOKU_PUZZLES || [];
  const boardEl = document.getElementById("board");
  const numberPadEl = document.getElementById("numberPad");
  const difficultySelectEl = document.getElementById("difficultySelect");
  const puzzleNumberSelectEl = document.getElementById("puzzleNumberSelect");
  const selectedStatusEl = document.getElementById("selectedStatus");
  const messageEl = document.getElementById("message");
  const progressSummaryEl = document.getElementById("progressSummary");
  const continuePuzzleBtn = document.getElementById("continuePuzzle");
  const resetAllProgressBtn = document.getElementById("resetAllProgress");
  const clearCellBtn = document.getElementById("clearCell");
  const checkMistakesBtn = document.getElementById("checkMistakes");
  const checkCompleteBtn = document.getElementById("checkComplete");
  const hintOneBtn = document.getElementById("hintOne");
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
    return ["v1.0", "v0.6", "v0.5", "v0.4", "v0.3", "v0.2", "v0.1"].flatMap((version) => [
      `sudoku-factory:${version}:board:${puzzleId}`,
      `sudoku-factory:${version}:${puzzleId}`
    ]);
  }

  function oldStateKeys(puzzleId) {
    return ["v1.0"].map((version) => `sudoku-factory:${version}:state:${puzzleId}`);
  }

  function setMessage(text) {
    messageEl.textContent = text;
  }

  function difficultyLabel(difficulty) {
    return { easy: "Easy", normal: "Normal", hard: "Hard" }[difficulty] || difficulty;
  }

  function puzzleNumber(puzzle) {
    return puzzle.id.split("-")[1] || puzzle.id;
  }

  function stateLabel(state) {
    return { not_started: "new", playing: "playing", cleared: "cleared" }[state] || "new";
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
    if (explicit === "cleared" || explicit === "playing") {
      return explicit;
    }
    for (const key of oldStateKeys(puzzle.id)) {
      const old = localStorage.getItem(key);
      if (old === "cleared" || old === "playing") {
        return old;
      }
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
    oldStateKeys(puzzle.id).forEach((key) => localStorage.removeItem(key));
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

  function findContinuePuzzle() {
    const last = localStorage.getItem(lastKey()) || localStorage.getItem("sudoku-factory:v1.0:last-playing");
    if (last) {
      const lastPuzzle = puzzles.find((puzzle) => puzzle.id === last && getPuzzleState(puzzle) === "playing");
      if (lastPuzzle) {
        return lastPuzzle;
      }
    }
    return puzzles.find((puzzle) => getPuzzleState(puzzle) === "playing");
  }

  function renderHome() {
    const stats = progressStats();
    progressSummaryEl.innerHTML = `
      <span>Easy ${stats.easy.cleared}/${stats.easy.total}</span>
      <span>Normal ${stats.normal.cleared}/${stats.normal.total}</span>
      <span>Hard ${stats.hard.cleared}/${stats.hard.total}</span>
      <strong>Total ${stats.total.cleared}/${stats.total.total}</strong>
    `;
    selectedStatusEl.textContent = stateLabel(getPuzzleState(currentPuzzle));
    selectedStatusEl.className = `status-badge ${getPuzzleState(currentPuzzle)}`;
    continuePuzzleBtn.disabled = !findContinuePuzzle();
  }

  function renderDifficultySelect() {
    difficultySelectEl.innerHTML = "";
    ["easy", "normal", "hard"].forEach((difficulty) => {
      const option = document.createElement("option");
      option.value = difficulty;
      option.textContent = difficultyLabel(difficulty);
      difficultySelectEl.appendChild(option);
    });
  }

  function renderPuzzleNumberSelect() {
    const difficulty = difficultySelectEl.value || "easy";
    puzzleNumberSelectEl.innerHTML = "";
    puzzles.filter((puzzle) => puzzle.difficulty === difficulty).forEach((puzzle) => {
      const option = document.createElement("option");
      option.value = puzzle.id;
      option.textContent = `${puzzleNumber(puzzle)} ${stateLabel(getPuzzleState(puzzle))}`;
      puzzleNumberSelectEl.appendChild(option);
    });
  }

  function syncSelectors() {
    difficultySelectEl.value = currentPuzzle.difficulty;
    renderPuzzleNumberSelect();
    puzzleNumberSelectEl.value = currentPuzzle.id;
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
    renderPuzzleNumberSelect();
    puzzleNumberSelectEl.value = currentPuzzle.id;
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
      setMessage("クリア！Ver1.1");
      return;
    }
    checkMistakes();
    if (board.includes("0")) {
      setMessage("まだ空きマスがあります");
    } else if (wrongIndexes.size > 0) {
      setMessage("間違いがあります");
    }
  }

  function revealHint() {
    const emptyIndexes = board
      .map((value, index) => (value === "0" && !isFixed(index) ? index : -1))
      .filter((index) => index >= 0);
    if (emptyIndexes.length === 0) {
      setMessage("空きマスがありません");
      return;
    }
    const index = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
    revealedIndexes = new Set([index]);
    board[index] = currentPuzzle.solution[index];
    wrongIndexes.delete(index);
    saveProgress(true);
    renderAll();
    setMessage("ヒントを1つ入れました");
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
    localStorage.removeItem("sudoku-factory:v1.0:last-playing");
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
    selectedIndex = -1;
    wrongIndexes = new Set();
    revealedIndexes = new Set();
    loadProgress(currentPuzzle);
    syncSelectors();
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
    renderDifficultySelect();
    switchPuzzle(puzzles[0].id);
    difficultySelectEl.addEventListener("change", () => {
      renderPuzzleNumberSelect();
      switchPuzzle(puzzleNumberSelectEl.value);
    });
    puzzleNumberSelectEl.addEventListener("change", (event) => switchPuzzle(event.target.value));
    continuePuzzleBtn.addEventListener("click", continuePuzzle);
    resetAllProgressBtn.addEventListener("click", resetAllProgress);
    clearCellBtn.addEventListener("click", clearSelectedCell);
    checkMistakesBtn.addEventListener("click", checkMistakes);
    checkCompleteBtn.addEventListener("click", checkComplete);
    hintOneBtn.addEventListener("click", revealHint);
    resetPuzzleBtn.addEventListener("click", resetPuzzle);
    registerServiceWorker();
  }

  boot();
})();
