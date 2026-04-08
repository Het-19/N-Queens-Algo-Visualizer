// ============================================================
// N-Queens Visualizer — script.js
// Mirrors nqueen.cpp backtracking logic exactly in JS.
// Steps array is generated client-side, matching C++ output.
// ============================================================

// ============================================================
// SOLVER (same logic as nqueen.cpp)
// ============================================================
function isQueenSafe(board, n, row, col) {
  for (let j = 0; j < n; j++)
    if (board[row][j] === 'Q') return false;
  for (let i = 0; i < n; i++)
    if (board[i][col] === 'Q') return false;
  for (let i = row, j = col; i >= 0 && j >= 0; i--, j--)
    if (board[i][j] === 'Q') return false;
  for (let i = row, j = col; i >= 0 && j < n; i--, j++)
    if (board[i][j] === 'Q') return false;
  return true;
}

function solve(n) {
  const steps = [];
  let solutions = 0;
  const board = Array.from({length: n}, () => Array(n).fill('.'));

  function getNQueens(row) {
    if (row === n) { solutions++; return; }
    for (let col = 0; col < n; col++) {
      steps.push({action: 'TRY', row, col});
      if (isQueenSafe(board, n, row, col)) {
        steps.push({action: 'PLACE', row, col});
        board[row][col] = 'Q';
        getNQueens(row + 1);
        steps.push({action: 'REMOVE', row, col});
        board[row][col] = '.';
      }
    }
  }

  getNQueens(0);
  return { steps, solutions };
}

// ============================================================
// STATE
// ============================================================
let n = 4;
let steps = [];
let totalSolutions = 0;
let stepIndex = 0;
let queenBoard = [];
let intervalId = null;
let running = false;
let logCount = 0;
let solutionCount = 0;

const SPEEDS = [1200, 700, 400, 200, 80];

function getSpeed() {
  return SPEEDS[parseInt(document.getElementById('speedSlider').value) - 1];
}

// ============================================================
// BUILD BOARD UI
// ============================================================
function buildBoard() {
  const board = document.getElementById('board');
  const rowLabels = document.getElementById('rowLabels');
  const colLabels = document.getElementById('colLabels');

  const cellSize = Math.min(Math.floor(Math.min(window.innerWidth - 300, 480) / n), 80);

  board.style.gridTemplateColumns = `repeat(${n}, ${cellSize}px)`;
  board.innerHTML = '';
  rowLabels.innerHTML = '';
  colLabels.innerHTML = '';

  for (let c = 0; c < n; c++) {
    const lbl = document.createElement('div');
    lbl.className = 'col-label';
    lbl.style.width = cellSize + 'px';
    lbl.textContent = String.fromCharCode(65 + c);
    colLabels.appendChild(lbl);
  }

  for (let r = 0; r < n; r++) {
    const lbl = document.createElement('div');
    lbl.className = 'row-label';
    lbl.style.height = cellSize + 'px';
    lbl.textContent = r + 1;
    rowLabels.appendChild(lbl);

    for (let c = 0; c < n; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell ' + ((r + c) % 2 === 0 ? 'light' : 'dark');
      cell.style.width = cellSize + 'px';
      cell.style.height = cellSize + 'px';
      cell.style.fontSize = Math.floor(cellSize * 0.48) + 'px';
      cell.id = `cell-${r}-${c}`;
      board.appendChild(cell);
    }
  }

  queenBoard = Array.from({length: n}, () => Array(n).fill(0));
}

// ============================================================
// DANGER CHECK
// ============================================================
function isDanger(r, c) {
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (queenBoard[i][j] === 1) {
        if (i === r || j === c) return true;
        if (Math.abs(i - r) === Math.abs(j - c)) return true;
      }
  return false;
}

// ============================================================
// REDRAW
// ============================================================
function redrawBoard(highlightRow = -1, highlightCol = -1, highlightType = '') {
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const cell = document.getElementById(`cell-${r}-${c}`);
      const base = (r + c) % 2 === 0 ? 'light' : 'dark';
      cell.className = 'cell ' + base;
      cell.innerHTML = '';

      if (queenBoard[r][c] === 1) {
        cell.classList.add('state-queen');
        const q = document.createElement('span');
        q.className = 'queen-icon';
        q.textContent = '♛';
        cell.appendChild(q);
      } else if (r === highlightRow && c === highlightCol && highlightType === 'TRY') {
        cell.classList.add('state-try');
        const ring = document.createElement('div');
        ring.className = 'try-ring';
        cell.appendChild(ring);
      } else if (isDanger(r, c)) {
        cell.classList.add('state-danger');
        const dot = document.createElement('div');
        dot.className = 'danger-dot';
        cell.appendChild(dot);
      } else {
        cell.classList.add('state-safe');
      }
    }
  }
}

