'use client';
import { useEffect, useRef, useState } from 'react';

/* ─── CV data (same as /curriculum) ─────────────────────────────── */
const CV = {
  name: 'César Cabanas',
  title: 'Salesforce Developer & Full Stack',
  about: 'Desarrollador con más de 3 años de experiencia en Salesforce, especializado en Apex y Lightning Web Components. Versátil en el stack completo: Python, Java, React, Next.js, Docker.',
  experience: [
    {
      company: 'Inetum', role: 'Desarrollador Salesforce',
      period: 'Marzo 2023 – Actualidad', current: true,
      desc: 'Soluciones Salesforce para clientes de gran cuenta. Flow Builder, Apex, Lightning Web Components.',
      color: '#6c63ff',
    },
    {
      company: 'EnkoTeams', role: 'Soporte Salesforce & Desarrollo',
      period: 'Marzo 2022 – Junio 2022', current: false,
      desc: 'Soporte técnico Salesforce y herramientas internas para optimizar procesos.',
      color: '#a855f7',
    },
    {
      company: 'OnRetrieval', role: 'Técnico de Recuperación de Datos',
      period: 'Veranos 2017 – 2020', current: false,
      desc: 'Recuperación de datos en laboratorio especializado, sistemas de almacenamiento dañados.',
      color: '#3b82f6',
    },
  ],
  skills: [
    { name: 'Salesforce', level: 80 }, { name: 'Python', level: 80 },
    { name: 'Java', level: 70 },       { name: 'SQL', level: 70 },
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
};

/* ─── Arc Reactor SVG canvas ─────────────────────────────────────── */
function ArcReactor() {
  const svgRef = useRef(null);

  useEffect(() => {
    let anime;
    import('animejs').then(mod => {
      anime = mod.default ?? mod;
      const svg = svgRef.current;
      if (!svg) return;

      /* outer rings counter-rotate */
      anime({ targets: '#arc-r1', rotate: [0, 360], duration: 18000, loop: true, easing: 'linear' });
      anime({ targets: '#arc-r2', rotate: [0, -360], duration: 12000, loop: true, easing: 'linear' });
      anime({ targets: '#arc-r3', rotate: [0, 360], duration: 8000, loop: true, easing: 'linear' });

      /* core pulse */
      anime({
        targets: '#arc-core',
        scale: [1, 1.18, 1],
        opacity: [0.7, 1, 0.7],
        duration: 2200,
        loop: true,
        easing: 'easeInOutSine',
      });

      /* energy arcs flicker */
      anime({
        targets: '.arc-bolt',
        opacity: [0, 1, 0],
        duration: 900,
        delay: anime.stagger(200, { start: 0 }),
        loop: true,
        easing: 'easeInOutQuad',
      });

      /* outer glow pulse */
      anime({
        targets: '#arc-glow',
        r: [110, 130, 110],
        opacity: [0.07, 0.18, 0.07],
        duration: 3000,
        loop: true,
        easing: 'easeInOutSine',
      });
    });
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 300 300"
      style={{ width: '100%', height: '100%' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="1" />
          <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.3" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glowStrong">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ambient glow */}
      <circle id="arc-glow" cx="150" cy="150" r="120" fill="#0ea5e9" opacity="0.1" />

      {/* ring 1 — outermost, dashed */}
      <g id="arc-r1" style={{ transformOrigin: '150px 150px' }}>
        <circle cx="150" cy="150" r="108" fill="none" stroke="#0ea5e9" strokeWidth="1" strokeOpacity="0.35" strokeDasharray="6 10" />
        {[0,90,180,270].map(a => (
          <rect key={a} x="146" y="36" width="8" height="8" rx="2"
            fill="#0ea5e9" opacity="0.7" filter="url(#glow)"
            transform={`rotate(${a} 150 150)`} />
        ))}
      </g>

      {/* ring 2 */}
      <g id="arc-r2" style={{ transformOrigin: '150px 150px' }}>
        <circle cx="150" cy="150" r="88" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="12 8" />
        {[45,135,225,315].map(a => (
          <circle key={a} cx="150" cy="62" r="4"
            fill="#38bdf8" opacity="0.8" filter="url(#glow)"
            transform={`rotate(${a} 150 150)`} />
        ))}
      </g>

      {/* ring 3 — inner */}
      <g id="arc-r3" style={{ transformOrigin: '150px 150px' }}>
        <circle cx="150" cy="150" r="68" fill="none" stroke="#7dd3fc" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4 6" />
        {[0,60,120,180,240,300].map(a => (
          <line key={a}
            x1="150" y1="82" x2="150" y2="90"
            stroke="#7dd3fc" strokeWidth="2" opacity="0.7"
            transform={`rotate(${a} 150 150)`} />
        ))}
      </g>

      {/* energy bolts */}
      {[20,80,140,200,260,320].map((a, i) => (
        <line key={i} className="arc-bolt"
          x1="150" y1="100" x2="150" y2="120"
          stroke="#bae6fd" strokeWidth="1.5" opacity="0"
          transform={`rotate(${a} 150 150)`}
          filter="url(#glow)"
        />
      ))}

      {/* hexagonal inner frame */}
      <polygon
        points="150,102 183,120 183,156 150,174 117,156 117,120"
        fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeOpacity="0.6"
        filter="url(#glow)"
      />

      {/* core */}
      <circle id="arc-core" cx="150" cy="150" r="38" fill="url(#coreGrad)" filter="url(#glowStrong)" />
      <circle cx="150" cy="150" r="28" fill="none" stroke="#fff" strokeWidth="1" strokeOpacity="0.3" />
      <circle cx="150" cy="150" r="16" fill="#e0f2fe" opacity="0.9" filter="url(#glowStrong)" />

      {/* cross lines on core */}
      <line x1="150" y1="128" x2="150" y2="172" stroke="#fff" strokeWidth="1" strokeOpacity="0.25" />
      <line x1="128" y1="150" x2="172" y2="150" stroke="#fff" strokeWidth="1" strokeOpacity="0.25" />
    </svg>
  );
}

/* ─── Animated counter ───────────────────────────────────────────── */
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
        anime({ targets: obj, v: to, duration: 1800, easing: 'easeOutExpo', update: () => setVal(Math.round(obj.v)) });
      });
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─── Skill bar ──────────────────────────────────────────────────── */
function SkillBar({ name, level }) {
  const barRef = useRef(null);
  const color = level >= 80 ? '#22c55e' : level >= 60 ? '#6c63ff' : level >= 40 ? '#f59e0b' : '#64748b';
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      import('animejs').then(mod => {
        const anime = mod.default ?? mod;
        anime({ targets: barRef.current, width: [`0%`, `${level}%`], duration: 1200, easing: 'easeOutExpo', delay: 200 });
      });
    }, { threshold: 0.5 });
    if (barRef.current) obs.observe(barRef.current);
    return () => obs.disconnect();
  }, [level]);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, opacity: 0.8 }}>
        <span>{name}</span><span style={{ color }}>{level}%</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
        <div ref={barRef} style={{ height: '100%', width: 0, background: color, borderRadius: 4, boxShadow: `0 0 8px ${color}88` }} />
      </div>
    </div>
  );
}

