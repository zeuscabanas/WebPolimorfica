'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useT } from '../../../components/LocaleProvider';

// ─── Level definitions ──────────────────────────────────────────────────────
// Each level: { birds, pigs: [{x,y}], blocks: [{x,y,w,h,type}] }
// type: 'wood'|'stone'|'ice' — affects color and HP
// Coordinates are in "world units": canvas is 800×400, ground at y=340

const LEVELS = [
  // 1 — Single tower
  {
    birds: ['red','red'],
    pigs: [{ x: 560, y: 310 }],
    blocks: [
      { x: 545, y: 340, w: 30, h: 30, type: 'wood' },
      { x: 545, y: 310, w: 30, h: 30, type: 'wood' },
    ],
  },
  // 2 — Two towers
  {
    birds: ['red','red','red'],
    pigs: [{ x: 540, y: 310 }, { x: 640, y: 310 }],
    blocks: [
      { x: 525, y: 340, w: 30, h: 30, type: 'wood' },
      { x: 525, y: 310, w: 30, h: 30, type: 'wood' },
      { x: 625, y: 340, w: 30, h: 30, type: 'wood' },
      { x: 625, y: 310, w: 30, h: 30, type: 'wood' },
    ],
  },
  // 3 — Tall tower + stone base
  {
    birds: ['red','red','red'],
    pigs: [{ x: 570, y: 280 }],
    blocks: [
      { x: 555, y: 340, w: 30, h: 30, type: 'stone' },
      { x: 555, y: 310, w: 30, h: 30, type: 'wood' },
      { x: 555, y: 280, w: 30, h: 30, type: 'wood' },
      { x: 555, y: 250, w: 30, h: 30, type: 'ice' },
    ],
  },
  // 4 — Fort: walls + roof
  {
    birds: ['red','red','red','red'],
    pigs: [{ x: 590, y: 310 }],
    blocks: [
      { x: 555, y: 340, w: 20, h: 70, type: 'wood' },
      { x: 625, y: 340, w: 20, h: 70, type: 'wood' },
      { x: 555, y: 270, w: 90, h: 20, type: 'stone' },
    ],
  },
  // 5 — Two forts
  {
    birds: ['red','red','red','red','red'],
    pigs: [{ x: 540, y: 300 }, { x: 660, y: 300 }],
    blocks: [
      { x: 510, y: 340, w: 20, h: 60, type: 'wood' },
      { x: 560, y: 340, w: 20, h: 60, type: 'wood' },
      { x: 510, y: 280, w: 70, h: 20, type: 'stone' },
      { x: 630, y: 340, w: 20, h: 60, type: 'wood' },
      { x: 680, y: 340, w: 20, h: 60, type: 'wood' },
      { x: 630, y: 280, w: 70, h: 20, type: 'stone' },
    ],
  },
  // 6 — Pyramid
  {
    birds: ['red','red','red'],
    pigs: [{ x: 590, y: 280 }],
    blocks: [
      { x: 540, y: 340, w: 30, h: 30, type: 'stone' },
      { x: 575, y: 340, w: 30, h: 30, type: 'stone' },
      { x: 610, y: 340, w: 30, h: 30, type: 'stone' },
      { x: 557, y: 310, w: 30, h: 30, type: 'wood' },
      { x: 593, y: 310, w: 30, h: 30, type: 'wood' },
      { x: 575, y: 280, w: 30, h: 30, type: 'ice' },
    ],
  },
  // 7 — Stacked chaos
  {
    birds: ['red','red','red','red'],
    pigs: [{ x: 560, y: 310 }, { x: 620, y: 250 }],
    blocks: [
      { x: 545, y: 340, w: 30, h: 30, type: 'wood' },
      { x: 545, y: 310, w: 30, h: 30, type: 'wood' },
      { x: 545, y: 280, w: 30, h: 60, type: 'stone' },
      { x: 600, y: 340, w: 30, h: 30, type: 'wood' },
      { x: 600, y: 310, w: 30, h: 30, type: 'ice' },
      { x: 600, y: 280, w: 30, h: 30, type: 'ice' },
      { x: 600, y: 250, w: 30, h: 30, type: 'wood' },
    ],
  },
  // 8 — Wide castle
  {
    birds: ['red','red','red','red','red'],
    pigs: [{ x: 545, y: 295 }, { x: 625, y: 295 }, { x: 585, y: 240 }],
    blocks: [
      { x: 520, y: 340, w: 20, h: 80, type: 'stone' },
      { x: 660, y: 340, w: 20, h: 80, type: 'stone' },
      { x: 520, y: 260, w: 160, h: 20, type: 'stone' },
      { x: 560, y: 340, w: 20, h: 50, type: 'wood' },
      { x: 620, y: 340, w: 20, h: 50, type: 'wood' },
      { x: 560, y: 240, w: 80, h: 20, type: 'wood' },
    ],
  },
  // 9 — Multi-story
  {
    birds: ['red','red','red','red','red'],
    pigs: [{ x: 560, y: 310 }, { x: 620, y: 310 }, { x: 590, y: 240 }],
    blocks: [
      { x: 545, y: 340, w: 30, h: 30, type: 'stone' },
      { x: 545, y: 310, w: 30, h: 30, type: 'wood' },
      { x: 605, y: 340, w: 30, h: 30, type: 'stone' },
      { x: 605, y: 310, w: 30, h: 30, type: 'wood' },
      { x: 545, y: 280, w: 90, h: 20, type: 'stone' },
      { x: 575, y: 260, w: 30, h: 30, type: 'ice' },
      { x: 575, y: 230, w: 30, h: 30, type: 'ice' },
    ],
  },
  // 10 — Final boss
  {
    birds: ['red','red','red','red','red','red'],
    pigs: [{ x: 530, y: 305 }, { x: 600, y: 305 }, { x: 670, y: 305 }, { x: 565, y: 245 }, { x: 635, y: 245 }],
    blocks: [
      { x: 510, y: 340, w: 20, h: 70, type: 'stone' },
      { x: 545, y: 340, w: 20, h: 70, type: 'stone' },
      { x: 510, y: 270, w: 55, h: 20, type: 'stone' },
      { x: 580, y: 340, w: 20, h: 70, type: 'stone' },
      { x: 615, y: 340, w: 20, h: 70, type: 'stone' },
      { x: 580, y: 270, w: 55, h: 20, type: 'stone' },
      { x: 650, y: 340, w: 20, h: 70, type: 'stone' },
      { x: 685, y: 340, w: 20, h: 70, type: 'stone' },
      { x: 650, y: 270, w: 55, h: 20, type: 'stone' },
      { x: 545, y: 250, w: 110, h: 20, type: 'wood' },
      { x: 550, y: 270, w: 20, h: 30, type: 'wood' },
      { x: 630, y: 270, w: 20, h: 30, type: 'wood' },
    ],
  },
];

