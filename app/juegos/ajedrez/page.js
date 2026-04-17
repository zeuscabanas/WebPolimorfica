'use client';
import { useState, useCallback } from 'react';
import { useT } from '../../../components/LocaleProvider';

const SYMBOLS = {
  white: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
  black: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
};

function initBoard() {
  const b = Array(8).fill(null).map(() => Array(8).fill(null));
  const back = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
  for (let c = 0; c < 8; c++) {
    b[0][c] = { type: back[c], color: 'black' };
    b[1][c] = { type: 'P', color: 'black' };
    b[6][c] = { type: 'P', color: 'white' };
    b[7][c] = { type: back[c], color: 'white' };
  }
  return b;
}

function pseudoMoves(board, r, c, lastMove, cr) {
  const piece = board[r][c];
  if (!piece) return [];
  const { type, color } = piece;
  const opp = color === 'white' ? 'black' : 'white';
  const moves = [];

  const canTarget = (nr, nc) =>
    nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && board[nr][nc]?.color !== color;

  const slide = (dr, dc) => {
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      if (board[nr][nc]) {
        if (board[nr][nc].color === opp) moves.push([nr, nc]);
        break;
      }
      moves.push([nr, nc]);
      nr += dr; nc += dc;
    }
  };

  switch (type) {
    case 'P': {
      const dir = color === 'white' ? -1 : 1;
      const startRow = color === 'white' ? 6 : 1;
      if (r + dir >= 0 && r + dir < 8 && !board[r + dir][c]) {
        moves.push([r + dir, c]);
        if (r === startRow && !board[r + 2 * dir][c]) moves.push([r + 2 * dir, c]);
      }
      for (const dc of [-1, 1]) {
        const nr = r + dir, nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          if (board[nr][nc]?.color === opp) moves.push([nr, nc]);
          if (lastMove?.doublePush && lastMove.color !== color &&
              lastMove.to[0] === r && lastMove.to[1] === nc)
            moves.push([nr, nc]);
        }
      }
      break;
    }
    case 'N':
      for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])
        if (canTarget(r + dr, c + dc)) moves.push([r + dr, c + dc]);
      break;
    case 'B': slide(-1,-1); slide(-1,1); slide(1,-1); slide(1,1); break;
    case 'R': slide(-1,0); slide(1,0); slide(0,-1); slide(0,1); break;
    case 'Q':
      slide(-1,-1); slide(-1,1); slide(1,-1); slide(1,1);
      slide(-1,0); slide(1,0); slide(0,-1); slide(0,1);
      break;
    case 'K': {
      for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]])
        if (canTarget(r + dr, c + dc)) moves.push([r + dr, c + dc]);
      const backRow = color === 'white' ? 7 : 0;
      if (r === backRow && c === 4 && cr) {
        if (cr[color].kingside && !board[backRow][5] && !board[backRow][6] &&
            board[backRow][7]?.type === 'R' && board[backRow][7]?.color === color)
          moves.push([backRow, 6]);
        if (cr[color].queenside && !board[backRow][3] && !board[backRow][2] && !board[backRow][1] &&
            board[backRow][0]?.type === 'R' && board[backRow][0]?.color === color)
          moves.push([backRow, 2]);
      }
      break;
    }
  }
  return moves;
}

const NO_CASTLE = { white: { kingside: false, queenside: false }, black: { kingside: false, queenside: false } };

function isAttacked(board, r, c, byColor) {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      if (!p || p.color !== byColor) continue;
      if (p.type === 'P') {
        const dir = byColor === 'white' ? -1 : 1;
        if (row + dir === r && Math.abs(col - c) === 1) return true;
      } else {
        if (pseudoMoves(board, row, col, null, NO_CASTLE).some(([mr, mc]) => mr === r && mc === c))
          return true;
      }
    }
  }
  return false;
}

function findKing(board, color) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.type === 'K' && board[r][c]?.color === color) return [r, c];
  return null;
}

function isInCheck(board, color) {
  const king = findKing(board, color);
  if (!king) return false;
  return isAttacked(board, king[0], king[1], color === 'white' ? 'black' : 'white');
}

function applyMove(board, fr, fc, tr, tc, lastMove, cr) {
  const nb = board.map(row => [...row]);
  const piece = { ...nb[fr][fc] };
  const newLastMove = { piece: piece.type, color: piece.color, from: [fr, fc], to: [tr, tc] };
  const newCr = { white: { ...cr.white }, black: { ...cr.black } };

  if (piece.type === 'P' && (tr === 0 || tr === 7)) piece.type = 'Q';
  if (piece.type === 'P' && Math.abs(tr - fr) === 2) newLastMove.doublePush = true;
  if (piece.type === 'P' && fc !== tc && !nb[tr][tc]) {
    nb[tr + (piece.color === 'white' ? 1 : -1)][tc] = null;
  }
  if (piece.type === 'K' && Math.abs(tc - fc) === 2) {
    if (tc === 6) { nb[fr][5] = nb[fr][7]; nb[fr][7] = null; }
    else          { nb[fr][3] = nb[fr][0]; nb[fr][0] = null; }
  }
  if (piece.type === 'K') { newCr[piece.color].kingside = false; newCr[piece.color].queenside = false; }
  if (piece.type === 'R') {
    const back = piece.color === 'white' ? 7 : 0;
    if (fr === back && fc === 0) newCr[piece.color].queenside = false;
    if (fr === back && fc === 7) newCr[piece.color].kingside = false;
  }
  const captured = nb[tr][tc];
  if (captured?.type === 'R') {
    const opp = piece.color === 'white' ? 'black' : 'white';
    const oppBack = opp === 'white' ? 7 : 0;
    if (tr === oppBack && tc === 0) newCr[opp].queenside = false;
    if (tr === oppBack && tc === 7) newCr[opp].kingside = false;
  }
  nb[tr][tc] = piece;
  nb[fr][fc] = null;
  return { board: nb, lastMove: newLastMove, cr: newCr };
}