/* ─── Section reveal ─────────────────────────────────────────────── */
function Reveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(28px)',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─── Scan line overlay ──────────────────────────────────────────── */
function ScanLine() {
  const ref = useRef(null);
  useEffect(() => {
    import('animejs').then(mod => {
      const anime = mod.default ?? mod;
      anime({
        targets: ref.current,
        top: ['-2%', '102%'],
        duration: 5000,
        loop: true,
        easing: 'linear',
      });
    });
  }, []);
  return (
    <div ref={ref} style={{
      position: 'fixed', left: 0, right: 0, height: 2,
      background: 'linear-gradient(90deg, transparent, rgba(14,165,233,0.4), transparent)',
      pointerEvents: 'none', zIndex: 0, top: 0,
    }} />
  );
}

/* ─── Main page ──────────────────────────────────────────────────── */
export default function CurriculumAnimado() {
  const headerRef = useRef(null);

  useEffect(() => {
    import('animejs').then(mod => {
      const anime = mod.default ?? mod;
      /* hero name letter-by-letter */
      anime({
        targets: '.hero-letter',
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(60, { start: 300 }),
        duration: 500,
        easing: 'easeOutExpo',
      });
      anime({
        targets: '.hero-title',
        opacity: [0, 1],
        translateX: [-30, 0],
        delay: 900,
        duration: 700,
        easing: 'easeOutExpo',
      });
      anime({
        targets: '.hero-about',
        opacity: [0, 1],
        delay: 1300,
        duration: 800,
        easing: 'easeOutSine',
      });
    });
  }, []);

  const letters = CV.name.split('');

  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: '#e2e8f0' }}>
      <ScanLine />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative', minHeight: '92vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* Arc reactor background */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ width: 440, height: 440, opacity: 0.35 }}>
            <ArcReactor />
          </div>
        </div>

        {/* Content over reactor */}
        <div ref={headerRef} style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px' }}>
          <div style={{
            fontSize: 'clamp(38px, 8vw, 74px)', fontWeight: 900, letterSpacing: '-1px',
            lineHeight: 1, marginBottom: 16,
          }}>
            {letters.map((l, i) => (
              <span key={i} className="hero-letter" style={{ opacity: 0, display: 'inline-block', color: l === ' ' ? undefined : undefined }}>
                {l === ' ' ? ' ' : l}
              </span>
            ))}
          </div>

          <div className="hero-title" style={{ opacity: 0, fontSize: 'clamp(13px, 2vw, 17px)', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#0ea5e9', marginBottom: 24, fontWeight: 600 }}>
            {CV.title}
          </div>

          <p className="hero-about" style={{ opacity: 0, maxWidth: 560, margin: '0 auto 36px', fontSize: 15, lineHeight: 1.7, color: 'rgba(226,232,240,0.7)' }}>
            {CV.about}
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { val: 3, suffix: '+', label: 'Años exp.' },
              { val: 12, suffix: '+', label: 'Tecnologías' },
              { val: 3, suffix: '', label: 'Empresas' },
              { val: 5, suffix: '+', label: 'Proyectos' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#7dd3fc' }}>
                  <Counter to={s.val} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 11, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* scroll cue */}
          <div style={{ marginTop: 56, fontSize: 12, opacity: 0.35, letterSpacing: '0.15em' }}>▼ SCROLL</div>
        </div>
      </section>

      {/* ── EXPERIENCE ───────────────────────────────────────────── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '60px 24px' }}>
        <Reveal>
          <h2 style={sectionTitle}>
            <span style={dot('#6c63ff')} /> EXPERIENCIA
            <span style={line} />
          </h2>
        </Reveal>

        {CV.experience.map((exp, i) => (
          <Reveal key={i} delay={i * 120}>
            <div style={{
              position: 'relative', paddingLeft: 28, marginBottom: 36,
              borderLeft: `2px solid ${exp.color}44`,
            }}>
              <div style={{
                position: 'absolute', left: -7, top: 4,
                width: 12, height: 12, borderRadius: '50%',
                background: exp.color, boxShadow: `0 0 10px ${exp.color}`,
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{exp.company}</span>
                  {exp.current && <span style={{ marginLeft: 8, fontSize: 10, background: exp.color + '22', border: `1px solid ${exp.color}55`, color: exp.color, borderRadius: 20, padding: '2px 8px', verticalAlign: 'middle' }}>ACTUAL</span>}
                  <div style={{ fontSize: 13, color: exp.color, marginTop: 2 }}>{exp.role}</div>
                </div>
                <span style={{ fontSize: 12, opacity: 0.4, alignSelf: 'flex-start', marginTop: 4, whiteSpace: 'nowrap' }}>{exp.period}</span>
              </div>
              <p style={{ fontSize: 13, opacity: 0.65, lineHeight: 1.65, margin: 0 }}>{exp.desc}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ── PROJECTS ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 60px' }}>
        <Reveal>
          <h2 style={sectionTitle}>
            <span style={dot('#0ea5e9')} /> PROYECTOS
            <span style={line} />
          </h2>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {CV.projects.map((p, i) => (
            <Reveal key={i} delay={i * 80}>
              <div style={{
                background: 'rgba(14,165,233,0.05)',
                border: '1px solid rgba(14,165,233,0.15)',
                borderRadius: 12, padding: '16px 18px',
                transition: 'border-color .2s, background .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.4)'; e.currentTarget.style.background = 'rgba(14,165,233,0.09)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(14,165,233,0.15)'; e.currentTarget.style.background = 'rgba(14,165,233,0.05)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 18, marginRight: 8 }}>{p.icon}</span>
                    <span style={{ fontWeight: 700 }}>{p.name}</span>
                  </div>
                  {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#0ea5e9', textDecoration: 'none', whiteSpace: 'nowrap', marginLeft: 8 }}>↗ Ver</a>}
                </div>
                <p style={{ fontSize: 12, opacity: 0.6, lineHeight: 1.6, margin: '0 0 10px' }}>{p.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {p.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px 7px', opacity: 0.7 }}>{tag}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── SKILLS ───────────────────────────────────────────────── */}
      <section style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px 100px' }}>
        <Reveal>
          <h2 style={sectionTitle}>
            <span style={dot('#a855f7')} /> SKILLS
            <span style={line} />
          </h2>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '4px 40px' }}>
          {CV.skills.map((sk, i) => (
            <Reveal key={i} delay={i * 60}>
              <SkillBar name={sk.name} level={sk.level} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Arc reactor watermark bottom ─────────────────────────── */}
      <div style={{ position: 'fixed', bottom: -120, right: -120, width: 360, height: 360, opacity: 0.06, pointerEvents: 'none', zIndex: 0 }}>
        <ArcReactor />
      </div>
    </div>
  );
}

const sectionTitle = {
  fontSize: 12, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase',
  color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32,
};
const dot = (c) => ({ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}`, flexShrink: 0 });
const line = { flex: 1, height: 1, background: 'rgba(255,255,255,0.07)', display: 'block' };
