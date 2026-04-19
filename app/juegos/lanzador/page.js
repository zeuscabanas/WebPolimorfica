'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useT } from '../../../components/LocaleProvider';

const CW = 800, CH = 450, GY = 398;
const GRAV = 0.45;
const SX = 130, SY = 308, MAX_PULL = 58;
const BR = 13, PR = 14;
const HP_MAX = { wood: 2, stone: 5, ice: 1 };
const COL = {
  wood:  { fill: '#d4892a', stroke: '#8b5a14', dark: '#5a3a0a' },
  stone: { fill: '#8a9ab0', stroke: '#4a6070', dark: '#2a4050' },
  ice:   { fill: '#c8f0ff', stroke: '#48b8d8', dark: '#1888b0' },
};

const blk = (x, bot, w, h, t) => ({ x, y: bot - h / 2, w, h, type: t, hp: HP_MAX[t], alive: true, dyn: false, vx: 0, vy: 0 });
const pig = (x, bot) => ({ x, y: bot - PR, alive: true, hp: 2, dyn: false, vx: 0, vy: 0 });

const LEVELS = [
  { birds: 2,
    blocks: [blk(550, GY, 50, 30, 'wood'), blk(550, GY - 30, 50, 30, 'wood')],
    pigs: [pig(550, GY - 60)] },
  { birds: 3,
    blocks: [blk(480, GY, 45, 30, 'wood'), blk(480, GY - 30, 45, 30, 'wood'),
             blk(630, GY, 45, 30, 'wood'), blk(630, GY - 30, 45, 30, 'wood')],
    pigs: [pig(480, GY - 60), pig(630, GY - 60)] },
  { birds: 3,
    blocks: [blk(486, GY, 20, 65, 'wood'), blk(594, GY, 20, 65, 'wood'),
             blk(540, GY - 65, 128, 18, 'stone')],
    pigs: [pig(540, GY)] },
  { birds: 3,
    blocks: [blk(495, GY, 40, 30, 'stone'), blk(540, GY, 40, 30, 'stone'), blk(585, GY, 40, 30, 'stone'),
             blk(517, GY - 30, 40, 30, 'wood'), blk(562, GY - 30, 40, 30, 'wood'),
             blk(540, GY - 60, 40, 30, 'ice')],
    pigs: [pig(540, GY - 90)] },
  { birds: 4,
    blocks: [blk(468, GY, 18, 62, 'stone'), blk(528, GY, 18, 62, 'stone'), blk(498, GY - 62, 78, 18, 'stone'),
             blk(600, GY, 18, 62, 'stone'), blk(660, GY, 18, 62, 'stone'), blk(630, GY - 62, 78, 18, 'stone')],
    pigs: [pig(498, GY), pig(630, GY)] },
  { birds: 3,
    blocks: [blk(555, GY, 36, 30, 'stone'), blk(555, GY - 30, 36, 28, 'ice'),
             blk(555, GY - 58, 36, 28, 'ice'), blk(555, GY - 86, 36, 28, 'ice')],
    pigs: [pig(555, GY - 114)] },
  { birds: 4,
    blocks: [blk(475, GY, 20, 85, 'stone'), blk(665, GY, 20, 85, 'stone'),
             blk(570, GY - 85, 210, 20, 'stone'),
             blk(520, GY, 30, 30, 'wood'), blk(570, GY, 30, 30, 'wood'), blk(620, GY, 30, 30, 'wood')],
    pigs: [pig(520, GY - 30), pig(570, GY - 30), pig(620, GY - 30), pig(570, GY - 105)] },
  { birds: 4,
    blocks: [blk(490, GY, 42, 32, 'wood'), blk(540, GY, 42, 62, 'wood'),
             blk(590, GY, 42, 92, 'stone'), blk(640, GY, 42, 122, 'stone')],
    pigs: [pig(490, GY - 32), pig(540, GY - 62), pig(590, GY - 92), pig(640, GY - 122)] },
  { birds: 5,
    blocks: [blk(490, GY, 22, 85, 'stone'), blk(610, GY, 22, 85, 'stone'),
             blk(550, GY - 85, 142, 20, 'stone'),
             blk(520, GY, 30, 50, 'wood'), blk(580, GY, 30, 50, 'wood'),
             blk(550, GY - 50, 60, 20, 'wood')],
    pigs: [pig(520, GY - 50), pig(580, GY - 50), pig(550, GY - 70), pig(550, GY - 105)] },
  { birds: 6,
    blocks: [blk(460, GY, 22, 90, 'stone'), blk(570, GY, 22, 90, 'stone'), blk(680, GY, 22, 90, 'stone'),
             blk(515, GY - 90, 132, 20, 'stone'), blk(625, GY - 90, 132, 20, 'stone'),
             blk(515, GY, 22, 55, 'wood'), blk(625, GY, 22, 55, 'wood'),
             blk(515, GY - 110, 45, 22, 'stone'), blk(625, GY - 110, 45, 22, 'stone')],
    pigs: [pig(490, GY), pig(570, GY - 55), pig(650, GY), pig(515, GY - 132), pig(625, GY - 132)] },
];

