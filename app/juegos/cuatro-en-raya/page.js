'use client';
import { useState, useCallback } from 'react';

const ROWS = 6;
const COLS = 7;

function emptyBoard() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
}

function dropPiece(board, col, player) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (!board[r][col]) {
      const nb = board.map(row => [...row]);
      nb[r][col] = player;
      return { board: nb, row: r };
    }
  }
  return null;
}

function checkWin(board, row, col, player) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (const [dr, dc] of dirs) {
    const cells = [];
    for (let i = -3; i <= 3; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player)
        cells.push([r, c]);
      else cells.push(null);
    }
    for (let i = 0; i <= 3; i++) {
      if (cells[i] && cells[i+1] && cells[i+2] && cells[i+3])
        return [cells[i], cells[i+1], cells[i+2], cells[i+3]];
    }
  }
  return null;
}

export default function CuatroEnRaya() {
  const [board, setBoard] = useState(emptyBoard);
  const [turn, setTurn] = useState(1);
  const [winCells, setWinCells] = useState(null);
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [hoverCol, setHoverCol] = useState(null);

  const isDraw = !winCells && board[0].every(Boolean);

  const handleDrop = useCallback((col) => {
    if (winCells || isDraw) return;
    const result = dropPiece(board, col, turn);
    if (!result) return;
    const { board: nb, row } = result;
    const win = checkWin(nb, row, col, turn);
    if (win) {
      setScores(s => ({ ...s, [turn]: s[turn] + 1 }));
      setWinCells(win.map(([r, c]) => `${r},${c}`));
    }
    setBoard(nb);
    setTurn(t => t === 1 ? 2 : 1);
  }, [board, turn, winCells, isDraw]);

  const reset = () => {
    setBoard(emptyBoard());
    setTurn(1);
    setWinCells(null);
    setHoverCol(null);
  };

  const resetAll = () => { reset(); setScores({ 1: 0, 2: 0 }); };

  const winner = winCells ? (turn === 1 ? 2 : 1) : null;

  let statusText, statusCls;
  if (winner)  { statusText = `¡Gana ${winner === 1 ? 'Rojo' : 'Amarillo'}!`; statusCls = `p${winner}`; }
  else if (isDraw) { statusText = '¡Empate!'; statusCls = 'draw'; }
  else { statusText = `Turno de ${turn === 1 ? 'Rojo' : 'Amarillo'}`; statusCls = `p${turn}`; }

  return (
    <div className="game-container" style={{ maxWidth: 520 }}>
      <h1 className="game-title">🔴 Cuatro en Raya</h1>

      <div className="c4-scores">
        <div className={`c4-score p1${turn === 1 && !winCells && !isDraw ? ' active' : ''}`}>
          <span className="c4-disc p1" />
          <span className="c4-label">Rojo</span>
          <span className="c4-pts">{scores[1]}</span>
        </div>
        <div className={`c4-status ${statusCls}`}>{statusText}</div>
        <div className={`c4-score p2${turn === 2 && !winCells && !isDraw ? ' active' : ''}`}>
          <span className="c4-disc p2" />
          <span className="c4-label">Amarillo</span>
          <span className="c4-pts">{scores[2]}</span>
        </div>
      </div>

      <div className="c4-board" onMouseLeave={() => setHoverCol(null)}>
        {/* Fila de botones de columna */}
        <div className="c4-col-btns">
          {Array(COLS).fill(null).map((_, c) => (
            <button
              key={c}
              className={`c4-col-btn${hoverCol === c ? ` p${turn}` : ''}`}
              onClick={() => handleDrop(c)}
              onMouseEnter={() => setHoverCol(c)}
              disabled={!!winCells || isDraw || board[0][c] !== null}
            >
              {hoverCol === c && !winCells && !isDraw && board[0][c] === null ? '▼' : ''}
            </button>
          ))}
        </div>

        {/* Tablero */}
        <div className="c4-grid">
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isWin = winCells?.includes(`${r},${c}`);
              const isHover = !cell && hoverCol === c && !winCells && !isDraw;
              return (
                <div
                  key={`${r}-${c}`}
                  className="c4-cell"
                  onClick={() => handleDrop(c)}
                  onMouseEnter={() => setHoverCol(c)}
                >
                  <div className={`c4-disc${cell ? ` p${cell}` : ''}${isWin ? ' win' : ''}${isHover ? ` ghost p${turn}` : ''}`} />
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
        {(winCells || isDraw) && (
          <button className="btn-game" onClick={reset}>Otra partida</button>
        )}
        <button className="btn-game secondary" onClick={resetAll}>Reiniciar todo</button>
      </div>
    </div>
  );
}
