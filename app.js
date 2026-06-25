(function () {
  "use strict";

  const puzzles = window.SUDOKU_PUZZLES || [];
  const boardEl = document.getElementById("board");
  const numberPadEl = document.getElementById("numberPad");
  const puzzleSelectEl = document.getElementById("puzzleSelect");
  const messageEl = document.getElementById("message");
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

  function storageKey(puzzleId) {
    return `sudoku-factory:v0.4:${puzzleId}`;
  }

  function setMessage(text) {
    messageEl.textContent = text;
  }

  function loadProgress(puzzle) {
    const savedV4 = localStorage.getItem(storageKey(puzzle.id));
    const savedV3 = localStorage.getItem(`sudoku-factory:v0.3:${puzzle.id}`);
    const savedV2 = localStorage.getItem(`sudoku-factory:v0.2:${puzzle.id}`);
    const savedV1 = localStorage.getItem(`sudoku-factory:v0.1:${puzzle.id}`);
    const saved = savedV4 || savedV3 || savedV2 || savedV1;
    if (saved && saved.length === 81) {
      board = saved.split("");
      for (let i = 0; i < 81; i += 1) {
        if (puzzle.givens[i] !== "0") {
          board[i] = puzzle.givens[i];
        }
      }
      saveProgress();
      return;
    }
    board = puzzle.givens.split("");
  }

  function saveProgress() {
    if (currentPuzzle) {
      localStorage.setItem(storageKey(currentPuzzle.id), board.join(""));
    }
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
      cell.setAttribute("aria-label", `行 ${Math.floor(index / 9) + 1} 列 ${(index % 9) + 1}`);
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
      button.setAttribute("aria-label", `${value} を入力`);

      if (selectedValue === value) {
        button.classList.add("active-number");
        button.setAttribute("aria-current", "true");
      }
      if (counts[value] >= 9) {
        button.classList.add("completed-number");
        button.title = `${value} は9個入っています`;
      }

      button.addEventListener("click", () => fillSelectedCell(value));
      numberPadEl.appendChild(button);
    }
  }

  function renderAll() {
    renderBoard();
    renderNumberPad();
  }

  function renderPuzzleSelect() {
    puzzleSelectEl.innerHTML = "";
    puzzles.forEach((puzzle) => {
      const option = document.createElement("option");
      option.value = puzzle.id;
      option.textContent = `${puzzle.title} (${puzzle.difficulty})`;
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
    saveProgress();
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
    saveProgress();
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

  function checkComplete() {
    if (board.join("") === currentPuzzle.solution) {
      wrongIndexes = new Set();
      renderAll();
      setMessage("クリア！Ver.0.4 完成");
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
    saveProgress();
    renderAll();
    setMessage(`${picked.length} 個ヒント`);
  }

  function resetPuzzle() {
    board = currentPuzzle.givens.split("");
    selectedIndex = -1;
    wrongIndexes = new Set();
    revealedIndexes = new Set();
    localStorage.removeItem(storageKey(currentPuzzle.id));
    renderAll();
    setMessage("リセットしました");
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
    renderAll();
    setMessage(`${currentPuzzle.title} を開始`);
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
    loadProgress(currentPuzzle);
    renderAll();

    puzzleSelectEl.addEventListener("change", (event) => switchPuzzle(event.target.value));
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
