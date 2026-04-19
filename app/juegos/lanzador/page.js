'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useT } from '../../../components/LocaleProvider';

const CW = 800, CH = 500;

const LEVELS = [
  {
    birds: 3,
    boxes: [
      { x: 600, y: 430, w: 40, h: 40, type: 'wood' },
      { x: 600, y: 390, w: 40, h: 40, type: 'wood' },
      { x: 650, y: 430, w: 40, h: 40, type: 'wood' },
    ],
    pigs: [{ x: 625, y: 360 }],
  },
  {
    birds: 3,
    boxes: [
      { x: 560, y: 430, w: 40, h: 40, type: 'wood' },
      { x: 560, y: 390, w: 40, h: 40, type: 'wood' },
      { x: 650, y: 430, w: 40, h: 40, type: 'wood' },
      { x: 650, y: 390, w: 40, h: 40, type: 'wood' },
    ],
    pigs: [{ x: 560, y: 355 }, { x: 650, y: 355 }],
  },
  {
    birds: 4,
    boxes: [
      { x: 580, y: 430, w: 20, h: 80, type: 'wood' },
      { x: 660, y: 430, w: 20, h: 80, type: 'wood' },
      { x: 620, y: 350, w: 100, h: 20, type: 'stone' },
      { x: 620, y: 430, w: 40, h: 40, type: 'wood' },
    ],
    pigs: [{ x: 620, y: 325 }],
  },
  {
    birds: 4,
    boxes: [
      { x: 560, y: 430, w: 40, h: 40, type: 'stone' },
      { x: 600, y: 430, w: 40, h: 40, type: 'stone' },
      { x: 640, y: 430, w: 40, h: 40, type: 'stone' },
      { x: 580, y: 390, w: 40, h: 40, type: 'wood' },
      { x: 620, y: 390, w: 40, h: 40, type: 'wood' },
      { x: 600, y: 350, w: 40, h: 40, type: 'ice' },
    ],
    pigs: [{ x: 600, y: 315 }],
  },
  {
    birds: 4,
    boxes: [
      { x: 540, y: 430, w: 20, h: 80, type: 'stone' },
      { x: 600, y: 430, w: 20, h: 80, type: 'stone' },
      { x: 570, y: 350, w: 80, h: 20, type: 'stone' },
      { x: 660, y: 430, w: 20, h: 80, type: 'stone' },
      { x: 720, y: 430, w: 20, h: 80, type: 'stone' },
      { x: 690, y: 350, w: 80, h: 20, type: 'stone' },
    ],
    pigs: [{ x: 570, y: 325 }, { x: 690, y: 325 }],
  },
  {
    birds: 4,
    boxes: [
      { x: 580, y: 430, w: 40, h: 120, type: 'wood' },
      { x: 620, y: 430, w: 40, h: 40, type: 'ice' },
      { x: 660, y: 430, w: 40, h: 80, type: 'stone' },
      { x: 620, y: 390, w: 40, h: 40, type: 'ice' },
      { x: 660, y: 350, w: 40, h: 40, type: 'wood' },
    ],
    pigs: [{ x: 580, y: 305 }, { x: 660, y: 315 }],
  },
  {
    birds: 5,
    boxes: [
      { x: 560, y: 430, w: 20, h: 100, type: 'stone' },
      { x: 700, y: 430, w: 20, h: 100, type: 'stone' },
      { x: 630, y: 380, w: 160, h: 20, type: 'stone' },
      { x: 590, y: 430, w: 20, h: 60, type: 'wood' },
      { x: 670, y: 430, w: 20, h: 60, type: 'wood' },
      { x: 630, y: 360, w: 60, h: 20, type: 'wood' },
    ],
    pigs: [{ x: 590, y: 375 }, { x: 670, y: 375 }, { x: 630, y: 335 }],
  },
  {
    birds: 5,
    boxes: [
      { x: 560, y: 430, w: 40, h: 40, type: 'stone' },
      { x: 600, y: 430, w: 40, h: 40, type: 'wood' },
      { x: 640, y: 430, w: 40, h: 40, type: 'stone' },
      { x: 680, y: 430, w: 40, h: 40, type: 'wood' },
      { x: 560, y: 390, w: 40, h: 40, type: 'wood' },
      { x: 640, y: 390, w: 40, h: 40, type: 'wood' },
      { x: 580, y: 350, w: 80, h: 20, type: 'stone' },
      { x: 660, y: 350, w: 40, h: 20, type: 'ice' },
    ],
    pigs: [{ x: 580, y: 325 }, { x: 660, y: 325 }, { x: 620, y: 430 }],
  },
  {
    birds: 5,
    boxes: [
      { x: 540, y: 430, w: 20, h: 120, type: 'stone' },
      { x: 620, y: 430, w: 20, h: 120, type: 'stone' },
      { x: 700, y: 430, w: 20, h: 120, type: 'stone' },
      { x: 580, y: 310, w: 100, h: 20, type: 'stone' },
      { x: 660, y: 310, w: 100, h: 20, type: 'stone' },
      { x: 580, y: 430, w: 20, h: 70, type: 'wood' },
      { x: 660, y: 430, w: 20, h: 70, type: 'wood' },
      { x: 580, y: 290, w: 20, h: 40, type: 'ice' },
      { x: 660, y: 290, w: 20, h: 40, type: 'ice' },
    ],
    pigs: [{ x: 580, y: 365 }, { x: 660, y: 365 }, { x: 580, y: 265 }, { x: 660, y: 265 }],
  },
  {
    birds: 6,
    boxes: [
      { x: 540, y: 430, w: 20, h: 100, type: 'stone' },
      { x: 600, y: 430, w: 20, h: 100, type: 'stone' },
      { x: 660, y: 430, w: 20, h: 100, type: 'stone' },
      { x: 720, y: 430, w: 20, h: 100, type: 'stone' },
      { x: 570, y: 330, w: 80, h: 20, type: 'stone' },
      { x: 690, y: 330, w: 80, h: 20, type: 'stone' },
      { x: 630, y: 330, w: 80, h: 20, type: 'stone' },
      { x: 570, y: 310, w: 80, h: 20, type: 'wood' },
      { x: 690, y: 310, w: 80, h: 20, type: 'wood' },
      { x: 630, y: 270, w: 80, h: 20, type: 'stone' },
      { x: 570, y: 430, w: 20, h: 60, type: 'wood' },
      { x: 690, y: 430, w: 20, h: 60, type: 'wood' },
    ],
    pigs: [{ x: 570, y: 385 }, { x: 690, y: 385 }, { x: 630, y: 385 }, { x: 600, y: 285 }, { x: 660, y: 285 }],
  },
];