const circleAABB = (cx, cy, cr, rx, ry, rw, rh) => {
  const nx = Math.max(rx, Math.min(cx, rx + rw));
  const ny = Math.max(ry, Math.min(cy, ry + rh));
  return (cx - nx) ** 2 + (cy - ny) ** 2 < cr * cr;
};
const cc = (ax, ay, ar, bx, by, br) => (ax - bx) ** 2 + (ay - by) ** 2 < (ar + br) ** 2;

export default function LanzadorPage() {
  const t = useT('lanzador');
  const cvs = useRef(null);
  const g = useRef(null);
  const raf = useRef(null);
  const [ui, setUi] = useState({ phase: 'aim', lvl: 1, score: 0, birds: 0 });

  const build = useCallback((idx) => {
    const L = LEVELS[idx];
    return {
      idx, score: 0,
      birdsLeft: L.birds,
      active: null,
      drag: false, dragX: SX, dragY: SY,
      blocks: L.blocks.map(b => ({ ...b })),
      pigs: L.pigs.map(p => ({ ...p })),
      parts: [],
      phase: 'aim',
      shake: 0,
      settleT: 0,
    };
  }, []);

  const sync = useCallback(() => {
    const s = g.current;
    if (!s) return;
    setUi({ phase: s.phase, lvl: s.idx + 1, score: s.score, birds: s.birdsLeft });
  }, []);

  const spawn = (s, x, y, color, n) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = Math.random() * 4 + 1;
      s.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1.5, r: Math.random() * 3 + 2, color, life: 35 + Math.random() * 20, max: 50 });
    }
  };

  const nextBird = (s) => {
    s.active = null;
    if (s.pigs.every(p => !p.alive)) {
      s.phase = 'win';
    } else if (s.birdsLeft <= 0) {
      s.phase = 'settling';
      s.settleT = 120;
    } else {
      s.phase = 'aim';
      s.dragX = SX; s.dragY = SY;
    }
  };

  const tick = useCallback(() => {
    const s = g.current;
    if (!s) { raf.current = requestAnimationFrame(tick); return; }

    s.parts = s.parts.filter(p => p.life > 0);
    s.parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 1; });

    if (s.phase === 'flying' && s.active) {
      const b = s.active;
      b.vx *= 0.999;
      b.vy += GRAV;
      b.x += b.vx;
      b.y += b.vy;

      if (b.y + BR >= GY) {
        b.y = GY - BR;
        spawn(s, b.x, b.y, '#c8a020', 8);
        nextBird(s);
      } else if (b.x > CW + 50 || b.x < -50) {
        nextBird(s);
      } else {
        for (const bl of s.blocks) {
          if (!bl.alive) continue;
          if (circleAABB(b.x, b.y, BR, bl.x - bl.w / 2, bl.y - bl.h / 2, bl.w, bl.h)) {
            const sp = Math.hypot(b.vx, b.vy);
            const dmg = Math.max(1, Math.ceil(sp / 5));
            bl.hp -= dmg;
            s.score += dmg * 10;
            spawn(s, b.x, b.y, COL[bl.type].dark, 8);
            if (bl.hp <= 0) {
              bl.alive = false;
              s.score += 50;
              s.shake = Math.max(s.shake, 6);
              spawn(s, bl.x, bl.y, COL[bl.type].fill, 18);
            } else {
              bl.dyn = true;
              bl.vx += b.vx * 0.35;
              bl.vy += b.vy * 0.28;
            }
            b.vx *= -0.22;
            b.vy *= -0.32;
            if (Math.hypot(b.vx, b.vy) < 1.5) { nextBird(s); break; }
          }
        }
        if (s.active) {
          for (const p of s.pigs) {
            if (!p.alive) continue;
            if (cc(b.x, b.y, BR, p.x, p.y, PR)) {
              const sp = Math.hypot(b.vx, b.vy);
              p.hp -= Math.max(1, Math.ceil(sp / 4));
              s.score += 100;
              spawn(s, p.x, p.y, '#7dc843', 12);
              if (p.hp <= 0) {
                p.alive = false;
                s.score += 300;
                s.shake = Math.max(s.shake, 10);
                spawn(s, p.x, p.y, '#60c030', 28);
              }
              b.vx *= -0.15;
              b.vy *= -0.25;
            }
          }
        }
      }
    }

    for (const bl of s.blocks) {
      if (!bl.alive || !bl.dyn) continue;
      bl.vx *= 0.97;
      bl.vy += GRAV;
      bl.x += bl.vx;
      bl.y += bl.vy;

      if (bl.y + bl.h / 2 >= GY) {
        bl.y = GY - bl.h / 2;
        bl.vy *= -0.15;
        bl.vx *= 0.75;
        if (Math.abs(bl.vy) < 0.6 && Math.abs(bl.vx) < 0.4) { bl.vx = 0; bl.vy = 0; bl.dyn = false; }
      }

      for (const o of s.blocks) {
        if (!o.alive || o === bl) continue;
        const ox = (bl.w + o.w) / 2 - Math.abs(bl.x - o.x);
        const oy = (bl.h + o.h) / 2 - Math.abs(bl.y - o.y);
        if (ox > 0 && oy > 0) {
          const sp = Math.hypot(bl.vx, bl.vy);
          if (ox < oy) {
            const d = bl.x < o.x ? -1 : 1;
            bl.x += d * ox * 0.5;
            o.x -= d * ox * 0.5;
            if (sp > 2) {
              o.dyn = true;
              o.vx += bl.vx * 0.45;
              o.vy += bl.vy * 0.15;
              bl.vx *= 0.5;
            }
          } else {
            const d = bl.y < o.y ? -1 : 1;
            bl.y += d * oy * 0.5;
            o.y -= d * oy * 0.5;
            if (sp > 2) {
              o.dyn = true;
              o.vx += bl.vx * 0.15;
              o.vy += bl.vy * 0.45;
              bl.vy *= 0.4;
            }
          }
          if (sp > 3) {
            o.hp -= 1;
            if (o.hp <= 0) {
              o.alive = false;
              s.score += 30;
              spawn(s, o.x, o.y, COL[o.type].fill, 12);
            }
          }
        }
      }

      for (const p of s.pigs) {
        if (!p.alive) continue;
        const sp = Math.hypot(bl.vx, bl.vy);
        if (sp > 1.5 && circleAABB(p.x, p.y, PR, bl.x - bl.w / 2, bl.y - bl.h / 2, bl.w, bl.h)) {
          p.hp -= Math.max(1, Math.ceil(sp / 4));
          spawn(s, p.x, p.y, '#7dc843', 8);
          if (p.hp <= 0) {
            p.alive = false;
            s.score += 250;
            s.shake = Math.max(s.shake, 8);
            spawn(s, p.x, p.y, '#60c030', 22);
          }
        }
      }
    }

    for (const p of s.pigs) {
      if (!p.alive || !p.dyn) continue;
      p.vx *= 0.95; p.vy += GRAV;
      p.x += p.vx; p.y += p.vy;
      if (p.y + PR >= GY) { p.y = GY - PR; p.vy *= -0.2; p.vx *= 0.7; if (Math.abs(p.vy) < 0.5) { p.vy = 0; p.dyn = false; } }
    }

    if (s.phase === 'settling') {
      s.settleT--;
      const moving = s.blocks.some(b => b.alive && b.dyn);
      const allDead = s.pigs.every(p => !p.alive);
      if (allDead) s.phase = 'win';
      else if ((!moving && s.settleT < 90) || s.settleT <= 0) s.phase = 'lose';
    }

    if (s.shake > 0) s.shake *= 0.88;

    const c = cvs.current;
    if (c) draw(c.getContext('2d'), s);
    sync();

    raf.current = requestAnimationFrame(tick);
  }, [sync]);

  useEffect(() => {
    g.current = build(0);
    sync();
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [build, sync, tick]);

  const pos = (e, c) => {
    const r = c.getBoundingClientRect();
    const sx = CW / r.width, sy = CH / r.height;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    return [(x - r.left) * sx, (y - r.top) * sy];
  };

  const down = useCallback((e) => {
    const s = g.current;
    if (!s || s.phase !== 'aim') return;
    const [x, y] = pos(e, cvs.current);
    if ((x - SX) ** 2 + (y - SY) ** 2 < 2500) s.drag = true;
  }, []);

  const move = useCallback((e) => {
    const s = g.current;
    if (!s || !s.drag || s.phase !== 'aim') return;
    if (e.preventDefault) e.preventDefault();
    const [x, y] = pos(e, cvs.current);
    const dx = x - SX, dy = y - SY;
    const d = Math.hypot(dx, dy);
    if (d > MAX_PULL) { s.dragX = SX + dx / d * MAX_PULL; s.dragY = SY + dy / d * MAX_PULL; }
    else { s.dragX = x; s.dragY = y; }
  }, []);

  const up = useCallback(() => {
    const s = g.current;
    if (!s || !s.drag || s.phase !== 'aim') return;
    s.drag = false;
    const vx = (SX - s.dragX) * 0.2;
    const vy = (SY - s.dragY) * 0.2;
    if (Math.abs(vx) < 0.8 && Math.abs(vy) < 0.8) { s.dragX = SX; s.dragY = SY; return; }
    s.active = { x: s.dragX, y: s.dragY, vx, vy };
    s.birdsLeft -= 1;
    s.phase = 'flying';
    s.dragX = SX; s.dragY = SY;
  }, []);

  useEffect(() => {
    const c = cvs.current;
    if (!c) return;
    const o = { passive: false };
    c.addEventListener('touchstart', down, o);
    c.addEventListener('touchmove', move, o);
    c.addEventListener('touchend', up, o);
    return () => {
      c.removeEventListener('touchstart', down, o);
      c.removeEventListener('touchmove', move, o);
      c.removeEventListener('touchend', up, o);
    };
  }, [down, move, up]);

  const next = () => {
    const s = g.current;
    const i = s.idx + 1;
    if (i >= LEVELS.length) { g.current = { ...build(0), phase: 'allDone' }; sync(); return; }
    g.current = build(i); sync();
  };
  const retry = () => { g.current = build(g.current.idx); sync(); };

  return (
    <div className="tool-page" style={{ maxWidth: '860px' }}>
      <div className="tool-header">
        <h1><span className="highlight">{t.title}</span></h1>
        <p className="subtitle">{t.subtitle}</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', fontSize: '14px', fontWeight: 600 }}>
        <span style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '8px', padding: '6px 14px' }}>
          {t.level} {ui.lvl}/{LEVELS.length}
        </span>
        <span style={{ background: 'rgba(255,200,50,0.1)', border: '1px solid rgba(255,200,50,0.3)', borderRadius: '8px', padding: '6px 14px' }}>
          {t.score}: {ui.score}
        </span>
        <span style={{ background: 'rgba(100,220,100,0.08)', border: '1px solid rgba(100,220,100,0.25)', borderRadius: '8px', padding: '6px 14px' }}>
          🐦 {ui.birds}{ui.phase === 'aim' ? '+1' : ''}
        </span>
      </div>

      <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
        <canvas
          ref={cvs}
          width={CW}
          height={CH}
          style={{ display: 'block', width: '100%', cursor: ui.phase === 'aim' ? 'grab' : 'default', touchAction: 'none' }}
          onMouseDown={down}
          onMouseMove={move}
          onMouseUp={up}
          onMouseLeave={up}
        />
        {ui.phase === 'win' && (
          <Over color="rgba(50,170,80,0.94)">
            <div style={{ fontSize: 48 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 16px' }}>{t.levelComplete}</div>
            <button className="btn-primary" onClick={next}>{t.nextLevel}</button>
          </Over>
        )}
        {ui.phase === 'lose' && (
          <Over color="rgba(170,50,50,0.94)">
            <div style={{ fontSize: 48 }}>💥</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{t.gameOver}</div>
            <div style={{ fontSize: 13, opacity: 0.8, margin: '4px 0 16px' }}>{t.gameOverSub}</div>
            <button className="btn-primary" onClick={retry}>{t.restart}</button>
          </Over>
        )}
        {ui.phase === 'allDone' && (
          <Over color="rgba(100,60,200,0.94)">
            <div style={{ fontSize: 56 }}>🏆</div>
            <div style={{ fontSize: 20, fontWeight: 800, margin: '8px 0 16px', textAlign: 'center' }}>{t.allLevels}</div>
            <button className="btn-primary" onClick={() => { g.current = build(0); sync(); }}>▶ Nivel 1</button>
          </Over>
        )}
      </div>

      <p style={{ marginTop: 12, fontSize: 13, opacity: 0.45, textAlign: 'center' }}>{t.hint}</p>
    </div>
  );
}

