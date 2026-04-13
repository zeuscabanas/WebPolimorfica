'use client';
import { useState, useCallback } from 'react';

const LINES = [
  [0,1,2],[3,4,5],[6,7,8], // filas
  [0,3,6],[1,4,7],[2,5,8], // columnas
  [0,4,8],[2,4,6],         // diagonales
];

function checkWinner(cells) {
  for (const [a, b, c] of LINES) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c])
      return { winner: cells[a], line: [a, b, c] };
  }
  return null;
}

export default function TresEnRaya() {
  const [cells, setCells] = useState(Array(9).fill(null));
  const [isX, setIsX] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });

  const result = checkWinner(cells);
  const isDraw = !result && cells.every(Boolean);

  const handleClick = useCallback((i) => {
    if (cells[i] || result) return;
    const next = cells.slice();
    next[i] = isX ? 'X' : 'O';
    const newResult = checkWinner(next);
    if (newResult) setScores(s => ({ ...s, [newResult.winner]: s[newResult.winner] + 1 }));
    setCells(next);
    setIsX(!isX);
  }, [cells, isX, result]);

  const reset = () => {
    setCells(Array(9).fill(null));
    setIsX(true);
  };

  const resetAll = () => {
    reset();
    setScores({ X: 0, O: 0 });
  };

  let status;
  if (result)  status = { text: `¡Gana ${result.winner}!`, cls: result.winner === 'X' ? 'x' : 'o' };
  else if (isDraw) status = { text: '¡Empate!', cls: 'draw' };
  else status = { text: `Turno de ${isX ? 'X' : 'O'}`, cls: isX ? 'x' : 'o' };

  return (
    <div className="game-container" style={{ maxWidth: 460 }}>
      <h1 className="game-title">✖ Tres en Raya</h1>

      <div className="ttr-scores">
        <div className={`ttr-score x${!isX && !result && !isDraw ? ' active' : ''}`}>
          <span className="ttr-player">✖</span>
          <span className="ttr-pts">{scores.X}</span>
        </div>
        <div className={`ttr-status ${status.cls}`}>{status.text}</div>
        <div className={`ttr-score o${isX && !result && !isDraw ? ' active' : ''}`}>
          <span className="ttr-player">◯</span>
          <span className="ttr-pts">{scores.O}</span>
        </div>
      </div>

      <div className="ttr-board">
        {cells.map((val, i) => {
          const winning = result?.line.includes(i);
          return (
            <button
              key={i}
              className={`ttr-cell${val ? ` filled ${val.toLowerCase()}` : ''}${winning ? ' win' : ''}`}
              onClick={() => handleClick(i)}
            >
              {val}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
        {(result || isDraw) && (
          <button className="btn-game" onClick={reset}>Otra partida</button>
        )}
        <button className="btn-game secondary" onClick={resetAll}>Reiniciar todo</button>
      </div>
    </div>
  );
}
