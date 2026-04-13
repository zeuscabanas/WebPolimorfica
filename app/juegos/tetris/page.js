'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const COLS = 10;
const ROWS = 20;

const TETROMINOES = {
  I: { m: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], c: '#00d4ff' },
  O: { m: [[1,1],[1,1]],                              c: '#ffd700' },
  T: { m: [[0,1,0],[1,1,1],[0,0,0]],                 c: '#a855f7' },
  S: { m: [[0,1,1],[1,1,0],[0,0,0]],                 c: '#22c55e' },
  Z: { m: [[1,1,0],[0,1,1],[0,0,0]],                 c: '#ef4444' },
  J: { m: [[1,0,0],[1,1,1],[0,0,0]],                 c: '#3b82f6' },
  L: { m: [[0,0,1],[1,1,1],[0,0,0]],                 c: '#f97316' },
};
const KEYS = Object.keys(TETROMINOES);
const LINE_PTS = [0, 100, 300, 500, 800];

const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const rotateRight = m => m[0].map((_, j) => m.map(r => r[j]).reverse());

function mkPiece(key) {
  const { m, c } = TETROMINOES[key];
  return { m: m.map(r => [...r]), c, x: Math.floor((COLS - m[0].length) / 2), y: -1 };
}
const randPiece = () => mkPiece(KEYS[Math.floor(Math.random() * KEYS.length)]);

function valid(board, m, x, y) {
  for (let r = 0; r < m.length; r++)
    for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      const nr = y + r, nc = x + c;
      if (nc < 0 || nc >= COLS || nr >= ROWS) return false;
      if (nr >= 0 && board[nr][nc]) return false;
    }
  return true;
}

function lock(board, piece) {
  const nb = board.map(r => [...r]);
  piece.m.forEach((row, r) =>
    row.forEach((v, c) => { if (v && piece.y + r >= 0) nb[piece.y + r][piece.x + c] = piece.c; })
  );
  return nb;
}

function sweep(board) {
  const kept = board.filter(row => row.some(c => !c));
  const cleared = ROWS - kept.length;
  return { board: [...Array.from({ length: cleared }, () => Array(COLS).fill(null)), ...kept], cleared };
}

function getGhost(board, piece) {
  let y = piece.y;
  while (valid(board, piece.m, piece.x, y + 1)) y++;
  return y;
}

function buildDisplay(board, piece) {
  const d = board.map(r => [...r]);
  if (!piece) return d;
  const gy = getGhost(board, piece);
  piece.m.forEach((row, r) => row.forEach((v, c) => {
    if (!v) return;
    if (gy + r >= 0 && gy + r < ROWS && !d[gy + r][piece.x + c])
      d[gy + r][piece.x + c] = 'ghost';
    if (piece.y + r >= 0 && piece.y + r < ROWS)
      d[piece.y + r][piece.x + c] = piece.c;
  }));
  return d;
}

const dropSpeed = lvl => Math.max(50, 800 - lvl * 75);

