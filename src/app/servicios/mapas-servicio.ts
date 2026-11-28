// Leaflet se carga una sola vez desde CDN; no modifica package-lock.json.
export interface PuntoMapa { lat: number; lon: number; }
export interface RutaMapa { distance: number; duration: number; geometry: [number, number][]; }
export function punto(lat: unknown, lon: unknown): PuntoMapa | null {
  return typeof lat === 'number' && typeof lon === 'number' && Number.isFinite(lat)
    && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 ? {lat, lon} : null;
}
let cargaLeaflet: Promise<any> | undefined;
export function cargarLeaflet(): Promise<any> {
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (cargaLeaflet) return cargaLeaflet;
  cargaLeaflet = new Promise<any>((resolve, reject) => {
    if (!document.getElementById('leaflet-css-cdn')) {
      const css = document.createElement('link');
      css.id = 'leaflet-css-cdn'; css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      css.crossOrigin = 'anonymous';
      document.head.appendChild(css);
    }
    const js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    js.crossOrigin = 'anonymous'; js.async = true;
    const fallo = () => { clearTimeout(timer); js.remove(); cargaLeaflet = undefined; reject(new Error('Mapa no disponible')); };
    const timer = window.setTimeout(fallo, 12000);
    js.onload = () => { clearTimeout(timer); resolve((window as any).L); };
    js.onerror = fallo;
    document.head.appendChild(js);
  });
  return cargaLeaflet;
}
export function agregarMapaBase(L: any, mapa: any): void {
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mapa);
}
// Solicitudes externas sin credenciales de AgroDirecto, con timeout.
async function json(url: string): Promise<any> {
  const respuesta = await fetch(url, {signal: AbortSignal.timeout(10000), headers: {Accept: 'application/json'}, credentials: 'omit'});
  if (!respuesta.ok) throw new Error('Servicio de mapas no disponible');
  return respuesta.json();
}
// Geocodificación a solicitud del usuario. Una consulta por segundo como máximo
// por instancia del navegador; cache en la sesión. No autocompletado.
const geoCache = new Map<string, PuntoMapa>();
let colaGeo: Promise<unknown> = Promise.resolve();
let ultimoGeo = 0;
export function geocodificar(texto: string): Promise<PuntoMapa | null> {
  const clave = texto.trim().toLowerCase();
  if (!clave) return Promise.resolve(null);
  if (geoCache.has(clave)) return Promise.resolve(geoCache.get(clave)!);
  const tarea = colaGeo.then(async () => {
    if (geoCache.has(clave)) return geoCache.get(clave)!;
    await new Promise<void>(r => setTimeout(r, Math.max(0, 1100 - (Date.now() - ultimoGeo))));
    ultimoGeo = Date.now();
    try {
      const d = await json(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=pe&q=${encodeURIComponent(texto)}`);
      const p = Array.isArray(d) && d.length ? punto(Number(d[0].lat), Number(d[0].lon)) : null;
      if (p) geoCache.set(clave, p);
      return p;
    } catch { return null; }
  });
  colaGeo = tarea.catch(() => null);
  return tarea;
}
const cacheRuta = new Map<string, {fecha:number; tarea:Promise<RutaMapa | null>}>();
export function consultarRuta(a: PuntoMapa, b: PuntoMapa): Promise<RutaMapa | null> {
  const clave = [a.lat,a.lon,b.lat,b.lon].map(n=>n.toFixed(5)).join(',');
  const previo = cacheRuta.get(clave);
  if (previo && Date.now()-previo.fecha < 120000) return previo.tarea;
  const tarea = (async () => {
    try {
      const d = await json(`https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=full&geometries=geojson`);
      const r = d?.routes?.[0];
      if (!r || !Number.isFinite(r.duration) || r.duration < 0 || !Number.isFinite(r.distance) || r.distance < 0 || !Array.isArray(r.geometry?.coordinates)) return null;
      const geometry: [number, number][] = r.geometry.coordinates.map((v: number[]) => [v[1], v[0]]);
      if (!geometry.length || geometry.some(v=>!punto(v[0],v[1]))) return null;
      return {distance:r.distance,duration:r.duration,geometry};
    } catch { return null; }
  })();
  if (cacheRuta.size > 100) cacheRuta.clear();
  cacheRuta.set(clave,{fecha:Date.now(),tarea});
  return tarea;
}
// LocalDateTime de la API: fecha/hora sin zona, interpretada como hora de Perú.
export function fechaPeru(fecha: Date): string {
  const partes = new Intl.DateTimeFormat('sv-SE', { timeZone:'America/Lima', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23'}).formatToParts(fecha);
  const valor = (tipo:string) => partes.find(p=>p.type===tipo)?.value || '';
  return `${valor('year')}-${valor('month')}-${valor('day')}T${valor('hour')}:${valor('minute')}`;
}
export function enlaceMapa(lat:number, lon:number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
}