// ─── Physics constants ───────────────────────────────────────────────────────
const GRAVITY     = 0.4;
const SLING_X     = 140;
const SLING_Y     = 285;
const SLING_R     = 55;          // max pull radius
const BIRD_R      = 14;
const PIG_R       = 16;
const BLOCK_HP    = { wood: 3, stone: 5, ice: 2 };
const GROUND_Y    = 358;
const CANVAS_W    = 800;
const CANVAS_H    = 400;

// ─── Colors ──────────────────────────────────────────────────────────────────
const BLOCK_COLORS = {
  wood:  { fill: '#c8892a', stroke: '#8b5c14', crack: '#7a4210' },
  stone: { fill: '#8e9aaf', stroke: '#5a6475', crack: '#454f5e' },
  ice:   { fill: '#aee8f8', stroke: '#5ab4d0', crack: '#3a8ca8' },
};

// ─── Helper: rect overlap ────────────────────────────────────────────────────
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function circleRectOverlap(cx, cy, cr, rx, ry, rw, rh) {
  const nearX = Math.max(rx, Math.min(cx, rx + rw));
  const nearY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - nearX, dy = cy - nearY;
  return dx * dx + dy * dy < cr * cr;
}

function circleCircleOverlap(ax, ay, ar, bx, by, br) {
  const dx = ax - bx, dy = ay - by;
  return dx * dx + dy * dy < (ar + br) * (ar + br);
}