function Over({ color, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
      {children}
    </div>
  );
}

function draw(ctx, s) {
  const W = CW, H = CH;
  ctx.save();
  if (s.shake > 0.3) {
    ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);
  }
  ctx.clearRect(0, 0, W, H);

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#162341');
  sky.addColorStop(0.6, '#2d5a8e');
  sky.addColorStop(1, '#5a8ec0');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  [[100,60,70,22],[280,40,90,24],[490,80,60,18],[680,55,80,24]].forEach(([x,y,rw,rh]) => {
    ctx.beginPath(); ctx.ellipse(x, y, rw, rh, 0, 0, Math.PI * 2); ctx.fill();
  });

  ctx.fillStyle = 'rgba(40,60,90,0.55)';
  ctx.beginPath();
  ctx.moveTo(0, 340);
  ctx.quadraticCurveTo(100, 290, 220, 320);
  ctx.quadraticCurveTo(340, 345, 460, 310);
  ctx.quadraticCurveTo(580, 280, 700, 325);
  ctx.quadraticCurveTo(780, 345, 800, 330);
  ctx.lineTo(800, GY);
  ctx.lineTo(0, GY);
  ctx.closePath();
  ctx.fill();

  const g1 = ctx.createLinearGradient(0, GY, 0, H);
  g1.addColorStop(0, '#3a7d44');
  g1.addColorStop(0.4, '#2d5e33');
  g1.addColorStop(1, '#1a3a1e');
  ctx.fillStyle = g1;
  ctx.fillRect(0, GY, W, H - GY);
  ctx.strokeStyle = '#5bc050';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, GY); ctx.lineTo(W, GY); ctx.stroke();

  ctx.strokeStyle = '#4a8c40';
  ctx.lineWidth = 1.5;
  for (let x = 10; x < W; x += 7) {
    const h = 4 + (Math.sin(x * 0.3) + 1) * 2;
    ctx.beginPath(); ctx.moveTo(x, GY); ctx.lineTo(x + 1, GY - h); ctx.stroke();
  }

  // Slingshot Y
  ctx.strokeStyle = '#4a2a08';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(SX, GY); ctx.lineTo(SX, SY + 18); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(SX, SY + 18); ctx.lineTo(SX - 16, SY - 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(SX, SY + 18); ctx.lineTo(SX + 16, SY - 2); ctx.stroke();

  // Bands and bird in sling
  const phAim = s.phase === 'aim';
  const bx = phAim ? s.dragX : SX;
  const by = phAim ? s.dragY : SY;

  if (phAim) {
    ctx.strokeStyle = '#9a5a30';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(SX - 16, SY - 2); ctx.lineTo(bx, by); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(SX + 16, SY - 2); ctx.lineTo(bx, by); ctx.stroke();
  }

  if (phAim && s.drag) {
    const vx = (SX - s.dragX) * 0.2;
    const vy = (SY - s.dragY) * 0.2;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let i = 1; i <= 22; i++) {
      const t2 = i * 4;
      const px = bx + vx * t2;
      const py = by + vy * t2 + 0.5 * GRAV * t2 * t2;
      if (py > GY || px > CW) break;
      const r = 3 - i * 0.1;
      if (r <= 0.5) break;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    }
  }

  // Blocks
  for (const b of s.blocks) {
    if (!b.alive) continue;
    drawBlock(ctx, b);
  }

  // Pigs
  for (const p of s.pigs) {
    if (!p.alive) continue;
    drawPig(ctx, p.x, p.y, PR);
  }

  // Waiting birds on ground
  const remain = s.birdsLeft;
  for (let i = 0; i < remain; i++) {
    drawBird(ctx, SX - 42 - i * 28, GY - BR * 0.75, BR * 0.7);
  }

  // Bird in sling or flying
  if (phAim) drawBird(ctx, s.dragX, s.dragY, BR);
  else if (s.active) drawBird(ctx, s.active.x, s.active.y, BR);

  // Particles
  for (const p of s.parts) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawBlock(ctx, b) {
  const c = COL[b.type];
  const x = b.x - b.w / 2, y = b.y - b.h / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x + 2, y + 2, b.w, b.h);
  const g = ctx.createLinearGradient(x, y, x, y + b.h);
  g.addColorStop(0, c.fill);
  g.addColorStop(1, c.stroke);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, b.w, b.h);
  ctx.strokeStyle = c.dark;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 0.5, y + 0.5, b.w - 1, b.h - 1);
  if (b.hp < HP_MAX[b.type]) {
    ctx.strokeStyle = c.dark;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + b.w * 0.3, y + b.h * 0.2);
    ctx.lineTo(x + b.w * 0.5, y + b.h * 0.5);
    ctx.lineTo(x + b.w * 0.35, y + b.h * 0.75);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + b.w * 0.55, y + b.h * 0.35);
    ctx.lineTo(x + b.w * 0.7, y + b.h * 0.6);
    ctx.stroke();
  }
}

