import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
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
import { interval, Subscription, startWith, switchMap, catchError, EMPTY } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

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
  private sanitizer = inject(DomSanitizer);
  private watchId?: number;
  gpsActivo = signal(false);
  controlEta = new FormControl('');
  controlLatitud = new FormControl<number | null>(null);
  controlLongitud = new FormControl<number | null>(null);
  private chatSubscription?: Subscription;

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

  mapaUrl = computed(() => {
    const s = this.seguimiento();
    if (s && typeof s.latitud === 'number' && typeof s.longitud === 'number' && Number.isFinite(s.latitud) && Number.isFinite(s.longitud) && Math.abs(s.latitud)<=90 && Math.abs(s.longitud)<=180) {
      const { latitud: lat, longitud: lon } = s;
      const bbox = [Math.max(-180,lon-0.05), Math.max(-90,lat-0.05), Math.min(180,lon+0.05), Math.min(90,lat+0.05)].join(',');
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`);
    }
    return null;
  });

  private pollingSubscription?: Subscription;

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
    this.detenerGPS();
    this.chatSubscription?.unsubscribe();
    this.idSolicitud.set(null); this.solicitudChat.set(null);
    this.error.set(''); this.mensaje.set('');
    this.controlLatitud.reset(); this.controlLongitud.reset(); this.controlEta.reset();
    this.loteActivo.set(lote);
    this.seguimiento.set(null);
    this.mensajes.set([]);
    this.mostrarChat.set(false);

    this.api.seguimientoLote(lote.idLote).subscribe({
      next: (s) => {if(this.loteActivo()?.idLote===lote.idLote)this.seguimiento.set(s);},
      error: () => this.error.set('No se pudo obtener el seguimiento del lote.')
    });

    // Buscar solicitud de chat aprobada para este lote
    this.api.listarSolicitudesChat().subscribe({
      next: (solicitudes) => {
        if (this.loteActivo()?.idLote !== lote.idLote) return;
        const sol = solicitudes.find(s => s.lote?.idLote === lote.idLote && s.estadoSolicitud === 'aprobado');
        if (sol) {
          this.idSolicitud.set(sol.idSolicitud);
          this.solicitudChat.set(sol);
        }
      }, error: () => this.error.set('No se pudieron consultar los chats.')
    });

    // Polling de seguimiento cada 30 s
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = interval(30000).pipe(switchMap(() => this.api.seguimientoLote(lote.idLote).pipe(catchError(() => EMPTY))))
      .subscribe(s => this.seguimiento.set(s));
  }

  abrirChat(): void {
    const id = this.idSolicitud();
    if (id === null) { this.error.set('No hay chat habilitado para este lote.'); return; }
    this.mostrarChat.set(true);
    this.chatSubscription?.unsubscribe();
    this.chatSubscription = interval(5000).pipe(startWith(0), switchMap(() => this.api.mensajesChat(id).pipe(catchError(() => { this.error.set('No se pudo consultar el chat.'); return EMPTY; }))))
      .subscribe(m => { if (this.idSolicitud() === id) this.mensajes.set(m); });
  }

  private cargarMensajes(): void {
    const id = this.idSolicitud();
    if (id === null) return;
    this.api.mensajesChat(id).subscribe({
      next: (m) => this.mensajes.set(m),
      error: () => {}
    });
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

    this.reportandoRetraso.set(true);
    this.api.reportarRetraso(lote.idLote, motivo).subscribe({
      next: (s) => {
        this.seguimiento.set(s);
        this.mensaje.set('Retraso reportado correctamente.');
        this.mostrarRetraso.set(false);
        this.controlRetraso.reset();
        this.reportandoRetraso.set(false);
      },
      error: () => {
        this.error.set('No se pudo reportar el retraso.');
        this.reportandoRetraso.set(false);
      }
    });
  }

  cerrarChat(): void { this.mostrarChat.set(false); this.chatSubscription?.unsubscribe(); }

  registrarUbicacionManual(): void {
    const l = this.loteActivo(); const lat = this.controlLatitud.value; const lon = this.controlLongitud.value;
    if (!l || !this.esTransportista || lat === null || lon === null || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat)>90 || Math.abs(lon)>180) {
      this.error.set('Introduce latitud y longitud válidas.'); return;
    }
    this.error.set('');
    this.api.actualizarUbicacion(l.idLote, lat, lon, this.controlEta.value || undefined).subscribe({
      next: s => { if(this.loteActivo()?.idLote===l.idLote){this.seguimiento.set(s); this.mensaje.set('Ubicación registrada manualmente.');} },
      error: () => this.error.set('No se pudo registrar la ubicación.')
    });
  }
  compartirGPS(): void {
    if (!this.esTransportista || !this.loteActivo()) return;
    if (!window.isSecureContext || !navigator.geolocation) {
      this.error.set('El GPS automático necesita HTTPS o localhost. Puedes registrar tus coordenadas manualmente.'); return;
    }
    this.detenerGPS();
    const id = this.loteActivo()!.idLote;
    this.gpsActivo.set(true);
    let ultimoEnvio = 0;
    this.watchId = navigator.geolocation.watchPosition(pos => {
      if (this.loteActivo()?.idLote !== id || !this.gpsActivo() || Date.now() - ultimoEnvio < 15000) return;
      ultimoEnvio = Date.now();
      this.api.actualizarUbicacion(id, pos.coords.latitude, pos.coords.longitude, this.controlEta.value || undefined).subscribe({
        next: s => { if (this.loteActivo()?.idLote === id) this.seguimiento.set(s); },
        error: () => this.error.set('No se pudo guardar la ubicación.')
      });
    }, () => { this.error.set('No se obtuvo el permiso o la posición GPS.'); this.detenerGPS(); }, {enableHighAccuracy: true, maximumAge: 10000, timeout: 20000});
  }
  detenerGPS(): void {
    if (this.watchId !== undefined) navigator.geolocation.clearWatch(this.watchId);
    this.watchId = undefined; this.gpsActivo.set(false);
  }
  volver(): void {
    this.detenerGPS(); this.cerrarChat();
    this.loteActivo.set(null);
    this.pollingSubscription?.unsubscribe();
  }

  cerrarSesion(): void {
    this.sesion.cerrarSesion();
  }

  ngOnDestroy(): void {
    this.detenerGPS(); this.chatSubscription?.unsubscribe();
    this.pollingSubscription?.unsubscribe();
  }

  get idMiUsuario() { return this.sesion.idUsuario; }
}
