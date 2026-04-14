'use client';
import { useEffect, useState, useRef } from 'react';

const CV = {
  name: 'César Cabanas',
  title: 'Salesforce Developer & Full Stack',
  about: 'Desarrollador con más de 3 años de experiencia especializado en Salesforce, con base sólida en Python, Java y desarrollo web. Apasionado por la automatización y la inteligencia artificial, siempre buscando aplicar tecnología para resolver problemas reales de forma eficiente.',
  contact: {
    email: 'ccabanasurbina@gmail.com',
    phone: '+34 648 747 761',
    github: 'https://github.com/zeuscabanas',
  },
  stats: [
    { value: '3+', label: 'Años de experiencia' },
    { value: '10+', label: 'Tecnologías' },
    { value: '3', label: 'Empresas' },
    { value: '2', label: 'Proyectos propios' },
  ],
  experience: [
    {
      company: 'Inetum',
      role: 'Desarrollador Salesforce',
      period: 'Marzo 2023 – Actualidad',
      current: true,
      desc: 'Desarrollo y mantenimiento de soluciones Salesforce para clientes empresariales. Implementación de flujos automatizados, desarrollo en Apex y Lightning Web Components.',
      color: '#6c63ff',
    },
    {
      company: 'EnkoTeams',
      role: 'Soporte Salesforce & Desarrollo de Aplicaciones',
      period: 'Marzo 2022 – Junio 2022',
      current: false,
      desc: 'Soporte técnico en plataforma Salesforce y colaboración en el desarrollo de aplicaciones internas para el equipo.',
      color: '#a855f7',
    },
    {
      company: 'OnRetrieval',
      role: 'Técnico de Laboratorio de Recuperación de Datos',
      period: 'Veranos 2017 – 2020',
      current: false,
      desc: 'Recuperación de datos en entornos de laboratorio especializado, trabajando con sistemas de almacenamiento dañados.',
      color: '#3b82f6',
    },
  ],
  education: [
    {
      title: 'Desarrollo de Aplicaciones Multiplataforma',
      center: 'IES Virgen de la Paloma · Madrid',
      period: '2020 – 2022',
    },
    {
      title: 'Sistemas Microinformáticos y Redes',
      center: 'Tajamar · Madrid',
      period: '2018 – 2020',
    },
  ],
  skills: [
    { name: 'Salesforce', level: 80, cat: 'CRM' },
    { name: 'Python', level: 80, cat: 'Backend' },
    { name: 'Java', level: 70, cat: 'Backend' },
    { name: 'SQL', level: 70, cat: 'Datos' },
    { name: 'HTML', level: 80, cat: 'Frontend' },
    { name: 'MongoDB', level: 60, cat: 'Datos' },
    { name: 'JavaScript', level: 40, cat: 'Frontend' },
    { name: 'CSS', level: 40, cat: 'Frontend' },
    { name: 'PyTorch / TF', level: 20, cat: 'IA' },
  ],
  projects: [
    {
      name: 'Uri Project',
      desc: 'Plataforma web para gestionar servicios de música en locales. Desarrollo full stack con gestión de usuarios y servicios.',
      tags: ['JavaScript', 'Web', 'Full Stack'],
      icon: '🎵',
    },
    {
      name: 'Visión Artificial',
      desc: 'Sistema para el entrenamiento y despliegue de modelos de reconocimiento de imágenes usando deep learning.',
      tags: ['Python', 'IA', 'Computer Vision'],
      icon: '👁',
    },
    {
      name: 'RatónArtificial',
      desc: 'Herramienta de automatización inteligente en Python. Proyecto open source publicado en GitHub.',
      tags: ['Python', 'Automatización', 'IA'],
      icon: '🤖',
      link: 'https://github.com/zeuscabanas/RatonArtificial',
    },
  ],
};

const skillColor = lvl =>
  lvl >= 80 ? '#22c55e' : lvl >= 60 ? '#6c63ff' : lvl >= 40 ? '#f59e0b' : '#64748b';

