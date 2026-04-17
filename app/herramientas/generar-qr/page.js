'use client';
import { useState, useEffect, useRef } from 'react';
import { useT } from '../../../components/LocaleProvider';

const DOT_STYLES = ['square', 'dots', 'rounded', 'classy', 'classy-rounded', 'extra-rounded'];
const ERROR_LEVELS = ['L', 'M', 'Q', 'H'];

const defaultOpts = {
  text: '',
  dotStyle: 'rounded',
  colorFg: '#a78bfa',
  colorBg: '#0f1117',
  errorLevel: 'M',
  size: 300,
};

export default function GenerarQrPage() {
  const t = useT('generarQr');
  const [opts, setOpts] = useState(defaultOpts);
  const [input, setInput] = useState('');
  const [qrObj, setQrObj] = useState(null);
  const previewRef = useRef();

  const set = (k) => (v) => setOpts(o => ({ ...o, [k]: v }));

  // Build / rebuild QR whenever opts change
  useEffect(() => {
    if (!opts.text) return;
    let alive = true;

    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      if (!alive) return;
      const qr = new QRCodeStyling({
        width: opts.size,
        height: opts.size,
        data: opts.text,
        dotsOptions: { type: opts.dotStyle, color: opts.colorFg },
        cornersSquareOptions: { type: 'extra-rounded', color: opts.colorFg },
        cornersDotOptions: { color: opts.colorFg },
        backgroundOptions: { color: opts.colorBg },
        qrOptions: { errorCorrectionLevel: opts.errorLevel },
        imageOptions: { crossOrigin: 'anonymous' },
      });
      setQrObj(qr);
      if (previewRef.current) {
        previewRef.current.innerHTML = '';
        qr.append(previewRef.current);
      }
    });

    return () => { alive = false; };
  }, [opts]);

  // Re-append when ref mounts after opts already set
  useEffect(() => {
    if (qrObj && previewRef.current && opts.text) {
      previewRef.current.innerHTML = '';
      qrObj.append(previewRef.current);
    }
  }, [qrObj]);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setOpts(o => ({ ...o, text: input.trim() }));
  };

  const download = (ext) => {
    if (!qrObj) return;
    qrObj.download({ name: 'qr-code', extension: ext });
  };

  const label = (txt) => (
    <span style={{ fontSize: '12px', fontWeight: 600, opacity: 0.55, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {txt}
    </span>
  );

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1><span className="highlight">{t.title}</span></h1>
        <p className="subtitle">{t.subtitle}</p>
      </div>

      {/* Input */}
      <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '10px', maxWidth: '680px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <input
          className="yt-input"
          type="text"
          placeholder={t.placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, minWidth: '260px' }}
        />
        <button type="submit" className="btn-primary" disabled={!input.trim()}>
          {t.generate}
        </button>
      </form>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Customisation panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '220px', flex: '0 0 auto' }}>

          {/* Dot style */}
          <div>
            {label(t.style)}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {DOT_STYLES.map(s => (
                <button
                  key={s}
                  onClick={() => set('dotStyle')(s)}
                  style={{
                    padding: '5px 11px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                    background: opts.dotStyle === s ? 'rgba(167,139,250,0.15)' : 'transparent',
                    border: `1px solid ${opts.dotStyle === s ? 'var(--accent,#a78bfa)' : 'rgba(255,255,255,0.15)'}`,
                    color: opts.dotStyle === s ? 'var(--accent,#a78bfa)' : 'inherit',
                    fontWeight: opts.dotStyle === s ? 700 : 400,
                  }}
                >
                  {t.styles[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              {label(t.colorFg)}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input type="color" value={opts.colorFg} onChange={e => set('colorFg')(e.target.value)}
                  style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none', padding: 0 }} />
                <span style={{ fontSize: '13px', fontFamily: 'monospace', opacity: 0.7 }}>{opts.colorFg}</span>
              </div>
            </div>
            <div>
              {label(t.colorBg)}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input type="color" value={opts.colorBg} onChange={e => set('colorBg')(e.target.value)}
                  style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none', padding: 0 }} />
                <span style={{ fontSize: '13px', fontFamily: 'monospace', opacity: 0.7 }}>{opts.colorBg}</span>
              </div>
            </div>
          </div>

          {/* Error correction */}
          <div>
            {label(t.errorLevel)}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              {ERROR_LEVELS.map(l => (
                <button
                  key={l}
                  onClick={() => set('errorLevel')(l)}
                  title={t.errorLevels[l]}
                  style={{
                    padding: '5px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 700,
                    background: opts.errorLevel === l ? 'rgba(167,139,250,0.15)' : 'transparent',
                    border: `1px solid ${opts.errorLevel === l ? 'var(--accent,#a78bfa)' : 'rgba(255,255,255,0.15)'}`,
                    color: opts.errorLevel === l ? 'var(--accent,#a78bfa)' : 'inherit',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '11px', opacity: 0.4, marginTop: '5px' }}>{t.errorLevels[opts.errorLevel]}</p>
          </div>

          {/* Size */}
          <div>
            {label(`${t.size} — ${opts.size}px`)}
            <input
              type="range" min={150} max={600} step={50}
              value={opts.size}
              onChange={e => set('size')(Number(e.target.value))}
              style={{ display: 'block', width: '100%', marginTop: '8px', accentColor: 'var(--accent,#a78bfa)' }}
            />
          </div>

          {/* Download buttons */}
          {opts.text && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => download('png')}>{t.download}</button>
              <button className="btn-secondary" onClick={() => download('svg')}>{t.downloadSvg}</button>
            </div>
          )}
        </div>

        {/* Preview */}
        {opts.text && (
          <div style={{
            background: opts.colorBg, borderRadius: '16px', padding: '16px',
            border: '1px solid rgba(255,255,255,0.08)', display: 'inline-block',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <div ref={previewRef} />
          </div>
        )}
      </div>
    </div>
  );
}