export default function Tetris() {
  const g = useRef({
    board: emptyBoard(), piece: null, next: randPiece(),
    score: 0, lines: 0, level: 0, status: 'idle',
  });
  const [, rerender] = useState(0);
  const draw = useCallback(() => rerender(n => n + 1), []);
  const loop = useRef(null);

  const startLoop = useCallback(() => {
    clearInterval(loop.current);
    loop.current = setInterval(tick, dropSpeed(g.current.level));
  }, []);

  const spawn = useCallback(() => {
    const s = g.current;
    const p = { ...s.next, x: Math.floor((COLS - s.next.m[0].length) / 2), y: -1 };
    s.next = randPiece();
    if (!valid(s.board, p.m, p.x, p.y)) {
      s.status = 'over';
      clearInterval(loop.current);
      draw(); return;
    }
    s.piece = p;
    draw();
  }, [draw]);

  const lockPiece = useCallback(() => {
    const s = g.current;
    const nb = lock(s.board, s.piece);
    const { board, cleared } = sweep(nb);
    s.board = board;
    s.lines += cleared;
    s.level = Math.floor(s.lines / 10);
    s.score += LINE_PTS[cleared] * (s.level + 1);
    s.piece = null;
    startLoop();
    spawn();
  }, [spawn, startLoop]);

  function tick() {
    const s = g.current;
    if (s.status !== 'playing' || !s.piece) return;
    if (valid(s.board, s.piece.m, s.piece.x, s.piece.y + 1)) {
      s.piece = { ...s.piece, y: s.piece.y + 1 };
      rerender(n => n + 1);
    } else {
      lockPiece();
    }
  }

  const move = useCallback((dx) => {
    const s = g.current;
    if (s.status !== 'playing' || !s.piece) return;
    if (valid(s.board, s.piece.m, s.piece.x + dx, s.piece.y)) {
      s.piece = { ...s.piece, x: s.piece.x + dx };
      draw();
    }
  }, [draw]);

  const rotate = useCallback(() => {
    const s = g.current;
    if (s.status !== 'playing' || !s.piece) return;
    const nm = rotateRight(s.piece.m);
    for (const kick of [0, -1, 1, -2, 2]) {
      if (valid(s.board, nm, s.piece.x + kick, s.piece.y)) {
        s.piece = { ...s.piece, m: nm, x: s.piece.x + kick };
        draw(); return;
      }
    }
  }, [draw]);

  const softDrop = useCallback(() => {
    const s = g.current;
    if (s.status !== 'playing' || !s.piece) return;
    if (valid(s.board, s.piece.m, s.piece.x, s.piece.y + 1)) {
      s.piece = { ...s.piece, y: s.piece.y + 1 };
      s.score += 1;
      draw();
    } else lockPiece();
  }, [draw, lockPiece]);

  const hardDrop = useCallback(() => {
    const s = g.current;
    if (s.status !== 'playing' || !s.piece) return;
    let dropped = 0;
    while (valid(s.board, s.piece.m, s.piece.x, s.piece.y + 1)) {
      s.piece = { ...s.piece, y: s.piece.y + 1 };
      dropped++;
    }
    s.score += dropped * 2;
    lockPiece();
  }, [lockPiece]);

  const togglePause = useCallback(() => {
    const s = g.current;
    if (s.status === 'playing') {
      s.status = 'paused';
      clearInterval(loop.current);
    } else if (s.status === 'paused') {
      s.status = 'playing';
      startLoop();
    }
    draw();
  }, [draw, startLoop]);

  const startGame = useCallback(() => {
    const s = g.current;
    Object.assign(s, { board: emptyBoard(), piece: null, next: randPiece(), score: 0, lines: 0, level: 0, status: 'playing' });
    startLoop();
    spawn();
  }, [startLoop, spawn]);

  useEffect(() => {
    const onKey = e => {
      const s = g.current;
      if (s.status !== 'playing' && s.status !== 'paused') return;
      if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key)) e.preventDefault();
      switch (e.key) {
        case 'ArrowLeft':  move(-1); break;
        case 'ArrowRight': move(1); break;
        case 'ArrowDown':  softDrop(); break;
        case 'ArrowUp':    rotate(); break;
        case ' ':          hardDrop(); break;
        case 'p': case 'P': togglePause(); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); clearInterval(loop.current); };
  }, [move, softDrop, rotate, hardDrop, togglePause]);

  const s = g.current;
  const display = buildDisplay(s.board, s.piece);

  // Next piece preview (4x4 grid)
  const nextGrid = Array.from({ length: 4 }, () => Array(4).fill(null));
  if (s.next) {
    const or = Math.floor((4 - s.next.m.length) / 2);
    const oc = Math.floor((4 - s.next.m[0].length) / 2);
    s.next.m.forEach((row, r) => row.forEach((v, c) => { if (v) nextGrid[r + or][c + oc] = s.next.c; }));
  }

  const btn = (label, action, extra = '') => (
    <button
      className={`ctrl-btn ${extra}`}
      onPointerDown={e => { e.preventDefault(); action(); }}
    >{label}</button>
  );

  return (
    <div className="game-container" style={{ maxWidth: 400 }}>
      <h1 className="game-title">🧩 Tetris</h1>

      <div className="tetris-wrap">
        {/* Tablero */}
        <div className="tetris-board">
          {(s.status === 'idle' || s.status === 'over' || s.status === 'paused') && (
            <div className="tetris-overlay">
              {s.status === 'over' && <>
                <p className="t-over">GAME OVER</p>
                <p className="t-score-final">{s.score} pts</p>
              </>}
              {s.status === 'paused' && <p className="t-pause">PAUSA</p>}
              <button className="btn-game" onClick={s.status === 'paused' ? togglePause : startGame}>
                {s.status === 'idle' ? 'Jugar' : s.status === 'paused' ? 'Continuar' : 'Reintentar'}
              </button>
            </div>
          )}
          {display.map((row, r) => (
            <div key={r} className="t-row">
              {row.map((cell, c) => (
                <div
                  key={c}
                  className={`t-cell${cell ? cell === 'ghost' ? ' ghost' : ' on' : ''}`}
                  style={cell && cell !== 'ghost' ? { background: cell } : {}}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Panel lateral */}
        <div className="tetris-side">
          <div className="t-panel">
            <div className="t-lbl">SIGUIENTE</div>
            <div className="t-next">
              {nextGrid.map((row, r) => (
                <div key={r} className="t-next-row">
                  {row.map((cell, c) => (
                    <div key={c} className={`t-nc${cell ? ' on' : ''}`}
                      style={cell ? { background: cell } : {}} />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="t-panel">
            <div className="t-lbl">PUNTOS</div>
            <div className="t-val">{s.score}</div>
          </div>
          <div className="t-panel">
            <div className="t-lbl">LÍNEAS</div>
            <div className="t-val">{s.lines}</div>
          </div>
          <div className="t-panel">
            <div className="t-lbl">NIVEL</div>
            <div className="t-val">{s.level}</div>
          </div>
          {s.status === 'playing' && (
            <button className="btn-game secondary" style={{ fontSize: '0.78rem', padding: '7px 4px' }} onClick={togglePause}>
              Pausa (P)
            </button>
          )}
        </div>
      </div>

      {/* Controles táctiles */}
      <div className="tetris-ctrl">
        <div className="t-ctrl-row">
          {btn('◀', () => move(-1))}
          {btn('↻', rotate, 'accent')}
          {btn('▶', () => move(1))}
        </div>
        <div className="t-ctrl-row">
          {btn('▼', softDrop)}
          {btn('⬇ Drop', hardDrop, 'wide')}
        </div>
      </div>

      <p className="game-hint">← → mover · ↑ rotar · ↓ bajar · Espacio caída · P pausa</p>
    </div>
  );
}