// ============================================================
// LOG
// ============================================================
function addLog(step) {
  const list = document.getElementById('logList');
  logCount++;
  if (logCount > 80) list.removeChild(list.firstChild);

  const prev = list.querySelector('.log-item.active');
  if (prev) prev.classList.remove('active');

  const item = document.createElement('div');
  item.className = 'log-item active';

  const badge = document.createElement('span');
  badge.className = 'log-badge badge-' + step.action.toLowerCase();
  badge.textContent = step.action;

  const txt = document.createElement('span');
  txt.className = 'log-text';
  txt.textContent = `row ${step.row + 1}, col ${String.fromCharCode(65 + step.col)}`;

  item.appendChild(badge);
  item.appendChild(txt);
  list.appendChild(item);
  list.scrollTop = list.scrollHeight;
}

// ============================================================
// APPLY STEP
// ============================================================
function applyStep(step) {
  addLog(step);

  if (step.action === 'TRY') {
    redrawBoard(step.row, step.col, 'TRY');
    document.getElementById('statusBar').textContent =
      `Trying row ${step.row + 1}, col ${String.fromCharCode(65 + step.col)}…`;
  }

  if (step.action === 'PLACE') {
    queenBoard[step.row][step.col] = 1;
    redrawBoard();
    const placed = queenBoard.flat().filter(v => v === 1).length;
    document.getElementById('statPlaced').textContent = placed;
    document.getElementById('statusBar').textContent =
      `♛ Queen placed at row ${step.row + 1}, col ${String.fromCharCode(65 + step.col)}`;
    if (placed === n) {
      solutionCount++;
      document.getElementById('statSolutions').textContent = solutionCount;
      document.getElementById('statusBar').textContent = `✓ Solution #${solutionCount} found!`;
    }
  }

  if (step.action === 'REMOVE') {
    queenBoard[step.row][step.col] = 0;
    redrawBoard();
    const placed = queenBoard.flat().filter(v => v === 1).length;
    document.getElementById('statPlaced').textContent = placed;
    document.getElementById('statusBar').textContent =
      `↩ Backtracking from row ${step.row + 1}…`;
  }

  document.getElementById('statStep').textContent = stepIndex;
  const pct = Math.round((stepIndex / steps.length) * 100);
  document.getElementById('progressBar').style.width = pct + '%';
}

// ============================================================
// PUBLIC CONTROLS (called from HTML)
// ============================================================
function startViz() {
  if (running) return;
  running = true;
  document.getElementById('startBtn').disabled = true;

  intervalId = setInterval(() => {
    if (stepIndex >= steps.length) {
      clearInterval(intervalId);
      running = false;
      document.getElementById('statusBar').textContent =
        `✓ Done — ${solutionCount} solution${solutionCount !== 1 ? 's' : ''} found`;
      document.getElementById('progressBar').style.width = '100%';
      document.getElementById('startBtn').disabled = false;
      document.getElementById('startBtn').textContent = '▶ Replay';
      stepIndex = 0;
      queenBoard = Array.from({length: n}, () => Array(n).fill(0));
      solutionCount = 0;
      return;
    }
    applyStep(steps[stepIndex]);
    stepIndex++;
  }, getSpeed());
}

function resetViz() {
  if (intervalId) clearInterval(intervalId);
  running = false;
  stepIndex = 0;
  solutionCount = 0;
  queenBoard = Array.from({length: n}, () => Array(n).fill(0));
  document.getElementById('logList').innerHTML = '';
  document.getElementById('statStep').textContent = '0';
  document.getElementById('statPlaced').textContent = '0';
  document.getElementById('statSolutions').textContent = '0';
  document.getElementById('progressBar').style.width = '0%';
  document.getElementById('statusBar').textContent = 'Press Start to begin';
  document.getElementById('startBtn').disabled = false;
  document.getElementById('startBtn').textContent = '▶ Start';
  logCount = 0;
  redrawBoard();
}

function onNChange() {
  if (running) { clearInterval(intervalId); running = false; }
  n = parseInt(document.getElementById('nSelect').value);
  const result = solve(n);
  steps = result.steps;
  totalSolutions = result.solutions;
  document.getElementById('statTotal').textContent = steps.length;
  buildBoard();
  resetViz();
}

document.getElementById('speedSlider').addEventListener('input', function () {
  document.getElementById('speedLabel').textContent = this.value + 'x';
  if (running) {
    clearInterval(intervalId);
    running = false;
    startViz();
  }
});

// ============================================================
// INIT
// ============================================================
window.addEventListener('load', () => {
  n = 4;
  const result = solve(n);
  steps = result.steps;
  totalSolutions = result.solutions;
  document.getElementById('statTotal').textContent = steps.length;
  buildBoard();
  redrawBoard();
});
