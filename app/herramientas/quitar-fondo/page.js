'use client';
import { useState, useRef, useCallback } from 'react';

export default function QuitarFondoPage() {
  const [original, setOriginal] = useState(null);
  const [result, setResult]     = useState(null);
  const [status, setStatus]     = useState('idle'); // idle | loading | done | error
  const [progress, setProgress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setResult(null);
    setStatus('loading');
    setProgress('Cargando modelo de IA…');
    setOriginal(URL.createObjectURL(file));

    try {
      const { removeBackground } = await import('@imgly/background-removal');
      setProgress('Procesando imagen…');
      const blob = await removeBackground(file, {
        publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/dist/',
        progress: (key, current, total) => {
          if (key.startsWith('fetch:')) {
            const pct = Math.round((current / total) * 100);
            setProgress(`Descargando modelo… ${pct}%`);
          }
        },
      });
      setResult(URL.createObjectURL(blob));
      setStatus('done');
    } catch (e) {
      console.error(e);
      setErrorMsg(e?.message || String(e));
      setStatus('error');
    }
  }, []);

  const onFileChange = (e) => processFile(e.target.files[0]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  const onDownload = () => {
    const a = document.createElement('a');
    a.href = result;
    a.download = 'sin-fondo.png';
    a.click();
  };

  const onReset = () => {
    setOriginal(null);
    setResult(null);
    setStatus('idle');
    setProgress('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1>✂️ <span className="highlight">Quitar fondo</span></h1>
        <p className="subtitle">
          IA en el navegador — la imagen nunca sale de tu dispositivo.
        </p>
      </div>

      {status === 'idle' && (
        <div
          className={`drop-zone${dragging ? ' drop-zone--active' : ''}`}
          onClick={() => inputRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <div className="drop-icon">🖼</div>
          <p className="drop-label">Arrastra una imagen aquí</p>
          <p className="drop-sub">o haz clic para seleccionarla</p>
          <p className="drop-hint">JPG, PNG, WEBP — máx. 10 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
        </div>
      )}

      {status === 'loading' && (
        <div className="tool-loading">
          <div className="spinner" />
          <p>{progress}</p>
          <p className="drop-hint">La primera vez descarga el modelo (~45 MB). Las siguientes es instantáneo.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="tool-error">
          <p>Algo salió mal procesando la imagen.</p>
          {errorMsg && (
            <pre style={{ fontSize: '0.75rem', color: '#f87171', background: '#1a1d27', padding: '12px', borderRadius: '8px', maxWidth: '100%', overflowX: 'auto', textAlign: 'left', marginTop: '8px' }}>
              {errorMsg}
            </pre>
          )}
          <button className="btn-primary" onClick={onReset}>Volver a intentar</button>
        </div>
      )}

      {status === 'done' && (
        <div className="tool-result">
          <div className="result-grid">
            <div className="result-card">
              <p className="result-label">Original</p>
              <img src={original} alt="Original" className="result-img" />
            </div>
            <div className="result-card">
              <p className="result-label">Sin fondo</p>
              <div className="checker-bg">
                <img src={result} alt="Sin fondo" className="result-img" />
              </div>
            </div>
          </div>
          <div className="result-actions">
            <button className="btn-primary" onClick={onDownload}>⬇ Descargar PNG</button>
            <button className="btn-secondary" onClick={onReset}>Nueva imagen</button>
          </div>
        </div>
      )}
    </div>
  );
}
