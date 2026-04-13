'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const CONFIGS = {
  facil:   { rows: 9,  cols: 9,  mines: 10, label: 'Fácil' },
  medio:   { rows: 16, cols: 16, mines: 40, label: 'Medio' },
  dificil: { rows: 16, cols: 30, mines: 99, label: 'Difícil' },
};

const NUM_COLORS = { 1:'#2563eb', 2:'#16a34a', 3:'#dc2626', 4:'#7c3aed', 5:'#b91c1c', 6:'#0891b2', 7:'#111827', 8:'#6b7280' };

function makeEmpty(rows, cols) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ mine: false, revealed: false, flagged: false, count: 0 }))
  );
}

function placeMines(base, rows, cols, mines, safeR, safeC) {
  const board = base.map(r => r.map(c => ({ ...c })));
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine && !(Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1)) {
      board[r][c].mine = true;
      placed++;
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) count++;
        }
      board[r][c].count = count;
    }
  }
  return board;
}

function floodReveal(board, startR, startC, rows, cols) {
  const b = board.map(r => r.map(c => ({ ...c })));
  const stack = [[startR, startC]];
  const visited = new Set();
  while (stack.length) {
    const [r, c] = stack.pop();
    const key = `${r},${c}`;
    if (r < 0 || r >= rows || c < 0 || c >= cols || visited.has(key)) continue;
    if (b[r][c].flagged) continue;
    visited.add(key);
    b[r][c].revealed = true;
    if (!b[r][c].mine && b[r][c].count === 0) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr !== 0 || dc !== 0) stack.push([r + dr, c + dc]);
    }
  }
  return b;
}

export default function Buscaminas() {
  const [difficulty, setDifficulty] = useState('facil');
  const [board, setBoard] = useState(() => makeEmpty(9, 9));
  const [gameState, setGameState] = useState('idle');
  const [minesLeft, setMinesLeft] = useState(10);
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);
  const config = CONFIGS[difficulty];

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => setTime(t => Math.min(t + 1, 999)), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const startNewGame = useCallback((diff) => {
    const d = diff || difficulty;
    const cfg = CONFIGS[d];
    clearInterval(timerRef.current);
    setDifficulty(d);
    setBoard(makeEmpty(cfg.rows, cfg.cols));
    setGameState('idle');
    setMinesLeft(cfg.mines);
    setTime(0);
  }, [difficulty]);

  const handleClick = useCallback((r, c) => {
    if (gameState === 'won' || gameState === 'lost') return;
    if (board[r][c].flagged || board[r][c].revealed) return;

    let workBoard = board;
    let nextState = gameState;

    if (gameState === 'idle') {
      workBoard = placeMines(board, config.rows, config.cols, config.mines, r, c);
      nextState = 'playing';
    }

    if (workBoard[r][c].mine) {
      const exploded = workBoard.map(row =>
        row.map(cell => ({ ...cell, revealed: cell.mine ? true : cell.revealed }))
      );
      setBoard(exploded);
      setGameState('lost');
      return;
    }

    const newBoard = floodReveal(workBoard, r, c, config.rows, config.cols);
    const hidden = newBoard.flat().filter(cell => !cell.revealed && !cell.mine).length;
    setBoard(newBoard);
    setGameState(hidden === 0 ? 'won' : nextState);
  }, [board, gameState, config]);

  const handleRightClick = useCallback((e, r, c) => {
    e.preventDefault();
    if (gameState === 'won' || gameState === 'lost' || board[r][c].revealed) return;
    const nb = board.map(row => row.map(cell => ({ ...cell })));
    nb[r][c].flagged = !nb[r][c].flagged;
    setMinesLeft(m => nb[r][c].flagged ? m - 1 : m + 1);
    setBoard(nb);
  }, [board, gameState]);

  const emoji = gameState === 'won' ? '😎' : gameState === 'lost' ? '😵' : '🙂';

  return (
    <div className="game-container">
      <h1 className="game-title">💣 Buscaminas</h1>

      <div className="ms-controls">
        {Object.entries(CONFIGS).map(([key, cfg]) => (
          <button
            key={key}
            className={`btn-diff${difficulty === key ? ' active' : ''}`}
            onClick={() => startNewGame(key)}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      <div className="ms-panel">
        <span className="ms-stat">💣 {String(minesLeft).padStart(3, '0')}</span>
        <button className="ms-reset" onClick={() => startNewGame()}>{emoji}</button>
        <span className="ms-stat">⏱ {String(time).padStart(3, '0')}</span>
      </div>

      {gameState === 'won' && <div className="game-banner win">¡Ganaste! 🎉</div>}
      {gameState === 'lost' && <div className="game-banner lose">💥 ¡Has pisado una mina!</div>}

      <div className="ms-scroll">
        <div className="ms-board" style={{ gridTemplateColumns: `repeat(${config.cols}, 30px)` }}>
          {board.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                className={`ms-cell${cell.revealed ? (cell.mine ? ' mine' : ' open') : ''}`}
                onClick={() => handleClick(r, c)}
                onContextMenu={e => handleRightClick(e, r, c)}
              >
                {cell.revealed
                  ? cell.mine ? '💣' : cell.count > 0
                    ? <span style={{ color: NUM_COLORS[cell.count], fontWeight: 700 }}>{cell.count}</span>
                    : null
                  : cell.flagged ? '🚩' : null}
              </button>
            ))
          )}
        </div>
      </div>

      <p className="game-hint">Click derecho para colocar bandera 🚩</p>
    </div>
  );
}