// ─── Main game component ─────────────────────────────────────────────────────
export default function LanzadorPage() {
  const t = useT('lanzador');
  const canvasRef = useRef(null);
  const stateRef  = useRef(null);
  const rafRef    = useRef(null);
  const [ui, setUi] = useState({ level: 0, score: 0, birds: 0, phase: 'idle' });

  // Build initial state for a level
  const buildLevel = useCallback((lvlIdx) => {
    const lvl = LEVELS[lvlIdx];
    return {
      lvlIdx,
      score: 0,
      birds: lvl.birds.map((type, i) => ({ type, queued: i > 0 })),
      activeBird: null,
      drag: false,
      dragX: SLING_X,
      dragY: SLING_Y,
      blocks: lvl.blocks.map(b => ({ ...b, hp: BLOCK_HP[b.type] || 3, alive: true })),
      pigs: lvl.pigs.map(p => ({ ...p, hp: 3, alive: true })),
      particles: [],
      phase: 'aim',  // aim | flying | result
      resultTimer: 0,
    };
  }, []);

  const syncUi = useCallback((s) => {
    if (!s) return;
    const remainingBirds = s.birds.filter(b => b.queued).length + (s.activeBird ? 1 : 0);
    setUi({
      level: s.lvlIdx + 1,
      score: s.score,
      birds: remainingBirds + (s.phase === 'aim' ? 1 : 0),
      phase: s.phase,
    });
  }, []);

  // ─── Draw ────────────────────────────────────────────────────────────────
  const draw = useCallback((ctx, s, pointer) => {
    const W = CANVAS_W, H = CANVAS_H;
    ctx.clearRect(0, 0, W, H);

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#1a2a4a');
    sky.addColorStop(1, '#2d5a8e');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    [[120,80,60,25],[300,60,80,20],[550,90,70,22],[700,70,50,18]].forEach(([x,y,rw,rh]) => {
      ctx.beginPath(); ctx.ellipse(x, y, rw, rh, 0, 0, Math.PI*2); ctx.fill();
    });

    // Ground
    const ground = ctx.createLinearGradient(0, GROUND_Y, 0, H);
    ground.addColorStop(0, '#3a7d44');
    ground.addColorStop(0.3, '#2d5e33');
    ground.addColorStop(1, '#1a3a1e');
    ctx.fillStyle = ground;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.strokeStyle = '#4a9e55';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(W, GROUND_Y); ctx.stroke();

    // Slingshot
    ctx.strokeStyle = '#7a4a10';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    // Left fork
    ctx.beginPath();
    ctx.moveTo(SLING_X - 10, GROUND_Y);
    ctx.lineTo(SLING_X - 18, SLING_Y + 10);
    ctx.stroke();
    // Right fork
    ctx.beginPath();
    ctx.moveTo(SLING_X + 10, GROUND_Y);
    ctx.lineTo(SLING_X + 18, SLING_Y + 10);
    ctx.stroke();

    // Slingshot elastic bands
    const birdX = s.phase === 'aim' ? s.dragX : (s.activeBird ? s.activeBird.x : SLING_X);
    const birdY = s.phase === 'aim' ? s.dragY : (s.activeBird ? s.activeBird.y : SLING_Y);
    if (s.phase === 'aim' || (s.phase === 'flying' && s.activeBird)) {
      ctx.strokeStyle = '#a0623a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(SLING_X - 18, SLING_Y + 10);
      ctx.lineTo(birdX, birdY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(SLING_X + 18, SLING_Y + 10);
      ctx.lineTo(birdX, birdY);
      ctx.stroke();
    }

    // Trajectory dots (only in aim mode)
    if (s.phase === 'aim' && s.drag) {
      const vx = (SLING_X - s.dragX) * 0.18;
      const vy = (SLING_Y - s.dragY) * 0.18;
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 1; i <= 18; i++) {
        const t2 = i * 4;
        const px = birdX + vx * t2;
        const py = birdY + vy * t2 + 0.5 * GRAVITY * t2 * t2;
        if (py > GROUND_Y) break;
        const r = 3 - i * 0.12;
        if (r <= 0) break;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Queued birds on ground near sling
    const queuedBirds = s.birds.filter(b => b.queued);
    queuedBirds.forEach((b, i) => {
      const qx = SLING_X - 50 - i * 32;
      const qy = GROUND_Y - BIRD_R;
      drawBird(ctx, b.type, qx, qy, BIRD_R * 0.75, false);
    });

    // Active bird in sling (aim phase) or flying
    if (s.phase === 'aim') {
      const readyBird = s.birds.find(b => !b.queued);
      if (readyBird) drawBird(ctx, readyBird.type, s.dragX, s.dragY, BIRD_R, s.drag);
    } else if (s.activeBird) {
      drawBird(ctx, s.activeBird.type, s.activeBird.x, s.activeBird.y, BIRD_R, false);
    }

    // Blocks
    s.blocks.forEach(b => {
      if (!b.alive) return;
      const c = BLOCK_COLORS[b.type];
      ctx.fillStyle = c.fill;
      ctx.strokeStyle = c.stroke;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(b.x - b.w / 2, b.y - b.h, b.w, b.h, 3);
      ctx.fill(); ctx.stroke();
      // Cracks if damaged
      if (b.hp < BLOCK_HP[b.type]) {
        ctx.strokeStyle = c.crack;
        ctx.lineWidth = 1.5;
        const cx2 = b.x, cy2 = b.y - b.h / 2;
        ctx.beginPath();
        ctx.moveTo(cx2 - 4, cy2 - 5); ctx.lineTo(cx2 + 2, cy2 + 3); ctx.lineTo(cx2 - 2, cy2 + 8);
        ctx.stroke();
      }
    });

    // Pigs
    s.pigs.forEach(p => {
      if (!p.alive) return;
      drawPig(ctx, p.x, p.y, PIG_R);
    });

    // Particles
    s.particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }, []);

  // ─── Physics tick ─────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s) return;

    // Update particles
    s.particles = s.particles.filter(p => p.life > 0);
    s.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.15; p.life -= 1;
    });

    if (s.phase === 'flying' && s.activeBird) {
      const b = s.activeBird;
      b.vx *= 0.999;
      b.vy += GRAVITY;
      b.x += b.vx;
      b.y += b.vy;
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 12) b.trail.shift();

      // Ground collision
      if (b.y + BIRD_R >= GROUND_Y) {
        b.y = GROUND_Y - BIRD_R;
        spawnParticles(s, b.x, b.y, '#c8a020', 8);
        landBird(s);
        return;
      }

      // Wall out of bounds
      if (b.x > CANVAS_W + 50 || b.x < -50) {
        landBird(s);
        return;
      }

      // Block collisions
      s.blocks.forEach(block => {
        if (!block.alive) return;
        if (circleRectOverlap(b.x, b.y, BIRD_R, block.x - block.w / 2, block.y - block.h, block.w, block.h)) {
          const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          const dmg = Math.ceil(speed / 6);
          block.hp -= dmg;
          s.score += dmg * 10;
          spawnParticles(s, b.x, b.y, BLOCK_COLORS[block.type].crack, 10);
          if (block.hp <= 0) {
            block.alive = false;
            s.score += 50;
            spawnParticles(s, b.x, b.y, BLOCK_COLORS[block.type].fill, 20);
          }
          // Bounce
          b.vx *= -0.3;
          b.vy *= -0.4;
          if (Math.abs(b.vx) < 1 && Math.abs(b.vy) < 1) {
            landBird(s);
          }
        }
      });

      // Pig collisions
      s.pigs.forEach(pig => {
        if (!pig.alive) return;
        if (circleCircleOverlap(b.x, b.y, BIRD_R, pig.x, pig.y, PIG_R)) {
          pig.hp -= 2;
          s.score += 100;
          spawnParticles(s, pig.x, pig.y, '#7dc843', 15);
          if (pig.hp <= 0) {
            pig.alive = false;
            s.score += 200;
            spawnParticles(s, pig.x, pig.y, '#4a9e2a', 25);
          }
          b.vx *= -0.25;
          b.vy *= -0.35;
        }
      });
    }

    if (s.phase === 'result') {
      s.resultTimer--;
      if (s.resultTimer <= 0) {
        syncUi(s);
      }
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      draw(ctx, s, null);
    }
    syncUi(s);

    rafRef.current = requestAnimationFrame(tick);
  }, [draw, syncUi]);

  function landBird(s) {
    s.activeBird = null;
    const allPigsDead = s.pigs.every(p => !p.alive);
    const noMoreBirds = s.birds.every(b => !b.queued) && !s.birds.find(b => !b.queued && !s.activeBird);

    if (allPigsDead) {
      s.phase = 'win';
    } else {
      // Next bird
      const nextIdx = s.birds.findIndex(b => b.queued);
      if (nextIdx === -1) {
        s.phase = 'lose';
      } else {
        s.birds[nextIdx].queued = false;
        s.phase = 'aim';
        s.dragX = SLING_X;
        s.dragY = SLING_Y;
        s.drag = false;
      }
    }
  }

  function spawnParticles(s, x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      s.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        r: Math.random() * 4 + 2,
        color,
        life: 30 + Math.random() * 20,
        maxLife: 50,
      });
    }
  }

  // ─── Mount / start ────────────────────────────────────────────────────────
  useEffect(() => {
    const s = buildLevel(0);
    stateRef.current = s;
    syncUi(s);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [buildLevel, tick, syncUi]);

  // ─── Input handlers ───────────────────────────────────────────────────────
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return [(clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY];
  };

  const onPointerDown = useCallback((e) => {
    const s = stateRef.current;
    if (!s || s.phase !== 'aim') return;
    const canvas = canvasRef.current;
    const [px, py] = getPos(e, canvas);
    const dx = px - SLING_X, dy = py - SLING_Y;
    if (Math.sqrt(dx * dx + dy * dy) < 50) {
      s.drag = true;
    }
  }, []);

  const onPointerMove = useCallback((e) => {
    const s = stateRef.current;
    if (!s || !s.drag || s.phase !== 'aim') return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const [px, py] = getPos(e, canvas);
    const dx = px - SLING_X, dy = py - SLING_Y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > SLING_R) {
      const ratio = SLING_R / dist;
      s.dragX = SLING_X + dx * ratio;
      s.dragY = SLING_Y + dy * ratio;
    } else {
      s.dragX = px;
      s.dragY = py;
    }
  }, []);

  const onPointerUp = useCallback((e) => {
    const s = stateRef.current;
    if (!s || !s.drag || s.phase !== 'aim') return;
    s.drag = false;
    const vx = (SLING_X - s.dragX) * 0.18;
    const vy = (SLING_Y - s.dragY) * 0.18;
    if (Math.abs(vx) < 0.5 && Math.abs(vy) < 0.5) {
      s.dragX = SLING_X; s.dragY = SLING_Y;
      return;
    }
    // Mark first non-queued bird as active
    const readyBird = s.birds.find(b => !b.queued);
    if (!readyBird) return;
    readyBird.queued = true; // consumed
    s.activeBird = { type: readyBird.type, x: s.dragX, y: s.dragY, vx, vy, trail: [] };
    s.phase = 'flying';
    s.dragX = SLING_X; s.dragY = SLING_Y;
  }, []);

  const handleNextLevel = () => {
    const s = stateRef.current;
    if (!s) return;
    const next = s.lvlIdx + 1;
    if (next >= LEVELS.length) {
      stateRef.current = { ...buildLevel(0), phase: 'allLevels' };
      syncUi(stateRef.current);
      return;
    }
    stateRef.current = buildLevel(next);
    syncUi(stateRef.current);
  };

  const handleRestart = () => {
    const s = stateRef.current;
    if (!s) return;
    stateRef.current = buildLevel(s.lvlIdx);
    syncUi(stateRef.current);
  };

  // Touch events need passive:false to allow preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const opts = { passive: false };
    canvas.addEventListener('touchmove', onPointerMove, opts);
    canvas.addEventListener('touchstart', onPointerDown, opts);
    canvas.addEventListener('touchend', onPointerUp, opts);
    return () => {
      canvas.removeEventListener('touchmove', onPointerMove, opts);
      canvas.removeEventListener('touchstart', onPointerDown, opts);
      canvas.removeEventListener('touchend', onPointerUp, opts);
    };
  }, [onPointerDown, onPointerMove, onPointerUp]);

  return (
    <div className="tool-page" style={{ maxWidth: '860px' }}>
      <div className="tool-header">
        <h1><span className="highlight">{t.title}</span></h1>
        <p className="subtitle">{t.subtitle}</p>
      </div>

      {/* HUD */}
      <div style={{
        display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '12px',
        flexWrap: 'wrap', fontSize: '14px', fontWeight: 600,
      }}>
        <span style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '8px', padding: '6px 14px' }}>
          {t.level} {ui.level} / {LEVELS.length}
        </span>
        <span style={{ background: 'rgba(255,200,50,0.1)', border: '1px solid rgba(255,200,50,0.3)', borderRadius: '8px', padding: '6px 14px' }}>
          {t.score}: {ui.score}
        </span>
        <span style={{ background: 'rgba(100,220,100,0.08)', border: '1px solid rgba(100,220,100,0.25)', borderRadius: '8px', padding: '6px 14px' }}>
          🐦 {t.birds}: {ui.birds}
        </span>
      </div>

      {/* Canvas */}
      <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={{ display: 'block', width: '100%', cursor: ui.phase === 'aim' ? 'crosshair' : 'default', touchAction: 'none' }}
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
        />

        {/* Win overlay */}
        {ui.phase === 'win' && (
          <Overlay color="rgba(50,180,80,0.92)">
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
            <div style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>{t.levelComplete}</div>
            <button className="btn-primary" onClick={handleNextLevel}>{t.nextLevel}</button>
          </Overlay>
        )}

        {/* Lose overlay */}
        {ui.phase === 'lose' && (
          <Overlay color="rgba(180,50,50,0.92)">
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>💥</div>
            <div style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>{t.gameOver}</div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '16px' }}>{t.gameOverSub}</div>
            <button className="btn-primary" onClick={handleRestart}>{t.restart}</button>
          </Overlay>
        )}

        {/* All levels overlay */}
        {ui.phase === 'allLevels' && (
          <Overlay color="rgba(100,60,200,0.94)">
            <div style={{ fontSize: '56px', marginBottom: '8px' }}>🏆</div>
            <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', textAlign: 'center' }}>{t.allLevels}</div>
            <button className="btn-primary" onClick={() => { stateRef.current = buildLevel(0); syncUi(stateRef.current); }}>▶ Nivel 1</button>
          </Overlay>
        )}
      </div>

      <p style={{ marginTop: '12px', fontSize: '13px', opacity: 0.45, textAlign: 'center' }}>{t.hint}</p>
    </div>
  );
}

