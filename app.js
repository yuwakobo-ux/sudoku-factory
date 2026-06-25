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

  function storageKey(puzzleId) {
    return `sudoku-factory:v0.1:${puzzleId}`;
  }

  function setMessage(text) {
    messageEl.textContent = text;
  }

  function loadProgress(puzzle) {
    const saved = localStorage.getItem(storageKey(puzzle.id));
    if (saved && saved.length === 81) {
      board = saved.split("");
      for (let i = 0; i < 81; i += 1) {
        if (puzzle.givens[i] !== "0") {
          board[i] = puzzle.givens[i];
        }
      }
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
      if (index === selectedIndex) {
        cell.classList.add("selected");
      }

      cell.addEventListener("click", () => selectCell(index));
      boardEl.appendChild(cell);
    });
  }

  function renderNumberPad() {
    numberPadEl.innerHTML = "";
    for (let number = 1; number <= 9; number += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(number);
      button.setAttribute("aria-label", `${number} を入力`);
      button.addEventListener("click", () => fillSelectedCell(String(number)));
      numberPadEl.appendChild(button);
    }
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
    clearWrongMarks();
    renderBoard();
    if (isFixed(index)) {
      setMessage("このマスは最初から入っている数字なので変更できません。");
    } else {
      setMessage("数字ボタンで入力できます。");
    }
  }

  function fillSelectedCell(value) {
    if (selectedIndex < 0) {
      setMessage("先に空いているマスを選んでください。");
      return;
    }
    if (isFixed(selectedIndex)) {
      setMessage("最初から入っている数字は変更できません。");
      return;
    }
    board[selectedIndex] = value;
    saveProgress();
    renderBoard();
    setMessage(`${value} を入れました。`);
  }

  function clearSelectedCell() {
    if (selectedIndex < 0) {
      setMessage("消したいマスを選んでください。");
      return;
    }
    if (isFixed(selectedIndex)) {
      setMessage("最初から入っている数字は消せません。");
      return;
    }
    board[selectedIndex] = "0";
    saveProgress();
    renderBoard();
    setMessage("選んだマスを空にしました。");
  }

  function clearWrongMarks() {
    boardEl.querySelectorAll(".wrong").forEach((cell) => {
      cell.classList.remove("wrong");
    });
  }

  function checkMistakes() {
    renderBoard();
    let mistakes = 0;
    board.forEach((value, index) => {
      if (value !== "0" && value !== currentPuzzle.solution[index]) {
        const cell = boardEl.querySelector(`[data-index="${index}"]`);
        cell.classList.add("wrong");
        mistakes += 1;
      }
    });

    if (mistakes === 0) {
      setMessage("今入っている数字にミスはありません。空きマスはミス扱いしません。");
    } else {
      setMessage(`${mistakes} 個のミスがあります。赤いマスを直してください。`);
    }
  }

  function checkComplete() {
    const current = board.join("");
    if (current === currentPuzzle.solution) {
      setMessage("クリアです！ナンプレ工場 Ver.0.1 完成です。");
      return;
    }
    checkMistakes();
    if (board.includes("0")) {
      setMessage("まだ空いているマスがあります。もう少しです。");
    } else {
      setMessage("すべて埋まっていますが、どこかに間違いがあります。");
    }
  }

  function revealHints(count) {
    const emptyIndexes = board
      .map((value, index) => (value === "0" && !isFixed(index) ? index : -1))
      .filter((index) => index >= 0);

    if (emptyIndexes.length === 0) {
      setMessage("空いているマスがないのでヒントは使えません。");
      return;
    }

    const shuffled = emptyIndexes.sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, count);
    picked.forEach((index) => {
      board[index] = currentPuzzle.solution[index];
    });
    saveProgress();
    renderBoard();
    setMessage(`${picked.length} 個の正しい数字を入れました。`);
  }

  function resetPuzzle() {
    board = currentPuzzle.givens.split("");
    selectedIndex = -1;
    localStorage.removeItem(storageKey(currentPuzzle.id));
    renderBoard();
    setMessage("この問題を最初からやり直します。");
  }

  function switchPuzzle(puzzleId) {
    const nextPuzzle = puzzles.find((puzzle) => puzzle.id === puzzleId);
    if (!nextPuzzle) {
      return;
    }
    currentPuzzle = nextPuzzle;
    selectedIndex = -1;
    loadProgress(currentPuzzle);
    renderBoard();
    setMessage(`${currentPuzzle.title} を開きました。保存済みの続きがあれば復元します。`);
  }

  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("service-worker.js").catch(() => {
        setMessage("アプリは遊べますが、オフライン準備に失敗しました。");
      });
    }
  }

  function boot() {
    if (puzzles.length === 0) {
      setMessage("問題データが見つかりません。");
      return;
    }
    renderPuzzleSelect();
    renderNumberPad();
    loadProgress(currentPuzzle);
    renderBoard();

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
