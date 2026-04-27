'use client';
import { useEffect, useRef, useState, useCallback, memo } from 'react';

const CV = {
  name: 'César Cabanas',
  title: 'Salesforce Developer & Full Stack',
  about: 'Desarrollador con más de 3 años de experiencia en Salesforce, especializado en Apex y Lightning Web Components. Versátil en el stack completo: Python, Java, React, Next.js, Docker.',
  experience: [
    { company: 'Inetum', role: 'Desarrollador Salesforce', period: 'Marzo 2023 – Actualidad', current: true, desc: 'Soluciones Salesforce para clientes de gran cuenta. Flow Builder, Apex, Lightning Web Components.', color: '#6c63ff' },
    { company: 'EnkoTeams', role: 'Soporte Salesforce & Desarrollo', period: 'Marzo 2022 – Junio 2022', current: false, desc: 'Soporte técnico Salesforce y herramientas internas para optimizar procesos.', color: '#a855f7' },
    { company: 'OnRetrieval', role: 'Técnico de Recuperación de Datos', period: 'Veranos 2017 – 2020', current: false, desc: 'Recuperación de datos en laboratorio especializado, sistemas de almacenamiento dañados.', color: '#3b82f6' },
  ],
  skills: [
    { name: 'Salesforce', level: 80 }, { name: 'Python', level: 80 },
    { name: 'Java', level: 70 }, { name: 'SQL', level: 70 },
    { name: 'React / Next.js', level: 60 }, { name: 'Docker / CI-CD', level: 60 },
    { name: 'JavaScript', level: 60 }, { name: 'PyTorch / TF', level: 25 },
  ],
  projects: [
    { name: 'DeployFast', icon: '🚀', tags: ['PaaS', 'Docker', 'DevOps'], link: 'https://deployfast.app', desc: 'Plataforma PaaS de despliegue continuo desde GitHub.' },
    { name: 'WebPolimorfica', icon: '🌐', tags: ['Next.js', 'Docker'], link: 'https://github.com/zeuscabanas/WebPolimorfica', desc: 'Portfolio personal con juegos y pipeline CI/CD.' },
    { name: 'Uri Project', icon: '🎵', tags: ['Full Stack', 'Web'], desc: 'Plataforma para gestionar servicios de música en locales.' },
    { name: 'RatónArtificial', icon: '🤖', tags: ['Python', 'IA'], link: 'https://github.com/zeuscabanas/RatonArtificial', desc: 'Automatización con visión por computador.' },
    { name: 'Visión Artificial', icon: '👁', tags: ['Python', 'Computer Vision'], desc: 'Modelos de reconocimiento de imágenes con PyTorch.' },
  ],
  stats: [
    { val: 3, suffix: '+', label: 'Años exp.' },
    { val: 12, suffix: '+', label: 'Tecnologías' },
    { val: 3, suffix: '', label: 'Empresas' },
    { val: 5, suffix: '+', label: 'Proyectos' },
  ],
};

