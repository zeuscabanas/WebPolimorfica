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

export default function FuenteCercanaPage() {
  const t = useT('fuenteCercana');
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const layersRef = useRef([]);
  const routeLayerRef = useRef(null);
  const userPosRef = useRef(null);

  const [phase, setPhase] = useState('idle');
  const [error, setError] = useState('');
  const [nearest, setNearest] = useState(null);
  const [count, setCount] = useState(0);
  const [routeInfo, setRouteInfo] = useState(null);   // { distance, duration }
  const [routePhase, setRoutePhase] = useState('idle'); // idle|loading|done|error

  const ensureMap = useCallback(async (lat, lon) => {
    if (!mapDivRef.current) return null;
    const L = leafletRef.current || (await import('leaflet')).default;
    leafletRef.current = L;

    if (!mapRef.current) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const map = L.map(mapDivRef.current, { center: [lat, lon], zoom: 15 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
    } else {
      mapRef.current.setView([lat, lon], 15);
    }
    return mapRef.current;
  }, []);

  const clearLayers = useCallback(() => {
    layersRef.current.forEach(l => l.remove());
    layersRef.current = [];
  }, []);

  const clearRoute = useCallback(() => {
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }
    setRouteInfo(null);
    setRoutePhase('idle');
  }, []);

  // Calculate and draw walking route via OSRM
  const calcRoute = useCallback(async () => {
    const { lat, lon } = userPosRef.current || {};
    if (!lat || !nearest || !mapRef.current) return;
    setRoutePhase('loading');
    clearRoute();

    try {
      const url = `https://router.project-osrm.org/route/v1/foot/${lon},${lat};${nearest.lon},${nearest.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.code !== 'Ok' || !data.routes?.length) throw new Error('no route');

      const route = data.routes[0];
      const coords = route.geometry.coordinates.map(([lng, lt]) => [lt, lng]);
      const L = leafletRef.current;
      const map = mapRef.current;

      // Remove dashed straight line, draw actual route
      layersRef.current = layersRef.current.filter(l => {
        if (l._isDashedLine) { l.remove(); return false; }
        return true;
      });

      const routeLine = L.polyline(coords, {
        color: '#0ea5e9', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round',
      }).addTo(map);
      routeLayerRef.current = routeLine;

      // Fit to route
      map.fitBounds(routeLine.getBounds(), { padding: [50, 50], maxZoom: 17 });

      setRouteInfo({ distance: route.distance, duration: route.duration });
      setRoutePhase('done');
    } catch {
      setRoutePhase('error');
    }
  }, [nearest, clearRoute]);

  const search = useCallback(async () => {
    setPhase('locating');
    setError('');
    setNearest(null);
    setRouteInfo(null);
    setRoutePhase('idle');

    let lat, lon;
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 12000 })
      );
      lat = pos.coords.latitude;
      lon = pos.coords.longitude;
    } catch {
      setPhase('error');
      setError(t.errorGeo);
      return;
    }

    userPosRef.current = { lat, lon };
    setPhase('searching');
    const map = await ensureMap(lat, lon);
    const L = leafletRef.current;
    clearLayers();
    clearRoute();

    const userIcon = L.divIcon({
      html: `<div style="width:18px;height:18px;background:#a78bfa;border-radius:50%;border:3px solid #fff;box-shadow:0 0 14px rgba(167,139,250,.9)"></div>`,
      className: '', iconSize: [18, 18], iconAnchor: [9, 9],
    });
    layersRef.current.push(
      L.marker([lat, lon], { icon: userIcon }).addTo(map).bindPopup('📍 ' + t.you)
    );

    let fountains = [];
    try {
      const q = `[out:json][timeout:25];(
  node["amenity"="drinking_water"](around:2000,${lat},${lon});
  node["amenity"="fountain"]["drinking_water"!="no"](around:2000,${lat},${lon});
);out body;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: q });
      const data = await res.json();
      fountains = (data.elements || []).map(f => ({ ...f, dist: haversine(lat, lon, f.lat, f.lon) }));
      fountains.sort((a, b) => a.dist - b.dist);
    } catch {
      setPhase('error');
      setError(t.errorApi);
      return;
    }

    setCount(fountains.length);
    if (fountains.length === 0) { setPhase('done'); return; }
    setNearest(fountains[0]);

    fountains.forEach((f, i) => {
      const isNearest = i === 0;
      const icon = L.divIcon({
        html: `<div style="width:${isNearest ? 28 : 22}px;height:${isNearest ? 28 : 22}px;background:${isNearest ? '#0ea5e9' : '#38bdf8'};border-radius:50%;border:3px solid #fff;box-shadow:0 2px 10px rgba(14,165,233,.7);display:flex;align-items:center;justify-content:center;font-size:${isNearest ? 14 : 11}px">💧</div>`,
        className: '',
        iconSize: [isNearest ? 28 : 22, isNearest ? 28 : 22],
        iconAnchor: [isNearest ? 14 : 11, isNearest ? 14 : 11],
      });
      const name = f.tags?.name || (isNearest ? t.nearest : t.fountain);
      const marker = L.marker([f.lat, f.lon], { icon })
        .addTo(map)
        .bindPopup(`<b>${name}</b><br>${t.distance(f.dist)}`);
      layersRef.current.push(marker);
      if (isNearest) marker.openPopup();
    });

    // Dashed straight line (will be replaced when route is calculated)
    const line = L.polyline([[lat, lon], [fountains[0].lat, fountains[0].lon]], {
      color: '#a78bfa', weight: 3, dashArray: '8 5', opacity: 0.7,
    }).addTo(map);
    line._isDashedLine = true;
    layersRef.current.push(line);

    map.fitBounds(
      L.latLngBounds([[lat, lon], [fountains[0].lat, fountains[0].lon]]),
      { padding: [70, 70], maxZoom: 17 }
    );

    setPhase('done');
  }, [t, ensureMap, clearLayers, clearRoute]);

  useEffect(() => () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } }, []);

  const loading = phase === 'locating' || phase === 'searching';

  const fmtDuration = (secs) => {
    const m = Math.round(secs / 60);
    return m < 60 ? t.minutes(m) : t.hours(Math.floor(m / 60), m % 60);
  };

  return (
    <div className="tool-page">
      <div className="tool-header">
        <h1><span className="highlight">{t.title}</span></h1>
        <p className="subtitle">{t.subtitle}</p>
      </div>

      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,.4)', marginBottom: 20 }}>
        <div ref={mapDivRef} style={{ width: '100%', height: 420 }} />

        {phase === 'idle' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg,#162341,#1e3a5a)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            <div style={{ fontSize: 52 }}>💧</div>
            <p style={{ fontSize: 15, opacity: 0.7, textAlign: 'center', maxWidth: 300 }}>{t.subtitle}</p>
            <button className="btn-primary" onClick={search}>📍 {t.locate}</button>
          </div>
        )}

        {loading && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(10,20,40,0.88)', padding: '10px 16px', fontSize: 14, textAlign: 'center',
          }}>
            {phase === 'locating' ? t.locating : t.searching}
          </div>
        )}

        {routePhase === 'loading' && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(10,20,40,0.88)', padding: '10px 16px', fontSize: 14, textAlign: 'center',
          }}>
            {t.routing}
          </div>
        )}
      </div>

      {phase === 'done' && (
        <div style={{ marginBottom: 16 }}>
          {count === 0 ? (
            <p style={{ color: '#f87171', fontSize: 14 }}>{t.noFountains}</p>
          ) : (
            <>
              <p style={{ fontSize: 13, opacity: 0.55, marginBottom: 10 }}>{t.found(count)}</p>
              {nearest && (
                <div style={{
                  background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.25)',
                  borderRadius: 10, padding: '14px 18px', marginBottom: 12,
                }}>
                  {/* Fountain info row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: routeInfo ? 12 : 0 }}>
                    <span style={{ fontSize: 30 }}>💧</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{nearest.tags?.name || t.nearest}</div>
                      <div style={{ fontSize: 13, opacity: 0.65, marginTop: 3 }}>{t.distance(nearest.dist)}</div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${nearest.lat},${nearest.lon}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: 'var(--accent,#a78bfa)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                    >
                      {t.openMaps}
                    </a>
                  </div>

                  {/* Route info */}
                  {routeInfo && (
                    <div style={{
                      display: 'flex', gap: 20, padding: '10px 0 0', borderTop: '1px solid rgba(14,165,233,0.2)',
                      fontSize: 14, flexWrap: 'wrap',
                    }}>
                      <span>🚶 <b>{fmtDuration(routeInfo.duration)}</b></span>
                      <span>📏 <b>{t.distance(routeInfo.distance)}</b> {t.walkingRoute}</span>
                    </div>
                  )}

                  {/* Route button */}
                  {routePhase !== 'done' && (
                    <button
                      onClick={calcRoute}
                      disabled={routePhase === 'loading'}
                      className="btn-primary"
                      style={{ marginTop: 12, fontSize: 13 }}
                    >
                      {routePhase === 'loading' ? t.routing : `🗺 ${t.calcRoute}`}
                    </button>
                  )}
                  {routePhase === 'error' && (
                    <p style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>{t.errorRoute}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {phase === 'error' && (
        <div style={{ marginBottom: 16, color: '#f87171', fontSize: 14, background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.2)', borderRadius: 8, padding: '10px 14px' }}>
          ❌ {error}
        </div>
      )}

      {(phase === 'done' || phase === 'error') && (
        <button onClick={search} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.2)', color: 'inherit', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}>
          🔄 {t.retry}
        </button>
      )}
    </div>
  );
}
