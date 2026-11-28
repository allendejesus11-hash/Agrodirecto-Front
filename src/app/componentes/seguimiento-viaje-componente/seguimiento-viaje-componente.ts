import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import type { SeguimientoLote, MensajeChat, Lote, SolicitudChat } from '../../modelos/agro-modelos';
import { interval, Subscription, startWith, switchMap, catchError, EMPTY, firstValueFrom } from 'rxjs';

import { cargarLeaflet, agregarMapaBase, punto, geocodificar, consultarRuta, fechaPeru, enlaceMapa } from '../../servicios/mapas-servicio';
import type { PuntoMapa, RutaMapa } from '../../servicios/mapas-servicio';
interface ResumenRuta {
  distanciaKm: number | null;
  duracionMin: number | null;
  etaAuto: string | null;
  observacion: string;
}

@Component({
  selector: 'app-seguimiento-viaje-componente',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatButtonModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './seguimiento-viaje-componente.html',
  styleUrl: './seguimiento-viaje-componente.css',
})
export class SeguimientoViajeComponente implements OnInit, OnDestroy {
  private api = inject(AgroApiServicio);
  private sesion = inject(SesionServicio);
  private route = inject(ActivatedRoute);

  private watchId?: number;
  private chatSubscription?: Subscription;
  private pollingSubscription?: Subscription;
  private versionVista = 0;
  private versionMapa = 0;
  private versionDibujo = 0;
  private destruido = false;
  mapaError = signal('');
  guardandoUbicacion = signal(false);
  guardandoPuntos = signal(false);
  buscandoPuntos = signal(false);
  puntosConfirmados = signal(false);
  modoPunto = signal<'origen' | 'destino' | null>(null);
  controlLatOrigen = new FormControl<number | null>(null);
  controlLonOrigen = new FormControl<number | null>(null);
  controlLatDestino = new FormControl<number | null>(null);
  controlLonDestino = new FormControl<number | null>(null);
  etaManual = signal(false);
  enlaceMapa = enlaceMapa;
  private mapa: any;
  private capasMapa: any;
  private origenPunto: PuntoMapa | null = null;
  private destinoPunto: PuntoMapa | null = null;
  private claveMapa = '';
  private claveEncuadre = '';

  gpsActivo = signal(false);
  cargandoRuta = signal(false);
  resumenRuta = signal<ResumenRuta>({
    distanciaKm: null,
    duracionMin: null,
    etaAuto: null,
    observacion: 'Aún no hay suficiente información para calcular la ruta.'
  });

  controlEta = new FormControl('');
  controlLatitud = new FormControl<number | null>(null);
  controlLongitud = new FormControl<number | null>(null);

  cargando = signal(true);
  error = signal('');
  mensaje = signal('');

  lotes = signal<Lote[]>([]);
  loteActivo = signal<Lote | null>(null);
  seguimiento = signal<SeguimientoLote | null>(null);
  mensajes = signal<MensajeChat[]>([]);
  solicitudChat = signal<SolicitudChat | null>(null);
  idSolicitud = signal<number | null>(null);

  mostrarChat = signal(false);
  mostrarRetraso = signal(false);
  enviandoMensaje = signal(false);
  reportandoRetraso = signal(false);