/* ── Particle canvas ─────────────────────────────────────────────── */
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random(),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14,165,233,${p.a * 0.6})`;
        ctx.fill();
      });
      pts.forEach((a, i) => {
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(14,165,233,${(1 - d / 100) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

/* ── Cursor glow trail ───────────────────────────────────────────── */
function CursorTrail() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const move = e => { el.style.left = e.clientX + 'px'; el.style.top = e.clientY + 'px'; };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return (
    <div ref={ref} style={{
      position: 'fixed', width: 300, height: 300, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)',
      transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 1,
      transition: 'left 0.15s ease, top 0.15s ease',
    }} />
  );
}

/* ── Arc Reactor helpers ─────────────────────────────────────────── */
const DEG = Math.PI / 180;
const pt = (cx, cy, r, deg) => [cx + r * Math.cos(deg * DEG), cy + r * Math.sin(deg * DEG)];
const vanePts = (cx, cy, r1, r2, ang, w1, w2) =>
  [pt(cx,cy,r1,ang-w1), pt(cx,cy,r1,ang+w1), pt(cx,cy,r2,ang+w2), pt(cx,cy,r2,ang-w2)]
    .map(([x,y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const triPts = (cx, cy, rTip, rBase, ang) =>
  [pt(cx,cy,rTip,ang), pt(cx,cy,rBase,ang+115), pt(cx,cy,rBase,ang-115)]
    .map(([x,y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/* ── True 3D Arc Reactor ─────────────────────────────────────────── */
function Reactor3D({ mouseX, mouseY, size = 360, idPrefix = 'r' }) {
  const wrapRef = useRef(null);
  const vanesRef = useRef(null);
  const triRef = useRef(null);
  const glowRef = useRef(null);
  const beamRef = useRef(null);
  const rafRef = useRef(null);
  const burstRef = useRef(null);

  // RAF-driven rotations — no anime.js needed
  useEffect(() => {
    let start = null;
    let burstScale = 1, burstOpacity = 0.12;
    burstRef.current = { scale: 1, op: 0.12, active: false, startT: 0 };

    const tick = (ts) => {
      if (!start) start = ts;
      const t = ts - start;

      if (vanesRef.current)
        vanesRef.current.setAttribute('transform', `rotate(${(t / 28000 * 360) % 360} 150 150)`);
      if (triRef.current)
        triRef.current.setAttribute('transform', `rotate(${-(t / 18000 * 360) % 360} 150 150)`);

      // pulsing glow
      const pulse = 0.1 + 0.08 * Math.sin(t / 1400);
      if (glowRef.current) glowRef.current.setAttribute('opacity', pulse.toFixed(3));

      // burst decay
      const b = burstRef.current;
      if (b.active) {
        const bp = Math.min((ts - b.startT) / 600, 1);
        burstScale = 1 + 1.8 * bp;
        burstOpacity = 0.7 * (1 - bp);
        if (burstOpacity <= 0) b.active = false;
        if (glowRef.current) {
          glowRef.current.style.transform = `scale(${burstScale})`;
          glowRef.current.setAttribute('opacity', burstOpacity.toFixed(3));
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // 3D tilt from mouse
  const rotX = (mouseY - 0.5) * 48;
  const rotY = (mouseX - 0.5) * -48;

  // Beam toward cursor
  useEffect(() => {
    if (!beamRef.current) return;
    const angle = Math.atan2(mouseY - 0.5, mouseX - 0.5) * 180 / Math.PI;
    const dist = Math.hypot(mouseX - 0.5, mouseY - 0.5);
    beamRef.current.style.transform = `rotate(${angle}deg)`;
    beamRef.current.style.opacity = Math.min(dist * 3, 0.9);
  }, [mouseX, mouseY]);

  const handleClick = () => {
    if (burstRef.current) {
      burstRef.current.active = true;
      burstRef.current.startT = performance.now();
    }
  };

  const C = 150; // center
  const p = idPrefix;

  return (
    <div style={{ position: 'relative', width: size, height: size, perspective: 1200, cursor: 'pointer' }}
      onClick={handleClick}>
      <div ref={wrapRef} style={{
        width: '100%', height: '100%', position: 'relative',
        transformStyle: 'preserve-3d',
        transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
        transition: 'transform 0.12s cubic-bezier(.2,.8,.3,1)',
      }}>
        {/* ── LAYER: background glow ── */}
        <div style={{ position: 'absolute', inset: 0, transform: 'translateZ(-160px)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <svg viewBox="0 0 300 300" width="100%" height="100%">
            <defs>
              <radialGradient id={`${p}-bg`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle ref={glowRef} cx={C} cy={C} r="130" fill={`url(#${p}-bg)`} opacity="0.12"
              style={{ transformOrigin: '150px 150px' }} />
          </svg>
        </div>

        {/* ── LAYER: outer housing ring ── */}
        <div style={{ position: 'absolute', inset: 0, transform: 'translateZ(-80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <svg viewBox="0 0 300 300" width="100%" height="100%">
            <defs>
              <filter id={`${p}-f1`}><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            {/* dark housing fill */}
            <circle cx={C} cy={C} r="128" fill="#020d1a" />
            {/* thick outer rim */}
            <circle cx={C} cy={C} r="128" fill="none" stroke="#0c3d5e" strokeWidth="10" />
            {/* bright outer edge */}
            <circle cx={C} cy={C} r="128" fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.7" filter={`url(#${p}-f1)`} />
            {/* 6 bolt nodes on outer ring */}
            {[0,60,120,180,240,300].map(a => {
              const [x,y] = pt(C,C,128,a);
              return <circle key={a} cx={x.toFixed(1)} cy={y.toFixed(1)} r="4.5" fill="#0ea5e9" filter={`url(#${p}-f1)`} />;
            })}
          </svg>
        </div>

        {/* ── LAYER: rotating vanes (turbine) ── */}
        <div style={{ position: 'absolute', inset: 0, transform: 'translateZ(-20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <svg viewBox="0 0 300 300" width="100%" height="100%">
            <defs>
              <filter id={`${p}-f2`}><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <g ref={vanesRef} style={{ transformOrigin: '150px 150px' }}>
              {[0,45,90,135,180,225,270,315].map(a => (
                <polygon key={a}
                  points={vanePts(C, C, 65, 112, a, 14, 9)}
                  fill="rgba(14,165,233,0.18)"
                  stroke="#38bdf8"
                  strokeWidth="0.8"
                  filter={`url(#${p}-f2)`}
                />
              ))}
              {/* vane separator lines */}
              {[0,45,90,135,180,225,270,315].map(a => {
                const [x1,y1] = pt(C,C,65,a);
                const [x2,y2] = pt(C,C,112,a);
                return <line key={a} x1={x1.toFixed(1)} y1={y1.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke="#0ea5e9" strokeWidth="0.5" strokeOpacity="0.4" />;
              })}
            </g>
            {/* energy ring between vanes and core */}
            <circle cx={C} cy={C} r="65" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeOpacity="0.8" filter={`url(#${p}-f2)`} />
            {[30,90,150,210,270,330].map(a => {
              const [x,y] = pt(C,C,65,a);
              return <circle key={a} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3.5" fill="#7dd3fc" filter={`url(#${p}-f2)`} />;
            })}
          </svg>
        </div>

        {/* ── LAYER: inner counter-rotating triangles ── */}
        <div style={{ position: 'absolute', inset: 0, transform: 'translateZ(40px)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <svg viewBox="0 0 300 300" width="100%" height="100%">
            <defs>
              <filter id={`${p}-f3`}><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            <g ref={triRef} style={{ transformOrigin: '150px 150px' }}>
              {[0,120,240].map(a => (
                <polygon key={a}
                  points={triPts(C, C, 48, 22, a)}
                  fill="rgba(56,189,248,0.15)"
                  stroke="#7dd3fc"
                  strokeWidth="1.2"
                  filter={`url(#${p}-f3)`}
                />
              ))}
              <circle cx={C} cy={C} r="22" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" />
            </g>
          </svg>
        </div>

        {/* ── LAYER: core (front) ── */}
        <div style={{ position: 'absolute', inset: 0, transform: 'translateZ(110px)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <svg viewBox="0 0 300 300" width="100%" height="100%">
            <defs>
              <radialGradient id={`${p}-cg`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#bae6fd" />
                <stop offset="70%" stopColor="#0ea5e9" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0369a1" stopOpacity="0.3" />
              </radialGradient>
              <filter id={`${p}-f4`}><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id={`${p}-f5`}><feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            {/* outer core glow bloom */}
            <circle cx={C} cy={C} r="38" fill="#0ea5e9" opacity="0.3" filter={`url(#${p}-f5)`} />
            {/* core fill */}
            <circle cx={C} cy={C} r="32" fill={`url(#${p}-cg)`} filter={`url(#${p}-f4)`} />
            {/* inner ring */}
            <circle cx={C} cy={C} r="22" fill="none" stroke="#fff" strokeWidth="1" strokeOpacity="0.4" />
            {/* hot white center */}
            <circle cx={C} cy={C} r="12" fill="#ffffff" opacity="0.95" filter={`url(#${p}-f4)`} />
          </svg>
        </div>

        {/* ── energy beam toward cursor ── */}
        <div ref={beamRef} style={{
          position: 'absolute', top: '50%', left: '50%',
          width: size * 0.65, height: 3,
          transformOrigin: '0 50%', opacity: 0, pointerEvents: 'none',
          transform: 'translateZ(80px)',
        }}>
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(90deg, rgba(186,230,253,0.95) 0%, rgba(14,165,233,0.5) 40%, transparent 100%)',
            boxShadow: '0 0 10px 2px rgba(14,165,233,0.6)',
            borderRadius: 2,
          }} />
        </div>
      </div>
    </div>
  );
}

/* ── Glitch text ─────────────────────────────────────────────────── */
function GlitchText({ text, style = {} }) {
  const ref = useRef(null);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
  const animate = () => {
    const el = ref.current;
    if (!el) return;
    let iter = 0;
    const interval = setInterval(() => {
      el.innerText = text.split('').map((c, i) => {
        if (c === ' ') return ' ';
        if (i < iter) return text[i];
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      if (iter >= text.length) clearInterval(interval);
      iter += 0.4;
    }, 35);
  };
  useEffect(() => { setTimeout(animate, 400); }, []);
  return <span ref={ref} onMouseEnter={animate} style={{ cursor: 'default', ...style }}>{text}</span>;
}

/* ── Typing text ─────────────────────────────────────────────────── */
function Typing({ text, delay = 0 }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i));
        i++;
        if (i > text.length) clearInterval(interval);
      }, 22);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(t);
  }, [text, delay]);
  return <span>{displayed}<span style={{ opacity: Math.random() > 0.5 ? 1 : 0, color: '#0ea5e9' }}>▊</span></span>;
}

/* ── 3D tilt card ────────────────────────────────────────────────── */
function TiltCard({ children, style = {} }) {
  const ref = useRef(null);
  const handleMove = e => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(600px) rotateX(${-y * 14}deg) rotateY(${x * 14}deg) scale(1.03)`;
    ref.current.style.boxShadow = `${-x * 20}px ${-y * 20}px 40px rgba(14,165,233,0.2)`;
  };
  const handleLeave = () => {
    ref.current.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)';
    ref.current.style.boxShadow = '';
  };
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition: 'transform 0.1s ease, box-shadow 0.1s ease', transformStyle: 'preserve-3d', ...style }}>
      {children}
    </div>
  );
}

/* ── Animated counter — pure RAF, no external deps ───────────────── */
const Counter = memo(function Counter({ to, suffix = '', delay = 500 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf, start = null;
    const duration = 1800;
    const timer = setTimeout(() => {
      const tick = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(eased * to));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [to, delay]);
  return <span>{val}{suffix}</span>;
});

/* ── Circular skill gauge — pure RAF + IntersectionObserver ──────── */
const CircleGauge = memo(function CircleGauge({ name, level }) {
  const SIZE = 110, STROKE = 6, R = (SIZE - STROKE * 2) / 2;
  const CIRC = 2 * Math.PI * R;
  const [offset, setOffset] = useState(CIRC);
  const [displayVal, setDisplayVal] = useState(0);
  const containerRef = useRef(null);
  const firedRef = useRef(false);
  const color = level >= 80 ? '#22c55e' : level >= 60 ? '#6c63ff' : level >= 40 ? '#f59e0b' : '#64748b';

  useEffect(() => {
    let raf;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || firedRef.current) return;
      firedRef.current = true;
      obs.disconnect();
      let start = null;
      const duration = 1600;
      const tick = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const v = eased * level;
        setOffset(CIRC * (1 - v / 100));
        setDisplayVal(Math.round(v));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.15 });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [level, CIRC]);

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} />
          <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke={color} strokeWidth={STROKE}
            strokeDasharray={CIRC} strokeDashoffset={offset} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * 360 - 90;
            const rad = a * Math.PI / 180;
            const x1 = SIZE/2 + Math.cos(rad) * (R + STROKE);
            const y1 = SIZE/2 + Math.sin(rad) * (R + STROKE);
            const x2 = SIZE/2 + Math.cos(rad) * (R + STROKE + 4);
            const y2 = SIZE/2 + Math.sin(rad) * (R + STROKE + 4);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" />;
          })}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1, textShadow: `0 0 10px ${color}99` }}>
            {displayVal}<span style={{ fontSize: 10, opacity: 0.7 }}>%</span>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11, opacity: 0.75, textAlign: 'center', maxWidth: 110, lineHeight: 1.3, fontWeight: 500 }}>{name}</div>
    </div>
  );
});

/* ── HUD bracket corner ──────────────────────────────────────────── */
function HUDSection({ title, color = '#0ea5e9', children }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{
      position: 'relative', padding: '28px 24px',
      opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(40px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease',
      marginBottom: 48,
    }}>
      {/* corner brackets */}
      {[['0','0','1','0','0','1'], ['0','auto','1','0','0','0'], ['auto','0','0','1','1','0'], ['auto','auto','0','1','0','0']].map(([t,r,bt,bb,bl,br], i) => (
        <div key={i} style={{
          position: 'absolute', top: t, right: r === 'auto' ? undefined : r, bottom: t === 'auto' ? t : undefined,
          left: r !== 'auto' ? undefined : (i > 1 ? 0 : undefined),
          width: 16, height: 16,
          borderTop: bt === '1' ? `1.5px solid ${color}` : 'none',
          borderBottom: bb === '1' ? `1.5px solid ${color}` : 'none',
          borderLeft: bl === '1' ? `1.5px solid ${color}` : 'none',
          borderRight: br === '1' ? `1.5px solid ${color}` : 'none',
          opacity: 0.7,
        }} />
      ))}
      <div style={{ fontSize: 10, letterSpacing: '0.3em', color, marginBottom: 24, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'inline-block', width: 6, height: 6, background: color, borderRadius: '50%', boxShadow: `0 0 8px ${color}` }} />
        {title}
        <span style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${color}44, transparent)` }} />
      </div>
      {children}
    </div>
  );
}