export default function LanzadorPage() {
  const t = useT('lanzador');
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const rafRef = useRef(null);
  const gameRef = useRef(null);
  const [ui, setUi] = useState({ phase: 'aim', level: 1, score: 0, birds: 0 });

  const syncUi = useCallback(() => {
    const gs = gameRef.current;
    if (!gs) return;
    setUi({ phase: gs.phase, level: gs.levelIdx + 1, score: gs.score, birds: gs.birdsLeft });
  }, []);

  const loadLevel = useCallback(async (idx) => {
    const Matter = (await import('matter-js')).default;
    const { Engine, Render, Runner, Bodies, Body, Body: BodyM, Composite, Events, Mouse, MouseConstraint, Vector } = Matter;

    if (engineRef.current) {
      Composite.clear(engineRef.current.world, false);
      Engine.clear(engineRef.current);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = Engine.create({ gravity: { y: 1.5 } });
    engineRef.current = engine;
    const world = engine.world;

    const lvl = LEVELS[idx];

    // Ground and walls
    const ground = Bodies.rectangle(CW / 2, 470, CW, 20, { isStatic: true, label: 'ground', friction: 0.8, restitution: 0.1 });
    const wallL = Bodies.rectangle(-10, CH / 2, 20, CH, { isStatic: true, label: 'wall' });
    const wallR = Bodies.rectangle(CW + 10, CH / 2, 20, CH, { isStatic: true, label: 'wall' });
    Composite.add(world, [ground, wallL, wallR]);

    const COLORS = { wood: '#d4892a', stone: '#8a9ab0', ice: '#c8f0ff' };
    const HP = { wood: 3, stone: 8, ice: 2 };

    // Blocks
    const blocks = lvl.boxes.map(b => {
      const body = Bodies.rectangle(b.x, b.y, b.w, b.h, {
        isStatic: false,
        label: 'block_' + b.type,
        friction: 0.6,
        restitution: 0.2,
        density: b.type === 'stone' ? 0.004 : b.type === 'ice' ? 0.001 : 0.002,
        render: { fillStyle: COLORS[b.type] },
      });
      body.hp = HP[b.type];
      body.maxHp = HP[b.type];
      body.blockType = b.type;
      return body;
    });

    // Pigs
    const pigs = lvl.pigs.map(p => {
      const body = Bodies.circle(p.x, p.y, 18, {
        label: 'pig',
        friction: 0.5,
        restitution: 0.3,
        density: 0.003,
      });
      body.hp = 3;
      return body;
    });

    Composite.add(world, [...blocks, ...pigs]);

    const gs = {
      engine, world, Matter,
      levelIdx: idx,
      score: 0,
      birdsLeft: lvl.birds,
      blocks,
      pigs,
      activeBird: null,
      drag: false,
      dragX: 160, dragY: 330,
      phase: 'aim',
      particles: [],
    };
    gameRef.current = gs;

    // Collision events for damage
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const speed = Vector.magnitude(Vector.sub(bodyA.velocity, bodyB.velocity));
        if (speed < 3) return;

        const dmg = Math.floor(speed * 0.8);

        if (bodyA.label === 'bird' || bodyB.label === 'bird') {
          const bird = bodyA.label === 'bird' ? bodyA : bodyB;
          const other = bodyA.label === 'bird' ? bodyB : bodyA;

          if (other.label && other.label.startsWith('block_')) {
            other.hp -= dmg;
            gs.score += dmg * 15;
            spawnParticles(gs, other.position.x, other.position.y, COLORS[other.blockType], 8);
            if (other.hp <= 0) {
              gs.score += 100;
              other.toRemove = true;
              spawnParticles(gs, other.position.x, other.position.y, COLORS[other.blockType], 20);
            }
          }
          if (other.label === 'pig') {
            other.hp -= dmg;
            gs.score += 150;
            spawnParticles(gs, other.position.x, other.position.y, '#7dc843', 10);
            if (other.hp <= 0) {
              gs.score += 300;
              other.toRemove = true;
              spawnParticles(gs, other.position.x, other.position.y, '#4a9e2a', 25);
            }
          }
        }

        if (bodyA.label && bodyA.label.startsWith('block_') && bodyB.label && bodyB.label.startsWith('block_')) {
          if (speed > 4) {
            const dmgB = Math.floor(speed * 0.5);
            bodyA.hp -= dmgB;
            bodyB.hp -= dmgB;
            if (bodyA.hp <= 0) { bodyA.toRemove = true; spawnParticles(gs, bodyA.position.x, bodyA.position.y, COLORS[bodyA.blockType], 12); gs.score += 80; }
            if (bodyB.hp <= 0) { bodyB.toRemove = true; spawnParticles(gs, bodyB.position.x, bodyB.position.y, COLORS[bodyB.blockType], 12); gs.score += 80; }
          }
        }

        if ((bodyA.label === 'pig' || bodyB.label === 'pig') && speed > 3) {
          const pig = bodyA.label === 'pig' ? bodyA : bodyB;
          pig.hp -= Math.floor(speed * 0.6);
          spawnParticles(gs, pig.position.x, pig.position.y, '#7dc843', 6);
          if (pig.hp <= 0) { pig.toRemove = true; spawnParticles(gs, pig.position.x, pig.position.y, '#4a9e2a', 20); gs.score += 400; }
        }
      });
    });

    syncUi();
  }, [syncUi]);

  function spawnParticles(gs, x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = Math.random() * 5 + 1;
      gs.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, r: Math.random() * 4 + 1, color, life: 30 + Math.random() * 20 });
    }
  }

  const render = useCallback(() => {
    const gs = gameRef.current;
    const canvas = canvasRef.current;
    if (!gs || !canvas) return;

    const ctx = canvas.getContext('2d');
    const { engine, blocks, pigs, particles } = gs;

    // Remove dead bodies
    [...blocks, ...pigs].forEach(b => {
      if (b.toRemove) {
        const Matter = gs.Matter;
        Matter.Composite.remove(engine.world, b);
        b.toRemove = false;
        b.removed = true;
      }
    });

    // Advance physics
    if (gs.phase !== 'win' && gs.phase !== 'lose') {
      gs.Matter.Engine.update(engine, 1000 / 60);
    }

    // Check outcomes
    if (gs.phase === 'flying' || gs.phase === 'aim') {
      const pigsAlive = pigs.filter(p => !p.removed);
      if (pigsAlive.length === 0) {
        gs.phase = 'win';
        syncUi();
      } else if (gs.birdsLeft <= 0 && !gs.activeBird && gs.phase !== 'aim') {
        gs.phase = 'lose';
        syncUi();
      }
      if (gs.activeBird) {
        const bPos = gs.activeBird.position;
        if (bPos.x > CW + 100 || bPos.y > CH + 100 || (gs.birdTimer && gs.birdTimer++ > 300)) {
          gs.Matter.Composite.remove(engine.world, gs.activeBird);
          gs.activeBird = null;
          gs.birdTimer = 0;
          if (pigs.filter(p => !p.removed).length === 0) { gs.phase = 'win'; }
          else if (gs.birdsLeft <= 0) { gs.phase = 'lose'; }
          else { gs.phase = 'aim'; gs.dragX = 160; gs.dragY = 330; }
          syncUi();
        }
      }
    }

    // ── Draw ──
    ctx.clearRect(0, 0, CW, CH);

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, CH);
    sky.addColorStop(0, '#162341');
    sky.addColorStop(1, '#3a7abf');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CW, CH);

    // Clouds
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    [[80, 60, 70, 22], [250, 45, 90, 26], [470, 75, 65, 20], [680, 55, 80, 24]].forEach(([x, y, rw, rh]) => {
      ctx.beginPath(); ctx.ellipse(x, y, rw, rh, 0, 0, Math.PI * 2); ctx.fill();
    });

    // Hills
    ctx.fillStyle = 'rgba(30,55,80,0.6)';
    ctx.beginPath(); ctx.moveTo(0, 380);
    ctx.quadraticCurveTo(150, 300, 300, 360);
    ctx.quadraticCurveTo(450, 420, 600, 350);
    ctx.quadraticCurveTo(720, 300, 800, 340);
    ctx.lineTo(800, 460); ctx.lineTo(0, 460); ctx.closePath(); ctx.fill();

    // Ground
    const g = ctx.createLinearGradient(0, 460, 0, CH);
    g.addColorStop(0, '#3a7d44');
    g.addColorStop(0.4, '#2d5e33');
    g.addColorStop(1, '#1a3a1e');
    ctx.fillStyle = g;
    ctx.fillRect(0, 460, CW, CH - 460);
    ctx.strokeStyle = '#5bc050'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 460); ctx.lineTo(CW, 460); ctx.stroke();

    // Slingshot
    ctx.strokeStyle = '#4a2a08'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(160, 460); ctx.lineTo(160, 345); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(160, 345); ctx.lineTo(144, 320); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(160, 345); ctx.lineTo(176, 320); ctx.stroke();

    // Elastic bands
    const bx = gs.phase === 'aim' ? gs.dragX : 160;
    const by = gs.phase === 'aim' ? gs.dragY : 330;
    ctx.strokeStyle = '#9a5a30'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(144, 320); ctx.lineTo(bx, by); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(176, 320); ctx.lineTo(bx, by); ctx.stroke();

    // Trajectory preview
    if (gs.phase === 'aim' && gs.drag) {
      const vx = (160 - gs.dragX) * 0.22;
      const vy = (330 - gs.dragY) * 0.22;
      ctx.fillStyle = 'rgba(255,255,255,0.38)';
      for (let i = 1; i <= 24; i++) {
        const tt = i * 3.5;
        const px = bx + vx * tt;
        const py = by + vy * tt + 0.5 * 0.015 * tt * tt * 60;
        if (py > 460 || px > CW) break;
        const r = 3.2 - i * 0.1;
        if (r < 0.5) break;
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Draw blocks
    const blockColors = { wood: '#d4892a', stone: '#8a9ab0', ice: '#c8f0ff' };
    const blockStrokes = { wood: '#8b5a14', stone: '#4a6070', ice: '#48b8d8' };
    blocks.forEach(b => {
      if (b.removed) return;
      const pos = b.position;
      const ang = b.angle;
      const bdef = LEVELS[gs.levelIdx].boxes.find((_, i) => blocks[i] === b);
      const w = bdef ? bdef.w : 40, h = bdef ? bdef.h : 40;
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(ang);
      const grad = ctx.createLinearGradient(-w / 2, -h / 2, -w / 2, h / 2);
      grad.addColorStop(0, blockColors[b.blockType]);
      grad.addColorStop(1, blockStrokes[b.blockType]);
      ctx.fillStyle = grad;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = blockStrokes[b.blockType];
      ctx.lineWidth = 2;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      // cracks if damaged
      if (b.hp < b.maxHp * 0.7) {
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-w * 0.1, -h * 0.2); ctx.lineTo(w * 0.1, h * 0.3);
        ctx.moveTo(-w * 0.15, h * 0.1); ctx.lineTo(w * 0.2, -h * 0.1);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Draw pigs
    pigs.forEach(p => {
      if (p.removed) return;
      const pos = p.position;
      ctx.save();
      ctx.translate(pos.x, pos.y);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.ellipse(2, 18, 15, 5, 0, 0, Math.PI * 2); ctx.fill();

      // Body
      const pg = ctx.createRadialGradient(-5, -5, 2, 0, 0, 18);
      pg.addColorStop(0, '#a8e860'); pg.addColorStop(1, '#2a6010');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill();

      // Ears
      ctx.fillStyle = '#3a8020';
      ctx.beginPath(); ctx.moveTo(-16, -8); ctx.lineTo(-10, -22); ctx.lineTo(-4, -8); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(16, -8); ctx.lineTo(10, -22); ctx.lineTo(4, -8); ctx.closePath(); ctx.fill();

      // Snout
      ctx.fillStyle = '#70c038';
      ctx.beginPath(); ctx.ellipse(0, 6, 9, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a5010';
      ctx.beginPath(); ctx.ellipse(-3, 6, 2, 2.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(3, 6, 2, 2.5, 0, 0, Math.PI * 2); ctx.fill();

      // Eyes
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(-6, -5, 5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(6, -5, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath(); ctx.arc(-5, -4, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(7, -4, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(-4, -5, 0.8, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(8, -5, 0.8, 0, Math.PI * 2); ctx.fill();

      // HP bar
      if (p.hp < 3) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-16, -28, 32, 5);
        ctx.fillStyle = p.hp > 1.5 ? '#4aee44' : '#ee4444';
        ctx.fillRect(-16, -28, 32 * (p.hp / 3), 5);
      }

      ctx.restore();
    });

    // Draw active bird
    if (gs.activeBird) {
      drawBirdAt(ctx, gs.activeBird.position.x, gs.activeBird.position.y, 15);
    }

    // Bird in sling
    if (gs.phase === 'aim') {
      drawBirdAt(ctx, gs.dragX, gs.dragY, 15);
    }

    // Queued birds
    for (let i = 0; i < gs.birdsLeft - (gs.phase === 'aim' ? 1 : 0); i++) {
      drawBirdAt(ctx, 100 - i * 28, 445, 11);
    }

    // Particles
    gs.particles = gs.particles.filter(p => p.life > 0);
    gs.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life--;
      ctx.globalAlpha = p.life / 50;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;

    rafRef.current = requestAnimationFrame(render);
  }, [syncUi]);

  useEffect(() => {
    loadLevel(0).then(() => {
      rafRef.current = requestAnimationFrame(render);
    });
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (engineRef.current) {
        import('matter-js').then(({ default: Matter }) => {
          Matter.Engine.clear(engineRef.current);
        });
      }
    };
  }, [loadLevel, render]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CW / rect.width, scaleY = CH / rect.height;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return [(cx - rect.left) * scaleX, (cy - rect.top) * scaleY];
  };

  const onDown = (e) => {
    const gs = gameRef.current;
    if (!gs || gs.phase !== 'aim') return;
    const [x, y] = getPos(e);
    if ((x - gs.dragX) ** 2 + (y - gs.dragY) ** 2 < 900) gs.drag = true;
  };

  const onMove = (e) => {
    const gs = gameRef.current;
    if (!gs || !gs.drag) return;
    if (e.preventDefault) e.preventDefault();
    const [x, y] = getPos(e);
    const dx = x - 160, dy = y - 330;
    const d = Math.hypot(dx, dy);
    const MAX = 70;
    if (d > MAX) { gs.dragX = 160 + dx / d * MAX; gs.dragY = 330 + dy / d * MAX; }
    else { gs.dragX = x; gs.dragY = y; }
  };

  const onUp = async () => {
    const gs = gameRef.current;
    if (!gs || !gs.drag) return;
    gs.drag = false;
    const vx = (160 - gs.dragX) * 0.22;
    const vy = (330 - gs.dragY) * 0.22;
    if (Math.abs(vx) < 1 && Math.abs(vy) < 1) { gs.dragX = 160; gs.dragY = 330; return; }

    const Matter = gs.Matter;
    const bird = Matter.Bodies.circle(gs.dragX, gs.dragY, 15, {
      label: 'bird',
      restitution: 0.5,
      friction: 0.3,
      density: 0.005,
    });
    Matter.Body.setVelocity(bird, { x: vx * 60 / 60, y: vy * 60 / 60 });
    Matter.Body.applyForce(bird, bird.position, { x: vx * 0.05, y: vy * 0.05 });
    Matter.Composite.add(gs.world, bird);
    gs.activeBird = bird;
    gs.birdsLeft--;
    gs.birdTimer = 0;
    gs.phase = 'flying';
    syncUi();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const opts = { passive: false };
    canvas.addEventListener('touchstart', onDown, opts);
    canvas.addEventListener('touchmove', onMove, opts);
    canvas.addEventListener('touchend', onUp, opts);
    return () => {
      canvas.removeEventListener('touchstart', onDown, opts);
      canvas.removeEventListener('touchmove', onMove, opts);
      canvas.removeEventListener('touchend', onUp, opts);
    };
  });

  const handleNext = () => {
    const gs = gameRef.current;
    const next = gs.levelIdx + 1;
    cancelAnimationFrame(rafRef.current);
    if (next >= LEVELS.length) {
      loadLevel(0).then(() => { gameRef.current.phase = 'allDone'; syncUi(); rafRef.current = requestAnimationFrame(render); });
    } else {
      loadLevel(next).then(() => { rafRef.current = requestAnimationFrame(render); });
    }
  };

  const handleRetry = () => {
    const gs = gameRef.current;
    cancelAnimationFrame(rafRef.current);
    loadLevel(gs.levelIdx).then(() => { rafRef.current = requestAnimationFrame(render); });
  };

  return (
    <div className="tool-page" style={{ maxWidth: '860px' }}>
      <div className="tool-header">
        <h1><span className="highlight">{t.title}</span></h1>
        <p className="subtitle">{t.subtitle}</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', fontSize: '14px', fontWeight: 600 }}>
        <span style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '8px', padding: '6px 14px' }}>
          {t.level} {ui.level}/{LEVELS.length}
        </span>
        <span style={{ background: 'rgba(255,200,50,0.1)', border: '1px solid rgba(255,200,50,0.3)', borderRadius: '8px', padding: '6px 14px' }}>
          {t.score}: {ui.score}
        </span>
        <span style={{ background: 'rgba(100,220,100,0.08)', border: '1px solid rgba(100,220,100,0.25)', borderRadius: '8px', padding: '6px 14px' }}>
          🐦 {ui.birds}
        </span>
      </div>

      <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
        <canvas
          ref={canvasRef}
          width={CW}
          height={CH}
          style={{ display: 'block', width: '100%', cursor: ui.phase === 'aim' ? 'grab' : 'default', touchAction: 'none' }}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={() => { const gs = gameRef.current; if (gs) gs.drag = false; }}
        />

        {ui.phase === 'win' && (
          <Overlay color="rgba(40,160,70,0.93)">
            <div style={{ fontSize: 48 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 800, margin: '8px 0 16px' }}>{t.levelComplete}</div>
            <button className="btn-primary" onClick={handleNext}>{t.nextLevel}</button>
          </Overlay>
        )}
        {ui.phase === 'lose' && (
          <Overlay color="rgba(160,40,40,0.93)">
            <div style={{ fontSize: 48 }}>💥</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{t.gameOver}</div>
            <div style={{ fontSize: 13, opacity: 0.8, margin: '4px 0 16px' }}>{t.gameOverSub}</div>
            <button className="btn-primary" onClick={handleRetry}>{t.restart}</button>
          </Overlay>
        )}
        {ui.phase === 'allDone' && (
          <Overlay color="rgba(80,40,180,0.93)">
            <div style={{ fontSize: 56 }}>🏆</div>
            <div style={{ fontSize: 20, fontWeight: 800, margin: '8px 0 16px', textAlign: 'center' }}>{t.allLevels}</div>
            <button className="btn-primary" onClick={handleRetry}>▶ Nivel 1</button>
          </Overlay>
        )}
      </div>

      <p style={{ marginTop: 12, fontSize: 13, opacity: 0.45, textAlign: 'center' }}>{t.hint}</p>
    </div>
  );
}

function Overlay({ color, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: color, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}>
      {children}
    </div>
  );
}

function drawBirdAt(ctx, x, y, r) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(x, y + r * 0.9, r * 0.85, r * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, '#ff9090'); g.addColorStop(0.7, '#d62a2a'); g.addColorStop(1, '#8a1010');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a81818';
  ctx.beginPath(); ctx.moveTo(x - r * 0.2, y - r * 0.85); ctx.quadraticCurveTo(x, y - r * 1.45, x + r * 0.2, y - r * 0.85); ctx.fill();
  ctx.fillStyle = 'white';
  ctx.beginPath(); ctx.arc(x - r * 0.28, y - r * 0.12, r * 0.26, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.28, y - r * 0.12, r * 0.26, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(x - r * 0.22, y - r * 0.08, r * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * 0.34, y - r * 0.08, r * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#220000'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - r * 0.55, y - r * 0.35); ctx.lineTo(x - r * 0.1, y - r * 0.52); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + r * 0.55, y - r * 0.35); ctx.lineTo(x + r * 0.1, y - r * 0.52); ctx.stroke();
  ctx.fillStyle = '#ffa020';
  ctx.beginPath(); ctx.moveTo(x - r * 0.18, y + r * 0.15); ctx.lineTo(x + r * 0.18, y + r * 0.15); ctx.lineTo(x, y + r * 0.48); ctx.closePath(); ctx.fill();
  ctx.restore();
}