  controlMensaje = new FormControl('', [Validators.required, Validators.maxLength(500)]);
  controlRetraso = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(250)]);

  get esTransportista() { return this.sesion.rol === 'transportista'; }
  get esProductor() { return this.sesion.rol === 'productor'; }
  get idMiUsuario() { return this.sesion.idUsuario; }

  ngOnInit(): void {
    const id = this.sesion.idUsuario!;
    const rol = this.sesion.rol;
    if (rol === 'transportista') {
      this.api.listarLotesTransportista(id, 'activos').subscribe({
        next: (l) => { this.lotes.set(l); this.cargando.set(false); },
        error: () => { this.error.set('No se pudieron cargar los lotes.'); this.cargando.set(false); }
      });
    } else {
      this.api.lotesDeProductor(id).subscribe({
        next: (l) => { this.lotes.set(l.filter(x => ['en_transito', 'con_retraso'].includes(x.estadoLote))); this.cargando.set(false); },
        error: () => { this.error.set('No se pudieron cargar los lotes.'); this.cargando.set(false); }
      });
    }
  }

  verSeguimiento(lote: Lote): void {
    this.limpiarVista();
    const version = this.versionVista;
    this.error.set(''); this.mensaje.set(''); this.mapaError.set('');
    this.controlLatitud.reset(); this.controlLongitud.reset(); this.controlEta.reset();
    this.etaManual.set(false);
    this.loteActivo.set(lote); this.seguimiento.set(null); this.mensajes.set([]);
    this.usarPuntosPersistidos(lote);
    void this.actualizarMapaYResumen();

    this.pollingSubscription = interval(30000).pipe(startWith(0), switchMap(() =>
      this.api.seguimientoLote(lote.idLote).pipe(catchError(() => {
        if (this.vistaActual(version)) this.error.set('No se pudo obtener el seguimiento. Se volverá a intentar.');
        return EMPTY;
      }))
    )).subscribe(s => {
      if (!this.vistaActual(version) || this.guardandoUbicacion() || this.guardandoPuntos()) return;
      this.recibirSeguimiento(s);
    });
    this.api.listarSolicitudesChat().subscribe({
      next: solicitudes => {
        if (!this.vistaActual(version)) return;
        const sol = solicitudes.find(s => s.lote?.idLote === lote.idLote && s.estadoSolicitud === 'aprobado');
        if (sol) { this.idSolicitud.set(sol.idSolicitud); this.solicitudChat.set(sol); }
      }, error: () => { if (this.vistaActual(version)) this.error.set('No se pudieron consultar los chats.'); }
    });
  }

  private vistaActual(version: number): boolean {
    return !this.destruido && version === this.versionVista && !!this.loteActivo();
  }
  private recibirSeguimiento(s: SeguimientoLote): void {
    if (!this.seguimiento() && punto(s.latitud,s.longitud)) {
      this.controlLatitud.setValue(s.latitud!); this.controlLongitud.setValue(s.longitud!);
    }
    this.seguimiento.set(s);
    this.usarPuntosPersistidos(s);
    void this.actualizarMapaYResumen();
  }
  private usarPuntosPersistidos(s: Partial<Lote>): void {
    const origen = punto(s.latitudOrigen, s.longitudOrigen);
    const destino = punto(s.latitudDestino, s.longitudDestino);
    if (origen && destino) {
      const cambio = !this.puntosConfirmados() || this.origenPunto?.lat !== origen.lat || this.origenPunto?.lon !== origen.lon || this.destinoPunto?.lat !== destino.lat || this.destinoPunto?.lon !== destino.lon;
      this.origenPunto = origen; this.destinoPunto = destino;
      this.puntosConfirmados.set(true);
      if (cambio) this.rellenarPuntos(origen, destino);
    }
  }
  private rellenarPuntos(a: PuntoMapa | null,b: PuntoMapa | null): void {
    this.controlLatOrigen.setValue(a?.lat ?? null); this.controlLonOrigen.setValue(a?.lon ?? null);
    this.controlLatDestino.setValue(b?.lat ?? null); this.controlLonDestino.setValue(b?.lon ?? null);
  }
  async buscarPuntosRuta(): Promise<void> {
    const l = this.loteActivo(), v = this.versionVista;
    if (!l || !this.esTransportista || this.buscandoPuntos() || this.guardandoPuntos()) return;
    this.buscandoPuntos.set(true); this.mapaError.set('');
    const a = await geocodificar(l.origen || '');
    const b = await geocodificar(l.destino || '');
    if (!this.vistaActual(v)) return;
    this.buscandoPuntos.set(false);
    // Las sugerencias no se guardan hasta que el transportista las confirme.
    this.rellenarPuntos(a || punto(this.controlLatOrigen.value,this.controlLonOrigen.value),b || punto(this.controlLatDestino.value,this.controlLonDestino.value));
    this.previsualizarPuntos();
    this.mapaError.set(a && b ? 'Ubicaciones sugeridas. Verifica los marcadores antes de guardar.' : 'No se localizaron todas las direcciones. Completa los puntos en el mapa o con coordenadas.');
  }
  elegirPunto(tipo:'origen'|'destino'): void {
    this.modoPunto.set(tipo);
    this.mapaError.set(`Haz clic en el mapa para seleccionar el ${tipo}.`);
    document.getElementById('seguimiento-mapa')?.scrollIntoView({behavior:'smooth',block:'center'});
  }
  previsualizarPuntos(): void {
    this.modoPunto.set(null);
    const a = punto(this.controlLatOrigen.value,this.controlLonOrigen.value);
    const b = punto(this.controlLatDestino.value,this.controlLonDestino.value);
    // Solo se previsualiza. La ruta/ETA compartidos usan los datos guardados.
    void this.dibujarMapa(this.posicionActual(),null,a,b,true);
  }
  async guardarPuntos(): Promise<void> {
    const l=this.loteActivo(), v=this.versionVista;
    if (!l || !this.esTransportista || this.guardandoPuntos() || this.guardandoUbicacion()) return;
    const a=punto(this.controlLatOrigen.value,this.controlLonOrigen.value), b=punto(this.controlLatDestino.value,this.controlLonDestino.value);
    if (!a || !b) {this.error.set('Completa las cuatro coordenadas de origen y destino.');return;}
    this.guardandoPuntos.set(true); this.error.set(''); this.mapaError.set('');
    this.detenerGPS();
    try {
      const s=await firstValueFrom(this.api.guardarPuntosRuta(l.idLote,{latitudOrigen:a.lat,longitudOrigen:a.lon,latitudDestino:b.lat,longitudDestino:b.lon}));
      if (!this.vistaActual(v)) return;
      this.claveMapa=''; this.claveEncuadre=''; this.modoPunto.set(null);
      this.recibirSeguimiento(s); this.mensaje.set('Origen y destino guardados en la base de datos.');
      // Si el ETA anterior ya no corresponde al destino, se muestra una estimación
      // basada en la última posición. El próximo registro de posición persiste el ETA.
    } catch { if(this.vistaActual(v)) this.error.set('No se pudieron guardar los puntos de la ruta.'); }
    finally { if(this.vistaActual(v)) this.guardandoPuntos.set(false); }
  }

  abrirChat(): void {
    const id = this.idSolicitud();
    if (id === null) { this.error.set('No hay chat habilitado para este lote.'); return; }
    this.mostrarChat.set(true);
    this.chatSubscription?.unsubscribe();
    this.chatSubscription = interval(5000)
      .pipe(startWith(0), switchMap(() => this.api.mensajesChat(id).pipe(catchError(() => { this.error.set('No se pudo consultar el chat.'); return EMPTY; }))))
      .subscribe(m => { if (this.idSolicitud() === id) this.mensajes.set(m); });
  }

  enviarMensaje(): void {
    const id = this.idSolicitud();
    const texto = this.controlMensaje.value?.trim();
    if (!texto || id === null || this.controlMensaje.invalid || this.enviandoMensaje()) return;

    this.enviandoMensaje.set(true);
    this.api.enviarMensaje(id, texto).subscribe({
      next: (m) => {
        this.mensajes.update(ms => ms.some(x => x.idMensaje === m.idMensaje) ? ms : [...ms, m]);
        this.controlMensaje.reset();
        this.enviandoMensaje.set(false);
      },
      error: () => {
        this.error.set('No se pudo enviar el mensaje.');
        this.enviandoMensaje.set(false);
      }
    });
  }

  reportarRetraso(): void {
    const motivo = this.controlRetraso.value?.trim();
    const lote = this.loteActivo();
    if (!motivo || !lote || this.controlRetraso.invalid || this.reportandoRetraso()) return;

    const version = this.versionVista;
    this.reportandoRetraso.set(true);
    this.api.reportarRetraso(lote.idLote, motivo).subscribe({
      next: (s) => {
        if (!this.vistaActual(version)) return;
        this.recibirSeguimiento(s);
        this.mensaje.set('Retraso reportado correctamente.');
        this.mostrarRetraso.set(false);
        this.controlRetraso.reset();
        this.reportandoRetraso.set(false);
      },
      error: () => {
        if (!this.vistaActual(version)) return;
        this.error.set('No se pudo reportar el retraso.');
        this.reportandoRetraso.set(false);
      }
    });
  }

  cerrarChat(): void {
    this.mostrarChat.set(false);
    this.chatSubscription?.unsubscribe();
  }

  async registrarUbicacionManual(): Promise<void> {
    const p = punto(this.controlLatitud.value, this.controlLongitud.value);
    if (!p) { this.error.set('Introduce latitud y longitud válidas.'); return; }
    this.detenerGPS();
    await this.guardarUbicacion(p);
  }

  private async guardarUbicacion(p: PuntoMapa, desdeGps = false): Promise<void> {
    const lote=this.loteActivo(), version=this.versionVista;
    if (!lote || !this.esTransportista || this.guardandoUbicacion() || this.guardandoPuntos()) return;
    if (this.etaManual() && !this.controlEta.value) { this.error.set('Ingresa una fecha y hora estimada o selecciona cálculo automático.'); return; }
    this.guardandoUbicacion.set(true); this.error.set(''); this.mensaje.set('');
    try {
      const instante = Date.now();
      const destino=this.destinoPunto;
      const ruta=destino ? await consultarRuta(p,destino) : null;
      if (!this.vistaActual(version) || (desdeGps && !this.gpsActivo())) return;
      const eta = this.etaManual() ? this.controlEta.value || undefined : ruta ? fechaPeru(new Date(instante + ruta.duration*1000)) : undefined;
      const s=await firstValueFrom(this.api.actualizarUbicacion(lote.idLote,p.lat,p.lon,eta));
      if (!this.vistaActual(version)) return;
      this.controlLatitud.setValue(p.lat); this.controlLongitud.setValue(p.lon);
      if (!this.etaManual()) this.controlEta.setValue(eta || '');
      this.claveMapa=''; this.recibirSeguimiento(s);
      this.mensaje.set(eta ? 'Ubicación y hora estimada de llegada guardadas.' : 'Ubicación guardada. ETA pendiente: verifica el destino y el servicio de rutas.');
    } catch { if (this.vistaActual(version)) this.error.set('No se pudo registrar la ubicación.'); }
    finally { if (this.vistaActual(version)) this.guardandoUbicacion.set(false); }
  }
  compartirGPS(): void {
    if (!this.esTransportista || !this.loteActivo() || this.guardandoPuntos()) return;
    if (!window.isSecureContext || !navigator.geolocation) {
      this.error.set('El GPS automático necesita HTTPS o localhost. Puedes registrar las coordenadas manualmente.'); return;
    }
    this.detenerGPS(); this.gpsActivo.set(true); this.error.set('');
    const version=this.versionVista; let ultimoEnvio=0;
    this.watchId=navigator.geolocation.watchPosition(pos=>{
      if (!this.vistaActual(version) || !this.gpsActivo() || this.guardandoUbicacion() || Date.now()-ultimoEnvio<30000) return;
      ultimoEnvio=Date.now(); const p=punto(pos.coords.latitude,pos.coords.longitude); if(p) void this.guardarUbicacion(p,true);
    },()=>{if(this.vistaActual(version)){this.error.set('No se obtuvo el permiso o la posición GPS.');this.detenerGPS();}}, {enableHighAccuracy:true,maximumAge:10000,timeout:20000});
  }
  detenerGPS(): void {
    if (this.watchId !== undefined) navigator.geolocation.clearWatch(this.watchId);
    this.watchId=undefined; this.gpsActivo.set(false);
  }
  cambiarModoEta(manual:boolean):void {
    this.etaManual.set(manual);
    this.controlEta.setValue(manual ? (this.seguimiento()?.eta?.slice(0,16) || '') : '');
  }
  private limpiarVista():void {
    this.versionVista++; this.versionMapa++; this.versionDibujo++;
    this.detenerGPS(); this.cerrarChat(); this.pollingSubscription?.unsubscribe();
    this.idSolicitud.set(null); this.solicitudChat.set(null);
    this.mapa?.remove(); this.mapa=undefined; this.capasMapa=undefined;
    this.origenPunto=null; this.destinoPunto=null;
    this.claveMapa=''; this.claveEncuadre=''; this.modoPunto.set(null);
    this.puntosConfirmados.set(false); this.reportandoRetraso.set(false); this.mostrarRetraso.set(false); this.enviandoMensaje.set(false); this.guardandoUbicacion.set(false); this.guardandoPuntos.set(false); this.buscandoPuntos.set(false); this.cargandoRuta.set(false);
    this.rellenarPuntos(null,null);
    this.resumenRuta.set({distanciaKm:null,duracionMin:null,etaAuto:null,observacion:'Cargando la información del viaje…'});
  }
  volver():void {this.limpiarVista();this.loteActivo.set(null);this.seguimiento.set(null);}
  cerrarSesion():void {this.sesion.cerrarSesion();}
  ngOnDestroy():void {this.destruido=true;this.limpiarVista();}

  private posicionActual():PuntoMapa|null {
    const s=this.seguimiento(); return punto(s?.latitud,s?.longitud);
  }
  private async actualizarMapaYResumen():Promise<void> {
    const version=this.versionVista;
    if (!this.vistaActual(version)) return;
    const actual=this.posicionActual(), origen=this.origenPunto, destino=this.destinoPunto;
    const s=this.seguimiento();
    const clave=JSON.stringify([actual,origen,destino,s?.fechaActualizacion]);
    if (clave===this.claveMapa) return;
    this.claveMapa=clave;
    const mapaVersion=++this.versionMapa;
    this.cargandoRuta.set(true);
    // Dibujar los puntos de inmediato; el servicio de rutas puede tardar o no responder.
    void this.dibujarMapa(actual,null,origen,destino);
    const inicio=actual || origen;
    const ruta=inicio && destino ? await consultarRuta(inicio,destino) : null;
    if (!this.vistaActual(version) || mapaVersion!==this.versionMapa) return;
    // No desplazar el ETA cada 30 segundos con una posición antigua. El contenedor
    // backend usa hora UTC para fechaActualizacion; eta es hora civil de Perú.
    const marca=s?.fechaActualizacion;
    const ts=marca ? Date.parse(/(?:Z|[+-]\d\d:\d\d)$/.test(marca) ? marca : marca+'Z') : NaN;
    const etaAuto=actual && ruta && Number.isFinite(ts) ? fechaPeru(new Date(ts+ruta.duration*1000)) : null;
    let observacion='Confirma el origen y destino del lote para calcular la ruta.';
    if (origen && destino) {
      observacion = ruta ? (actual ? 'Ruta restante estimada desde la última posición registrada. No incluye tráfico en tiempo real.' : 'Ruta planificada de origen a destino. Falta registrar la posición del vehículo para calcular el ETA.') : 'No se pudo calcular la ruta por carretera. Los marcadores siguen disponibles.';
    }
    this.resumenRuta.set({distanciaKm:actual && ruta ? Math.round(ruta.distance/100)/10:null,duracionMin:actual && ruta ? Math.round(ruta.duration/60):null,etaAuto,observacion});
    await this.dibujarMapa(actual,ruta,origen,destino);
    if (this.vistaActual(version) && mapaVersion===this.versionMapa) this.cargandoRuta.set(false);
  }
  async reintentarMapa():Promise<void>{this.claveMapa='';await this.actualizarMapaYResumen();}
  private async dibujarMapa(actual:PuntoMapa|null,ruta:RutaMapa|null,origen:PuntoMapa|null,destino:PuntoMapa|null,borrador=false):Promise<void> {
    const version=this.versionVista, dibujo=++this.versionDibujo;
    try {
      const L=await cargarLeaflet();
      await new Promise<void>(resolve=>setTimeout(resolve,0));
      if (!this.vistaActual(version) || dibujo!==this.versionDibujo) return;
      const el=document.getElementById('seguimiento-mapa'); if(!el) return;
      if(!this.mapa){
        this.mapa=L.map(el,{zoomControl:true}).setView([-11.52,-75.9],6); agregarMapaBase(L,this.mapa);
        this.capasMapa=L.layerGroup().addTo(this.mapa);
        this.mapa.on('click',(e:any)=>{
          const tipo=this.modoPunto(); if(!tipo || !this.esTransportista) return;
          const p=punto(e.latlng.lat,e.latlng.lng); if(!p)return;
          if(tipo==='origen'){this.controlLatOrigen.setValue(p.lat);this.controlLonOrigen.setValue(p.lon);}
          else{this.controlLatDestino.setValue(p.lat);this.controlLonDestino.setValue(p.lon);}
          this.previsualizarPuntos(); this.mapaError.set('Punto seleccionado. Guarda los dos puntos para confirmarlos.');
        });
      }
      this.capasMapa.clearLayers(); const bounds:[number,number][]=[];
      if(ruta?.geometry.length){L.polyline(ruta.geometry,{color:'#2f7d32',weight:5,opacity:.85}).addTo(this.capasMapa);bounds.push(...ruta.geometry);}
      const agregar=(p:PuntoMapa|null,titulo:string,color:string)=>{
        if(!p)return;const icon=L.divIcon({className:'seg-pin-wrapper',html:`<div class="seg-pin" style="background:${color}"></div>`,iconSize:[18,18],iconAnchor:[9,9]});
        const popup=document.createElement('span');popup.textContent=`${titulo}: ${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}`;
        L.marker([p.lat,p.lon],{icon}).addTo(this.capasMapa).bindPopup(popup);bounds.push([p.lat,p.lon]);
      };
      agregar(origen,borrador?'Origen propuesto':'Origen','#38761d');agregar(actual,'Ubicación actual','#2b7fff');agregar(destino,borrador?'Destino propuesto':'Destino','#c62828');
      for(const c of this.seguimiento()?.cargas || this.loteActivo()?.cargas || []){
        agregar(punto(c.latitudAcopio,c.longitudAcopio),`Acopio ${c.codigoCarga}`,'#c78b17');
      }
      const encuadre=JSON.stringify(bounds);
      if(encuadre!==this.claveEncuadre){this.claveEncuadre=encuadre;
        if(bounds.length===1)this.mapa.setView(bounds[0],12);else if(bounds.length>1)this.mapa.fitBounds(bounds,{padding:[28,28],maxZoom:15});}
      setTimeout(()=>this.mapa?.invalidateSize(),100);
    } catch {if(this.vistaActual(version))this.mapaError.set('No se pudo cargar el mapa. Puedes guardar las coordenadas manualmente.');}
  }
}
