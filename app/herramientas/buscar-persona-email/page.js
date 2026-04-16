'use client';
import { useState } from 'react';

export default function BuscarPersonaEmailPage() {
  const [form, setForm]       = useState({ nombre: '', apellido: '', empresa: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.apellido.trim()) return;
    setLoading(true);
    setResult(null);

    const params = new URLSearchParams({
      nombre:   form.nombre.trim(),
      apellido: form.apellido.trim(),
      ...(form.empresa.trim() && { empresa: form.empresa.trim() }),
    });

    const res  = await fetch(`/api/buscar-persona-email?${params}`);
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>🕵️ <span className="highlight">Buscar email de persona</span></h1>
        <p className="subtitle">
          Introduce el nombre de una persona y buscaremos su email en Internet analizando múltiples fuentes.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Nombre *</label>
            <input className="yt-input" type="text" placeholder="Juan"
              value={form.nombre} onChange={set('nombre')} style={{ marginTop: '6px' }} required />
          </div>
          <div>
            <label style={labelStyle}>Apellido *</label>
            <input className="yt-input" type="text" placeholder="García"
              value={form.apellido} onChange={set('apellido')} style={{ marginTop: '6px' }} required />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Empresa <span style={{ opacity: 0.5, fontWeight: 400 }}>(opcional, mejora los resultados)</span></label>
          <input className="yt-input" type="text" placeholder="Google, Telefónica…"
            value={form.empresa} onChange={set('empresa')} style={{ marginTop: '6px' }} />
        </div>
        <button type="submit" className="btn-primary" disabled={loading || !form.nombre.trim() || !form.apellido.trim()}
          style={{ alignSelf: 'flex-start' }}>
          {loading ? 'Buscando…' : 'Buscar email →'}
        </button>
      </form>

      {loading && (
        <div style={{ marginTop: '32px' }}>
          <p style={{ opacity: 0.6, fontSize: '14px', marginBottom: '8px' }}>
            Consultando múltiples fuentes en Internet…
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['DuckDuckGo', 'LinkedIn', 'Páginas web', 'Directorios'].map(s => (
              <span key={s} style={tagStyle}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {result?.error && (
        <div style={{ marginTop: '24px', color: '#f87171', background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '12px 16px', fontSize: '14px' }}>
          ❌ {result.error}
        </div>
      )}

      {result?.results && (
        <div style={{ marginTop: '32px', maxWidth: '680px' }}>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
              {result.results.length === 0
                ? `No se encontraron emails para "${result.name}".`
                : `${result.results.length} email${result.results.length > 1 ? 's' : ''} encontrado${result.results.length > 1 ? 's' : ''} para "${result.name}"`}
            </p>
            {result.paginasAnalizadas > 0 && (
              <p style={{ fontSize: '13px', opacity: 0.5, margin: '4px 0 0' }}>
                {result.paginasAnalizadas} páginas analizadas
              </p>
            )}
          </div>

          {result.results.length === 0 && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '24px', fontSize: '14px', opacity: 0.7 }}>
              <p style={{ margin: '0 0 8px' }}>Prueba a añadir el nombre de su empresa para mejorar los resultados.</p>
              <p style={{ margin: 0 }}>Si el email no es público en Internet, no podremos encontrarlo.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {result.results.map(({ email, sources, apariciones }) => (
              <div key={email} style={{ background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${apariciones > 1 ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '10px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <a href={`mailto:${email}`} style={{ color: 'var(--accent, #a78bfa)', fontWeight: 600, fontSize: '15px', textDecoration: 'none', wordBreak: 'break-all' }}>
                    {email}
                  </a>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '99px', fontWeight: 600,
                      background: apariciones > 1 ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)',
                      color: apariciones > 1 ? '#4ade80' : 'inherit' }}>
                      {apariciones > 1 ? `✓ ${apariciones} fuentes` : '1 fuente'}
                    </span>
                    <button onClick={() => navigator.clipboard.writeText(email)} style={ghostBtn}>
                      Copiar
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {sources.slice(0, 3).map((src, i) => (
                    <p key={i} style={{ margin: 0, fontSize: '12px', opacity: 0.45, overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {src.startsWith('http') ? '🔗 ' : '🔎 '}{src}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { fontSize: '12px', fontWeight: 600, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' };
const tagStyle   = { fontSize: '12px', padding: '4px 10px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', opacity: 0.7 };
const ghostBtn   = { background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'inherit',
  borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', fontSize: '12px' };