function Overlay({ color, children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: color,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(2px)',
    }}>
      {children}
    </div>
  );
}

// ─── Draw helpers ─────────────────────────────────────────────────────────────
function drawBird(ctx, type, x, y, r, dragging) {
  ctx.save();
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.9, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  grad.addColorStop(0, '#ff8888');
  grad.addColorStop(1, '#cc2222');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // Angry brow
  ctx.strokeStyle = '#330000';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.5, y - r * 0.2);
  ctx.lineTo(x - r * 0.1, y - r * 0.45);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + r * 0.5, y - r * 0.2);
  ctx.lineTo(x + r * 0.1, y - r * 0.45);
  ctx.stroke();

  // Eyes
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(x - r * 0.25, y - r * 0.1, r * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.25, y - r * 0.1, r * 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(x - r * 0.22, y - r * 0.08, r * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.28, y - r * 0.08, r * 0.1, 0, Math.PI * 2); ctx.fill();

  // Beak
  ctx.fillStyle = '#ffa020';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.15, y + r * 0.1);
  ctx.lineTo(x + r * 0.15, y + r * 0.1);
  ctx.lineTo(x, y + r * 0.35);
  ctx.closePath(); ctx.fill();

  // Top feathers
  ctx.fillStyle = '#cc2222';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.15, y - r * 0.9);
  ctx.lineTo(x, y - r * 1.3);
  ctx.lineTo(x + r * 0.15, y - r * 0.9);
  ctx.fill();

  if (dragging) {
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

function drawPig(ctx, x, y, r) {
  ctx.save();
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.9, r * 0.85, r * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  grad.addColorStop(0, '#90e050');
  grad.addColorStop(1, '#3a8020');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

  // Snout
  ctx.fillStyle = '#60c030';
  ctx.beginPath(); ctx.ellipse(x, y + r * 0.3, r * 0.45, r * 0.32, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a5010';
  ctx.beginPath(); ctx.ellipse(x - r * 0.15, y + r * 0.3, r * 0.1, r * 0.12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + r * 0.15, y + r * 0.3, r * 0.1, r * 0.12, 0, 0, Math.PI * 2); ctx.fill();

  // Eyes
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.3, y - r * 0.2, r * 0.22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(x - r * 0.27, y - r * 0.18, r * 0.11, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.33, y - r * 0.18, r * 0.11, 0, Math.PI * 2); ctx.fill();

  // Ears
  ctx.fillStyle = '#3a8020';
  ctx.beginPath();
  ctx.ellipse(x - r * 0.75, y - r * 0.7, r * 0.2, r * 0.28, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + r * 0.75, y - r * 0.7, r * 0.2, r * 0.28, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