export default function Curriculum() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | ok | error
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error desconocido');
      setStatus('ok');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  }

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('cv-visible'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.cv-reveal').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="cv-page">

      {/* ── HERO ── */}
      <section className="cv-hero cv-reveal">
        <div className="cv-avatar">{CV.name.split(' ').map(w => w[0]).join('')}</div>
        <div className="cv-hero-text">
          <h1 className="cv-name">{CV.name}</h1>
          <p className="cv-title-badge">{CV.title}</p>
          <p className="cv-about">{CV.about}</p>
          <div className="cv-contact-row">
            <a href={`mailto:${CV.contact.email}`} className="cv-chip">✉ {CV.contact.email}</a>
            <a href={`tel:${CV.contact.phone.replace(/\s/g,'')}`} className="cv-chip">📞 {CV.contact.phone}</a>
            <a href={CV.contact.github} target="_blank" rel="noreferrer" className="cv-chip">⌥ GitHub</a>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="cv-stats cv-reveal">
        {CV.stats.map((s, i) => (
          <div key={i} className="cv-stat">
            <span className="cv-stat-value">{s.value}</span>
            <span className="cv-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="cv-grid">
        <div className="cv-col-main">

          {/* ── EXPERIENCIA ── */}
          <section className="cv-section cv-reveal">
            <h2 className="cv-section-title"><span className="cv-dot" />Experiencia</h2>
            <div className="cv-timeline">
              {CV.experience.map((exp, i) => (
                <div key={i} className="cv-tl-item cv-reveal" style={{ '--delay': `${i * 0.1}s` }}>
                  <div className="cv-tl-line" style={{ background: exp.color }} />
                  <div className="cv-tl-body">
                    <div className="cv-tl-header">
                      <div>
                        <span className="cv-tl-company">{exp.company}</span>
                        {exp.current && <span className="cv-badge-current">Actual</span>}
                        <p className="cv-tl-role">{exp.role}</p>
                      </div>
                      <span className="cv-tl-period">{exp.period}</span>
                    </div>
                    <p className="cv-tl-desc">{exp.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── FORMACIÓN ── */}
          <section className="cv-section cv-reveal">
            <h2 className="cv-section-title"><span className="cv-dot" />Formación</h2>
            <div className="cv-timeline">
              {CV.education.map((edu, i) => (
                <div key={i} className="cv-tl-item cv-reveal" style={{ '--delay': `${i * 0.1}s` }}>
                  <div className="cv-tl-line" style={{ background: '#a855f7' }} />
                  <div className="cv-tl-body">
                    <div className="cv-tl-header">
                      <div>
                        <span className="cv-tl-company">{edu.title}</span>
                        <p className="cv-tl-role">{edu.center}</p>
                      </div>
                      <span className="cv-tl-period">{edu.period}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── PROYECTOS ── */}
          <section className="cv-section cv-reveal">
            <h2 className="cv-section-title"><span className="cv-dot" />Proyectos</h2>
            <div className="cv-projects">
              {CV.projects.map((p, i) => (
                <div key={i} className="cv-project-card cv-reveal" style={{ '--delay': `${i * 0.1}s` }}>
                  <div className="cv-project-icon">{p.icon}</div>
                  <div className="cv-project-body">
                    <div className="cv-project-header">
                      <span className="cv-project-name">{p.name}</span>
                      {p.link && (
                        <a href={p.link} target="_blank" rel="noreferrer" className="cv-project-link">↗ Ver</a>
                      )}
                    </div>
                    <p className="cv-project-desc">{p.desc}</p>
                    <div className="cv-tags">
                      {p.tags.map(t => <span key={t} className="cv-tag">{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── SIDEBAR SKILLS ── */}
        <div className="cv-col-side">
          <section className="cv-section cv-reveal">
            <h2 className="cv-section-title"><span className="cv-dot" />Skills</h2>
            <div className="cv-skills">
              {CV.skills.map((sk, i) => (
                <div key={i} className="cv-skill cv-reveal" style={{ '--delay': `${i * 0.05}s` }}>
                  <div className="cv-skill-header">
                    <span className="cv-skill-name">{sk.name}</span>
                    <span className="cv-skill-cat">{sk.cat}</span>
                  </div>
                  <div className="cv-bar-bg">
                    <div
                      className="cv-bar-fill"
                      style={{ '--w': `${sk.level}%`, '--c': skillColor(sk.level) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* ── CTA CONTACTO ── */}
      <section className="cv-cta cv-reveal">
        <h3 className="cv-cta-title">¿Hablamos?</h3>
        <p className="cv-cta-sub">Abierto a nuevas oportunidades y proyectos interesantes.</p>

        {status === 'ok' ? (
          <div className="cv-form-success">
            <span className="cv-form-success-icon">✓</span>
            <p>¡Mensaje enviado! Te responderé lo antes posible.</p>
          </div>
        ) : (
          <form className="cv-contact-form" onSubmit={handleSubmit} noValidate>
            <div className="cv-form-row">
              <div className="cv-form-group">
                <label className="cv-form-label" htmlFor="cf-name">Nombre</label>
                <input
                  id="cf-name"
                  className="cv-form-input"
                  type="text"
                  placeholder="Tu nombre"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="cv-form-group">
                <label className="cv-form-label" htmlFor="cf-email">Email</label>
                <input
                  id="cf-email"
                  className="cv-form-input"
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="cv-form-group">
              <label className="cv-form-label" htmlFor="cf-msg">Mensaje</label>
              <textarea
                id="cf-msg"
                className="cv-form-input cv-form-textarea"
                placeholder="Cuéntame en qué puedo ayudarte..."
                rows={4}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                required
              />
            </div>
            {status === 'error' && (
              <p className="cv-form-error">Error: {errorMsg}</p>
            )}
            <button
              type="submit"
              className="cv-cta-btn"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
            </button>
          </form>
        )}
      </section>

    </div>
  );
}