/* ── Scroll progress bar ─────────────────────────────────────────── */
function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setP(el.scrollTop / (el.scrollHeight - el.clientHeight));
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 999, background: 'rgba(255,255,255,0.05)' }}>
      <div style={{ height: '100%', width: `${p * 100}%`, background: 'linear-gradient(90deg,#6c63ff,#0ea5e9,#22c55e)', transition: 'width 0.1s', boxShadow: '0 0 8px #0ea5e9' }} />
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function CurriculumAnimado() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  const handleMouseMove = useCallback(e => {
    setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: '#e2e8f0', overflowX: 'hidden' }}>
      <ScrollProgress />
      <Particles />
      <CursorTrail />

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', padding: '40px 24px',
      }}>
        {/* faint background watermark */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', opacity: 0.04, zIndex: 0,
          transform: `translate(${(mouse.x - 0.5) * -40}px, ${(mouse.y - 0.5) * -40}px)`,
          transition: 'transform 0.3s ease',
        }}>
          <Reactor3D mouseX={0.5} mouseY={0.5} size={820} idPrefix="bg" />
        </div>

        {/* TITLE BLOCK */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center',
          transform: `translate(${(mouse.x - 0.5) * 6}px, ${(mouse.y - 0.5) * 6}px)`,
          transition: 'transform 0.2s ease', marginBottom: 28,
        }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#0ea5e9', marginBottom: 14, opacity: 0.7 }}>
            SISTEMA INICIADO · CARGANDO PERFIL
          </div>

          <h1 style={{ fontSize: 'clamp(38px, 8vw, 74px)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1, marginBottom: 10 }}>
            <GlitchText text="CÉSAR CABANAS" style={{ color: '#fff' }} />
          </h1>

          <div style={{ fontSize: 'clamp(11px, 1.8vw, 14px)', letterSpacing: '0.3em', color: '#0ea5e9', fontWeight: 600 }}>
            <Typing text="SALESFORCE DEVELOPER & FULL STACK" delay={1200} />
          </div>
        </div>

        {/* INLINE INTERACTIVE 3D REACTOR */}
        <div style={{ position: 'relative', zIndex: 2, marginBottom: 32 }}>
          <Reactor3D mouseX={mouse.x} mouseY={mouse.y} size={360} idPrefix="hero" />
        </div>

        {/* ABOUT + STATS */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 720,
          transform: `translate(${(mouse.x - 0.5) * 4}px, ${(mouse.y - 0.5) * 4}px)`,
          transition: 'transform 0.25s ease',
        }}>
          <p style={{ maxWidth: 520, margin: '0 auto 28px', fontSize: 13, lineHeight: 1.75, color: 'rgba(226,232,240,0.65)' }}>
            {CV.about}
          </p>

          <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
            {CV.stats.map((s, i) => (
              <TiltCard key={i}>
                <div style={{
                  padding: '12px 20px', background: 'rgba(14,165,233,0.06)',
                  border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, textAlign: 'center', minWidth: 100,
                }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#7dd3fc', lineHeight: 1 }}>
                    <Counter to={s.val} suffix={s.suffix} delay={400 + i * 150} />
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.5, letterSpacing: '0.1em', marginTop: 4 }}>{s.label}</div>
                </div>
              </TiltCard>
            ))}
          </div>

          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.3 }}>
            <div style={{ width: 1, height: 28, background: 'linear-gradient(180deg,transparent,#0ea5e9)' }} />
            <div style={{ fontSize: 9, letterSpacing: '0.3em' }}>SCROLL</div>
          </div>
        </div>
      </section>

      {/* ── CONTENT ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>

        {/* EXPERIENCE */}
        <HUDSection title="EXPERIENCIA PROFESIONAL" color="#6c63ff">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {CV.experience.map((exp, i) => (
              <TiltCard key={i} style={{
                background: 'rgba(255,255,255,0.025)', border: `1px solid ${exp.color}22`,
                borderRadius: 12, padding: '18px 22px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: exp.color, boxShadow: `0 0 10px ${exp.color}`, display: 'inline-block', flexShrink: 0 }} />
                      <span style={{ fontWeight: 800, fontSize: 16 }}>{exp.company}</span>
                      {exp.current && <span style={{ fontSize: 9, background: exp.color + '22', border: `1px solid ${exp.color}66`, color: exp.color, borderRadius: 20, padding: '2px 8px', letterSpacing: '0.1em' }}>ACTIVO</span>}
                    </div>
                    <div style={{ fontSize: 12, color: exp.color, marginTop: 4, paddingLeft: 18 }}>{exp.role}</div>
                  </div>
                  <span style={{ fontSize: 11, opacity: 0.35, alignSelf: 'flex-start', fontFamily: 'monospace' }}>{exp.period}</span>
                </div>
                <p style={{ fontSize: 13, opacity: 0.6, lineHeight: 1.65, margin: 0, paddingLeft: 18 }}>{exp.desc}</p>
              </TiltCard>
            ))}
          </div>
        </HUDSection>

        {/* PROJECTS */}
        <HUDSection title="PROYECTOS" color="#0ea5e9">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
            {CV.projects.map((p, i) => (
              <TiltCard key={i} style={{
                background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.14)',
                borderRadius: 12, padding: '16px 18px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{p.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                  </div>
                  {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: '#0ea5e9', textDecoration: 'none', letterSpacing: '0.1em' }}>↗ VER</a>}
                </div>
                <p style={{ fontSize: 12, opacity: 0.6, lineHeight: 1.65, margin: '0 0 10px' }}>{p.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {p.tags.map(tag => <span key={tag} style={{ fontSize: 9, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: 4, padding: '2px 7px', letterSpacing: '0.05em', color: '#7dd3fc' }}>{tag}</span>)}
                </div>
              </TiltCard>
            ))}
          </div>
        </HUDSection>

        {/* SKILLS */}
        <HUDSection title="STACK TECNOLÓGICO" color="#a855f7">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
            {CV.skills.map((sk, i) => <CircleGauge key={i} name={sk.name} level={sk.level} />)}
          </div>
        </HUDSection>

      </div>

      {/* fixed reactor watermark */}
      <div style={{ position: 'fixed', bottom: -120, right: -120, opacity: 0.05, pointerEvents: 'none', zIndex: 0 }}>
        <Reactor3D mouseX={0.5} mouseY={0.5} size={360} idPrefix="wm" />
      </div>
    </div>
  );
}