function getLegalMoves(board, r, c, lastMove, cr) {
  const piece = board[r][c];
  if (!piece) return [];
  const opp = piece.color === 'white' ? 'black' : 'white';
  const candidates = pseudoMoves(board, r, c, lastMove, cr);
  const legal = [];

  for (const [tr, tc] of candidates) {
    if (piece.type === 'K' && Math.abs(tc - c) === 2) {
      if (isInCheck(board, piece.color)) continue;
      const midCol = tc === 6 ? 5 : 3;
      const testBoard = board.map(row => [...row]);
      testBoard[r][midCol] = { ...piece };
      testBoard[r][c] = null;
      if (isAttacked(testBoard, r, midCol, opp)) continue;
    }
    const { board: nb } = applyMove(board, r, c, tr, tc, lastMove, cr);
    if (!isInCheck(nb, piece.color)) legal.push([tr, tc]);
  }
  return legal;
}

function hasAnyLegal(board, color, lastMove, cr) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.color === color && getLegalMoves(board, r, c, lastMove, cr).length > 0)
        return true;
  return false;
}

const INIT_CR = { white: { kingside: true, queenside: true }, black: { kingside: true, queenside: true } };
const FILES = ['a','b','c','d','e','f','g','h'];
const RANKS = ['8','7','6','5','4','3','2','1'];

export default function Ajedrez() {
  const t = useT('ajedrez');
  const [board, setBoard] = useState(initBoard);
  const [turn, setTurn] = useState('white');
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [cr, setCr] = useState(INIT_CR);
  const [status, setStatus] = useState('playing');
  const [message, setMessage] = useState('');

  const reset = () => {
    setBoard(initBoard());
    setTurn('white');
    setSelected(null);
    setValidMoves([]);
    setLastMove(null);
    setCr(INIT_CR);
    setStatus('playing');
    setMessage('');
  };

  const handleClick = useCallback((r, c) => {
    if (status === 'checkmate' || status === 'stalemate') return;
    const piece = board[r][c];

    if (selected) {
      const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
      if (isValid) {
        const { board: nb, lastMove: nlm, cr: ncr } = applyMove(board, selected[0], selected[1], r, c, lastMove, cr);
        const next = turn === 'white' ? 'black' : 'white';
        const inCheck = isInCheck(nb, next);
        const hasMoves = hasAnyLegal(nb, next, nlm, ncr);
        let newStatus = inCheck ? 'check' : 'playing';
        let newMsg = inCheck ? (next === 'white' ? t.jaqueBlancas : t.jaqueNegras) : '';
        if (!hasMoves) {
          newStatus = inCheck ? 'checkmate' : 'stalemate';
          newMsg = inCheck
            ? (turn === 'white' ? t.jaqueMateBlancas : t.jaqueMateNegras)
            : t.tablas;
        }
        setBoard(nb); setTurn(next); setLastMove(nlm); setCr(ncr);
        setStatus(newStatus); setMessage(newMsg);
        setSelected(null); setValidMoves([]);
        return;
      }
      if (piece?.color === turn) {
        setSelected([r, c]);
        setValidMoves(getLegalMoves(board, r, c, lastMove, cr));
        return;
      }
      setSelected(null); setValidMoves([]);
      return;
    }
    if (piece?.color === turn) {
      setSelected([r, c]);
      setValidMoves(getLegalMoves(board, r, c, lastMove, cr));
    }
  }, [board, turn, selected, validMoves, lastMove, cr, status, t]);

  return (
    <div className="game-container">
      <h1 className="game-title">{t.title}</h1>

      <div className="chess-info">
        <div className={`chess-turn-indicator ${turn}`}>
          {turn === 'white' ? t.turnoBlancas : t.turnoNegras}
        </div>
        {message && <div className={`chess-msg ${status}`}>{message}</div>}
      </div>

      <div className="chess-wrapper">
        <div className="chess-ranks">
          {RANKS.map(rk => <span key={rk} className="chess-label">{rk}</span>)}
        </div>
        <div className="chess-board-col">
          <div className="chess-board">
            {board.map((row, r) =>
              row.map((piece, c) => {
                const light = (r + c) % 2 === 0;
                const isSel = selected?.[0] === r && selected?.[1] === c;
                const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
                const isLast = lastMove &&
                  ((lastMove.from[0] === r && lastMove.from[1] === c) ||
                   (lastMove.to[0] === r && lastMove.to[1] === c));
                const inChk = status === 'check' && piece?.type === 'K' && piece?.color === turn;
                let cls = `chess-sq ${light ? 'light' : 'dark'}`;
                if (isSel) cls += ' sel';
                else if (isLast) cls += ' last';
                if (inChk) cls += ' chk';
                return (
                  <div key={`${r}-${c}`} className={cls} onClick={() => handleClick(r, c)}>
                    {isValid && <div className={`dot${piece ? ' cap' : ''}`} />}
                    {piece && (
                      <span className={`cp ${piece.color}`}>
                        {SYMBOLS[piece.color][piece.type]}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div className="chess-files">
            {FILES.map(f => <span key={f} className="chess-label">{f}</span>)}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        {(status === 'checkmate' || status === 'stalemate') && (
          <button className="btn-game" onClick={reset}>{t.nueva}</button>
        )}
        {status !== 'checkmate' && status !== 'stalemate' && (
          <button className="btn-game secondary" onClick={reset}>{t.reiniciar}</button>
        )}
      </div>
      <p className="game-hint">{t.hint}</p>
    </div>
  );
}
