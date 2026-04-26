'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useT } from '../../../components/LocaleProvider';

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const f1 = lat1 * Math.PI / 180, f2 = lat2 * Math.PI / 180;
  const df = (lat2 - lat1) * Math.PI / 180, dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(df / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fountainIcon(L, selected) {
  const size = selected ? 30 : 22;
  const bg = selected ? '#0ea5e9' : '#38bdf8';
  const ring = selected ? 'box-shadow:0 0 0 3px rgba(14,165,233,.4),0 2px 12px rgba(14,165,233,.7)' : 'box-shadow:0 2px 8px rgba(14,165,233,.4)';
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${bg};border-radius:50%;border:2.5px solid #fff;${ring};display:flex;align-items:center;justify-content:center;font-size:${selected ? 14 : 11}px;transition:all .2s">💧</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export default function FuenteCercanaPage() {
  const t = useT('fuenteCercana');
  const mapDivRef   = useRef(null);
  const mapRef      = useRef(null);
  const leafletRef  = useRef(null);
  const userMarkerRef    = useRef(null);
  const fountainMarkersRef = useRef([]);
  const routeLayerRef    = useRef(null);
  const userPosRef       = useRef(null);
  const fountainsRef     = useRef([]);

  const [phase, setPhase]       = useState('idle');
  const [error, setError]       = useState('');
  const [fountains, setFountains] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routePhase, setRoutePhase] = useState('idle');

  /* ── Map init ─────────────────────────────────────────────────── */
  const ensureMap = useCallback(async (lat, lon) => {
    const L = leafletRef.current || (await import('leaflet')).default;
    leafletRef.current = L;

    if (!mapRef.current) {
      // Inject leaflet CSS once
      if (!document.querySelector('link[data-leaflet]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.dataset.leaflet = '1';
        document.head.appendChild(link);
      }

      const map = L.map(mapDivRef.current, {
        center: [lat, lon], zoom: 15,
        zoomControl: false,
      });

      // Beautiful dark minimalist tiles — CartoDB Dark Matter
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a> &copy; <a href="https://carto.com">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      // Zoom control bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapRef.current = map;
    } else {
      mapRef.current.setView([lat, lon], 15);
    }
    return mapRef.current;
  }, []);

  /* ── Route calc ───────────────────────────────────────────────── */
  const calcRoute = useCallback(async (idx) => {
    const { lat, lon } = userPosRef.current || {};
    const f = fountainsRef.current[idx];
    if (!lat || !f || !mapRef.current) return;

    setRoutePhase('loading');
    setRouteInfo(null);
    if (routeLayerRef.current) { routeLayerRef.current.remove(); routeLayerRef.current = null; }

    try {
      const url = `https://router.project-osrm.org/route/v1/foot/${lon},${lat};${f.lon},${f.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.code !== 'Ok' || !data.routes?.length) throw new Error();

      const route = data.routes[0];
      const coords = route.geometry.coordinates.map(([lng, lt]) => [lt, lng]);
      const L = leafletRef.current;

      const line = L.polyline(coords, {
        color: '#0ea5e9', weight: 4, opacity: 0.9, lineCap: 'round', lineJoin: 'round',
      }).addTo(mapRef.current);
      routeLayerRef.current = line;

      mapRef.current.fitBounds(line.getBounds(), { padding: [55, 55], maxZoom: 17 });
      setRouteInfo({ distance: route.distance, duration: route.duration });
      setRoutePhase('done');
    } catch {
      setRoutePhase('error');
    }
  }, []);

  /* ── Update marker icons when selection changes ───────────────── */
  useEffect(() => {
    const L = leafletRef.current;
    if (!L) return;
    fountainMarkersRef.current.forEach((m, i) => m?.setIcon(fountainIcon(L, i === selectedIdx)));
  }, [selectedIdx]);

  /* ── Main search ──────────────────────────────────────────────── */
  const search = useCallback(async () => {
    setPhase('locating');
    setError('');
    setFountains([]);
    setSelectedIdx(0);
    setRouteInfo(null);
    setRoutePhase('idle');
    if (routeLayerRef.current) { routeLayerRef.current.remove(); routeLayerRef.current = null; }

    // Geolocation
    let lat, lon;
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 12000 })
      );
      lat = pos.coords.latitude; lon = pos.coords.longitude;
    } catch {
      setPhase('error'); setError(t.errorGeo); return;
    }

    userPosRef.current = { lat, lon };
    setPhase('searching');
    const map = await ensureMap(lat, lon);
    const L = leafletRef.current;

    // Clear old markers
    if (userMarkerRef.current) { userMarkerRef.current.remove(); userMarkerRef.current = null; }
    fountainMarkersRef.current.forEach(m => m?.remove());
    fountainMarkersRef.current = [];
    fountainsRef.current = [];

    // User marker
    const userIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;background:#a78bfa;border-radius:50%;border:2.5px solid #fff;box-shadow:0 0 0 4px rgba(167,139,250,.3),0 0 14px rgba(167,139,250,.8)"></div>`,
      className: '', iconSize: [16, 16], iconAnchor: [8, 8],
    });
    userMarkerRef.current = L.marker([lat, lon], { icon: userIcon }).addTo(map).bindPopup('📍 ' + t.you);

    // Overpass query
    let rawFountains = [];
    try {
      const q = `[out:json][timeout:25];(
  node["amenity"="drinking_water"](around:2000,${lat},${lon});
  node["amenity"="fountain"]["drinking_water"!="no"](around:2000,${lat},${lon});
);out body;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: q });
      const data = await res.json();
      rawFountains = (data.elements || [])
        .map(f => ({ ...f, dist: haversine(lat, lon, f.lat, f.lon) }))
        .sort((a, b) => a.dist - b.dist);
    } catch {
      setPhase('error'); setError(t.errorApi); return;
    }

    if (rawFountains.length === 0) { setPhase('done'); return; }

    fountainsRef.current = rawFountains;
    setFountains(rawFountains);

    // Add fountain markers
    rawFountains.forEach((f, i) => {
      const name = f.tags?.name || (i === 0 ? t.nearest : t.fountain);
      const marker = L.marker([f.lat, f.lon], { icon: fountainIcon(L, i === 0) })
        .addTo(map)
        .bindPopup(`<b style="color:#0ea5e9">${name}</b><br><span style="font-size:12px">${t.distance(f.dist)}</span>`);

      marker.on('click', () => {
        setSelectedIdx(i);
        calcRoute(i);
      });

      fountainMarkersRef.current.push(marker);
    });

    // Fit to show user + nearest
    map.fitBounds(
      L.latLngBounds([[lat, lon], [rawFountains[0].lat, rawFountains[0].lon]]),
      { padding: [70, 70], maxZoom: 17 }
    );

    setPhase('done');
    // Auto-calc route to nearest
    calcRoute(0);
  }, [t, ensureMap, calcRoute]);

  useEffect(() => () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } }, []);

  const loading = phase === 'locating' || phase === 'searching';
  const selected = fountains[selectedIdx];

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1><span className="highlight">{t.title}</span></h1>
        <p className="subtitle">{t.subtitle}</p>
      </div>

      {/* Map */}
      <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 8px 40px rgba(0,0,0,.6)', marginBottom: 20 }}>
        <div ref={mapDivRef} style={{ width: '100%', height: 440 }} />

        {phase === 'idle' && (
          <div style={{
            position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#0d1a2d,#0f2540)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
          }}>
            <div style={{ fontSize: 54 }}>💧</div>
            <p style={{ fontSize: 15, opacity: 0.6, textAlign: 'center', maxWidth: 280, lineHeight: 1.5 }}>{t.subtitle}</p>
            <button className="btn-primary" onClick={search}>📍 {t.locate}</button>
          </div>
        )}

        {(loading || routePhase === 'loading') && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(8,16,30,0.92)', padding: '9px 16px', fontSize: 13,
            textAlign: 'center', letterSpacing: '.01em',
          }}>
            {loading ? (phase === 'locating' ? t.locating : t.searching) : t.routing}
          </div>
        )}

        {/* Hint overlay once map is loaded */}
        {phase === 'done' && fountains.length > 1 && (
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(8,16,30,0.82)', borderRadius: 20, padding: '5px 14px',
            fontSize: 12, opacity: 0.8, whiteSpace: 'nowrap', pointerEvents: 'none',
          }}>
            {t.clickHint}
          </div>
        )}
      </div>

      {/* Result card */}
      {phase === 'done' && (
        <div style={{ marginBottom: 16 }}>
          {fountains.length === 0 ? (
            <p style={{ color: '#f87171', fontSize: 14 }}>{t.noFountains}</p>
          ) : (
            <>
              <p style={{ fontSize: 13, opacity: 0.45, marginBottom: 12 }}>{t.found(fountains.length)} · {t.clickHintShort}</p>

              <div style={{
                background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.22)',
                borderRadius: 12, padding: '16px 18px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 14 }}>
                  <span style={{ fontSize: 28 }}>💧</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>
                      {selected?.tags?.name || (selectedIdx === 0 ? t.nearest : t.fountain)}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.6, marginTop: 2 }}>
                      {selected ? t.distance(selected.dist) : ''}
                    </div>
                  </div>
                  {selected && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lon}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: 'var(--accent,#a78bfa)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                    >
                      {t.openMaps}
                    </a>
                  )}
                </div>

                {routePhase === 'done' && routeInfo && (
                  <div style={{
                    paddingTop: 12,
                    borderTop: '1px solid rgba(14,165,233,0.15)', fontSize: 14,
                  }}>
                    <span>📏 <b>{t.distance(routeInfo.distance)}</b> {t.walkingRoute}</span>
                  </div>
                )}
                {routePhase === 'error' && (
                  <p style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>{t.errorRoute}</p>
                )}
              </div>

              {/* Fountain list */}
              {fountains.length > 1 && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {fountains.map((f, i) => (
                    <button
                      key={f.id}
                      onClick={() => { setSelectedIdx(i); calcRoute(i); fountainMarkersRef.current[i]?.openPopup(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: i === selectedIdx ? 'rgba(14,165,233,0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${i === selectedIdx ? 'rgba(14,165,233,0.35)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 8, padding: '9px 14px', cursor: 'pointer', color: 'inherit', textAlign: 'left', width: '100%',
                        transition: 'all .15s',
                      }}
                    >
                      <span style={{ fontSize: 16, minWidth: 20 }}>💧</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: i === selectedIdx ? 600 : 400 }}>
                        {f.tags?.name || (i === 0 ? t.nearest : t.fountain)}
                      </span>
                      <span style={{ fontSize: 12, opacity: 0.55 }}>{t.distance(f.dist)}</span>
                      {i === selectedIdx && <span style={{ fontSize: 11, color: '#0ea5e9' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {phase === 'error' && (
        <div style={{ marginBottom: 16, color: '#f87171', fontSize: 14, background: 'rgba(248,113,113,.07)', border: '1px solid rgba(248,113,113,.2)', borderRadius: 8, padding: '10px 14px' }}>
          ❌ {error}
        </div>
      )}

      {(phase === 'done' || phase === 'error') && (
        <button onClick={search} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.15)', color: 'inherit', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 13, marginTop: 4 }}>
          🔄 {t.retry}
        </button>
      )}
    </div>
  );
}