function drawBird(ctx, x, y, r) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(x, y + r * 0.95, r * 0.85, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#ff9090');
  g.addColorStop(0.7, '#d62a2a');
  g.addColorStop(1, '#8a1010');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a81818';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.2, y - r * 0.85);
  ctx.quadraticCurveTo(x, y - r * 1.4, x + r * 0.2, y - r * 0.85);
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(x - r * 0.28, y - r * 0.12, r * 0.26, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.28, y - r * 0.12, r * 0.26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(x - r * 0.22, y - r * 0.08, r * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.34, y - r * 0.08, r * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#220000';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - r * 0.55, y - r * 0.35); ctx.lineTo(x - r * 0.1, y - r * 0.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + r * 0.55, y - r * 0.35); ctx.lineTo(x + r * 0.1, y - r * 0.5); ctx.stroke();
  ctx.fillStyle = '#ffa020';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.18, y + r * 0.15);
  ctx.lineTo(x + r * 0.18, y + r * 0.15);
  ctx.lineTo(x, y + r * 0.48);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#aa6010';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawPig(ctx, x, y, r) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath(); ctx.ellipse(x, y + r * 0.95, r * 0.9, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#a8e860');
  g.addColorStop(0.7, '#50a820');
  g.addColorStop(1, '#2a6010');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a7818';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.85, y - r * 0.4);
  ctx.lineTo(x - r * 0.55, y - r * 1.1);
  ctx.lineTo(x - r * 0.35, y - r * 0.55);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.85, y - r * 0.4);
  ctx.lineTo(x + r * 0.55, y - r * 1.1);
  ctx.lineTo(x + r * 0.35, y - r * 0.55);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#70c038';
  ctx.beginPath(); ctx.ellipse(x, y + r * 0.3, r * 0.55, r * 0.38, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#204010';
  ctx.beginPath(); ctx.ellipse(x - r * 0.18, y + r * 0.3, r * 0.1, r * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + r * 0.18, y + r * 0.3, r * 0.1, r * 0.14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(x - r * 0.32, y - r * 0.18, r * 0.24, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.32, y - r * 0.18, r * 0.24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(x - r * 0.27, y - r * 0.15, r * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.37, y - r * 0.15, r * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(x - r * 0.24, y - r * 0.2, r * 0.04, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.4, y - r * 0.2, r * 0.04, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
