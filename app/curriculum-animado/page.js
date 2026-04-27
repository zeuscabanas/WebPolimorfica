'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

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

/* ── 3D Reactor that tracks mouse ────────────────────────────────── */
function Reactor3D({ mouseX, mouseY }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const animeRef = useRef(null);

  useEffect(() => {
    import('animejs').then(mod => {
      const anime = mod.default ?? mod;
      animeRef.current = anime;
      anime({ targets: '#r1', rotate: [0, 360], duration: 14000, loop: true, easing: 'linear' });
      anime({ targets: '#r2', rotate: [0, -360], duration: 9000, loop: true, easing: 'linear' });
      anime({ targets: '#r3', rotate: [0, 360], duration: 6000, loop: true, easing: 'linear' });
      anime({ targets: '#r4', rotate: [0, -360], duration: 22000, loop: true, easing: 'linear' });
      anime({ targets: '#rcore', scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8], duration: 2000, loop: true, easing: 'easeInOutSine' });
      anime({ targets: '.rbolt', opacity: [0, 1, 0], duration: 700, delay: anime.stagger(120), loop: true, easing: 'easeInOutQuad' });
      anime({ targets: '#rglow', r: ['120', '145', '120'], opacity: [0.06, 0.18, 0.06], duration: 2800, loop: true, easing: 'easeInOutSine' });
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const tiltX = (mouseY - 0.5) * 22;
    const tiltY = (mouseX - 0.5) * -22;
    containerRef.current.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  }, [mouseX, mouseY]);

  const handleClick = () => {
    if (!animeRef.current) return;
    const anime = animeRef.current;
    anime({ targets: '#rglow', r: ['120', '200', '120'], opacity: [0.18, 0.5, 0.06], duration: 600, easing: 'easeOutExpo' });
    anime({ targets: '#rcore', scale: [1, 1.6, 1], duration: 400, easing: 'easeOutExpo' });
    anime({ targets: '.rbolt', opacity: [0, 1, 0], duration: 300, delay: anime.stagger(30), easing: 'easeOutExpo' });
  };

  return (
    <div style={{ perspective: '800px', cursor: 'pointer' }} onClick={handleClick}>
      <div ref={containerRef} style={{ transition: 'transform 0.08s ease', transformStyle: 'preserve-3d' }}>
        <svg ref={svgRef} viewBox="0 0 300 300" style={{ width: 420, height: 420, filter: 'drop-shadow(0 0 30px rgba(14,165,233,0.5))' }}>
          <defs>
            <radialGradient id="cg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.2" />
            </radialGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="glow2"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          <circle id="rglow" cx="150" cy="150" r="120" fill="#0ea5e9" opacity="0.08" />

          {/* ring 4 outermost */}
          <g id="r4" style={{ transformOrigin: '150px 150px' }}>
            <circle cx="150" cy="150" r="128" fill="none" stroke="#0ea5e9" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="2 14" />
          </g>

          {/* ring 1 */}
          <g id="r1" style={{ transformOrigin: '150px 150px' }}>
            <circle cx="150" cy="150" r="112" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="5 9" />
            {[0,72,144,216,288].map(a => (
              <rect key={a} x="147" y="32" width="6" height="6" rx="1.5" fill="#0ea5e9" opacity="0.8" filter="url(#glow)" transform={`rotate(${a} 150 150)`} />
            ))}
          </g>

          {/* ring 2 */}
          <g id="r2" style={{ transformOrigin: '150px 150px' }}>
            <circle cx="150" cy="150" r="90" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.45" strokeDasharray="10 7" />
            {[36,108,180,252,324].map(a => (
              <circle key={a} cx="150" cy="60" r="4.5" fill="#38bdf8" opacity="0.85" filter="url(#glow)" transform={`rotate(${a} 150 150)`} />
            ))}
          </g>

          {/* ring 3 */}
          <g id="r3" style={{ transformOrigin: '150px 150px' }}>
            <circle cx="150" cy="150" r="70" fill="none" stroke="#7dd3fc" strokeWidth="1" strokeOpacity="0.55" strokeDasharray="3 5" />
            {[0,45,90,135,180,225,270,315].map(a => (
              <line key={a} x1="150" y1="80" x2="150" y2="90" stroke="#7dd3fc" strokeWidth="2" opacity="0.7" transform={`rotate(${a} 150 150)`} />
            ))}
          </g>

          {/* energy bolts */}
          {[0,40,80,120,160,200,240,280,320].map((a, i) => (
            <line key={i} className="rbolt" x1="150" y1="104" x2="150" y2="122" stroke="#bae6fd" strokeWidth="1.5" opacity="0" transform={`rotate(${a} 150 150)`} filter="url(#glow)" />
          ))}

          {/* hexagon */}
          <polygon points="150,100 185,120 185,160 150,180 115,160 115,120" fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.65" filter="url(#glow)" />

          {/* inner hex */}
          <polygon points="150,116 168,126 168,146 150,156 132,146 132,126" fill="rgba(14,165,233,0.06)" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.4" />

          {/* core */}
          <circle id="rcore" cx="150" cy="150" r="40" fill="url(#cg)" filter="url(#glow2)" style={{ transformOrigin: '150px 150px' }} />
          <circle cx="150" cy="150" r="28" fill="none" stroke="#fff" strokeWidth="1" strokeOpacity="0.25" />
          <circle cx="150" cy="150" r="14" fill="#e0f2fe" opacity="0.95" filter="url(#glow2)" />

          <line x1="150" y1="124" x2="150" y2="176" stroke="#fff" strokeWidth="1" strokeOpacity="0.2" />
          <line x1="124" y1="150" x2="176" y2="150" stroke="#fff" strokeWidth="1" strokeOpacity="0.2" />
        </svg>
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

/* ── Animated counter ────────────────────────────────────────────── */
function Counter({ to, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      import('animejs').then(mod => {
        const anime = mod.default ?? mod;
        const obj = { v: 0 };
        anime({ targets: obj, v: to, duration: 2000, easing: 'easeOutExpo', update: () => setVal(Math.round(obj.v)) });
      });
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── Circular skill gauge ────────────────────────────────────────── */
function CircleGauge({ name, level }) {
  const r = 28, circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(circ);
  const ref = useRef(null);
  const color = level >= 80 ? '#22c55e' : level >= 60 ? '#6c63ff' : level >= 40 ? '#f59e0b' : '#64748b';

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      import('animejs').then(mod => {
        const anime = mod.default ?? mod;
        const obj = { v: 0 };
        anime({ targets: obj, v: level, duration: 1600, delay: 300, easing: 'easeOutExpo', update: () => setDash(circ - (obj.v / 100) * circ) });
      });
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [level, circ]);

  return (
    <div ref={ref} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 72, height: 72 }}>
        <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
          <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={circ} strokeDashoffset={dash}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 0.05s' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color }}>
          {level}%
        </div>
      </div>
      <div style={{ fontSize: 10, opacity: 0.6, textAlign: 'center', maxWidth: 70, lineHeight: 1.3 }}>{name}</div>
    </div>
  );
}

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
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* parallax reactor bg */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
          transform: `translate(${(mouse.x - 0.5) * -20}px, ${(mouse.y - 0.5) * -20}px)`,
          transition: 'transform 0.15s ease',
        }}>
          <div style={{ opacity: 0.22 }}>
            <Reactor3D mouseX={mouse.x} mouseY={mouse.y} />
          </div>
        </div>

        {/* second parallax layer slower */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', opacity: 0.06,
          transform: `translate(${(mouse.x - 0.5) * -40}px, ${(mouse.y - 0.5) * -40}px)`,
          transition: 'transform 0.25s ease',
        }}>
          <div style={{ width: 700, height: 700 }}>
            <Reactor3D mouseX={0.5} mouseY={0.5} />
          </div>
        </div>

        {/* content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 24px',
          transform: `translate(${(mouse.x - 0.5) * 8}px, ${(mouse.y - 0.5) * 8}px)`,
          transition: 'transform 0.2s ease',
        }}>
          <div style={{ fontSize: 10, letterSpacing: '0.4em', color: '#0ea5e9', marginBottom: 16, opacity: 0.7 }}>
            SISTEMA INICIADO · CARGANDO PERFIL
          </div>

          <h1 style={{ fontSize: 'clamp(42px, 9vw, 82px)', fontWeight: 900, letterSpacing: '-2px', lineHeight: 1, marginBottom: 12 }}>
            <GlitchText text="CÉSAR CABANAS" style={{ color: '#fff' }} />
          </h1>

          <div style={{ fontSize: 'clamp(11px, 1.8vw, 15px)', letterSpacing: '0.3em', color: '#0ea5e9', marginBottom: 28, fontWeight: 600 }}>
            <Typing text="SALESFORCE DEVELOPER & FULL STACK" delay={1200} />
          </div>

          <p style={{ maxWidth: 520, margin: '0 auto 40px', fontSize: 14, lineHeight: 1.75, color: 'rgba(226,232,240,0.65)' }}>
            {CV.about}
          </p>

          <div style={{ display: 'flex', gap: 36, justifyContent: 'center', flexWrap: 'wrap' }}>
            {CV.stats.map((s, i) => (
              <TiltCard key={i}>
                <div style={{
                  padding: '14px 20px', background: 'rgba(14,165,233,0.06)',
                  border: '1px solid rgba(14,165,233,0.2)', borderRadius: 10, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 30, fontWeight: 900, color: '#7dd3fc', lineHeight: 1 }}>
                    <Counter to={s.val} suffix={s.suffix} />
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.5, letterSpacing: '0.1em', marginTop: 4 }}>{s.label}</div>
                </div>
              </TiltCard>
            ))}
          </div>

          <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.3 }}>
            <div style={{ width: 1, height: 40, background: 'linear-gradient(180deg,transparent,#0ea5e9)' }} />
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
      <div style={{ position: 'fixed', bottom: -80, right: -80, width: 300, height: 300, opacity: 0.04, pointerEvents: 'none', zIndex: 0 }}>
        <Reactor3D mouseX={0.5} mouseY={0.5} />
      </div>
    </div>
  );
}
