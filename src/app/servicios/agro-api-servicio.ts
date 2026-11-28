import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  AhorroProductor, Carga, Cultivo, GastoViaje, LoginRespuesta, Lote, LoteFinanciero,
  MensajeChat, Notificacion, NotificacionesRespuesta, PrecioMercado, RegistroRespuesta,
  ReputacionTransportista, ResumenTransacciones, SaldoProductor, SeguimientoLote,
  SolicitudChat, Suscripcion, Usuario, PuntosRuta, PersonaChat
} from '../modelos/agro-modelos';

@Injectable({ providedIn: 'root' })
export class AgroApiServicio {
  private httpClient = inject(HttpClient);
  private url = environment.apiURL;

  // El mismo patrón del profesor: HttpClient + environment + Observable.
  login(correo: string, contrasena: string): Observable<LoginRespuesta> {
    return this.httpClient.post<LoginRespuesta>(`${this.url}/auth/login`, { correo, contrasena });
  }
  registrarProductor(datos: { nombreCompleto: string; correo: string; contrasena: string; dni: string; distrito: string }): Observable<RegistroRespuesta> {
    return this.httpClient.post<RegistroRespuesta>(`${this.url}/auth/registro-productor`, datos);
  }
  registrarTransportista(datos: { nombreCompleto: string; correo: string; contrasena: string; ruc: string; placa: string; capacidadToneladas: number; licencia: string }): Observable<RegistroRespuesta> {
    return this.httpClient.post<RegistroRespuesta>(`${this.url}/auth/registro-transportista`, datos);
  }
  consolidar(idsCargas: number[], idTransportista: number, fleteTotal: number): Observable<Lote> {return this.httpClient.post<Lote>(`${this.url}/lotes/consolidar`,{idsCargas,idTransportista,fleteTotal});}
  confirmarFlete(id: number): Observable<Lote> {return this.httpClient.patch<Lote>(`${this.url}/lotes/${id}/confirmar-flete`,{});}
  iniciarViaje(id: number): Observable<Lote> {return this.httpClient.patch<Lote>(`${this.url}/lotes/${id}/iniciar`,{});}
  lotesAdmin(): Observable<Lote[]> {return this.httpClient.get<Lote[]>(`${this.url}/lotes/admin`);}
  solicitarChats(id: number): Observable<SolicitudChat[]> {return this.httpClient.post<SolicitudChat[]>(`${this.url}/chats/solicitudes/lote/${id}`,{});}
  historialPrecios(): Observable<PrecioMercado[]> {return this.httpClient.get<PrecioMercado[]>(`${this.url}/precios-mercado/historial`);}
  importarPrecios(filas: {idCultivo:number;fecha:string;precioPorKg:number;fuente:string}[]): Observable<{importados:number}> {return this.httpClient.post<{importados:number}>(`${this.url}/precios-mercado/importar`,filas);}
  listarCultivos(): Observable<Cultivo[]> { return this.httpClient.get<Cultivo[]>(`${this.url}/cultivos`); }
  publicarCarga(datos: { idCultivo: number; pesoKg: number; tipoCarga: string; direccionDestino: string; tarifaPropuesta: number; fechaRecojo: string; esUrgente: boolean; latitudAcopio?: number; longitudAcopio?: number; latitudDestino?: number; longitudDestino?: number }): Observable<Carga> {
    return this.httpClient.post<Carga>(`${this.url}/cargas`, datos);
  }
  cancelarCarga(idCarga: number): Observable<Carga> { return this.httpClient.patch<Carga>(`${this.url}/cargas/${idCarga}/cancelar`, {}); }
  cargasDeProductor(id: number): Observable<Carga[]> { return this.httpClient.get<Carga[]>(`${this.url}/productores/${id}/cargas`); }
  lotesDeProductor(id: number): Observable<Lote[]> { return this.httpClient.get<Lote[]>(`${this.url}/productores/${id}/lotes-consolidacion`); }
  listarCargas(estado?: string): Observable<Carga[]> {
    return this.httpClient.get<Carga[]>(`${this.url}/cargas`, { params: estado ? new HttpParams().set('estado', estado) : undefined });
  }
  listarLotesTransportista(id: number, estado?: string): Observable<Lote[]> {
    return this.httpClient.get<Lote[]>(`${this.url}/transportistas/${id}/lotes`, { params: estado ? { estado } : undefined });
  }
  listarLotesProductor(id: number): Observable<Lote[]> { return this.httpClient.get<Lote[]>(`${this.url}/productores/${id}/lotes`); }
  lote(id: number): Observable<Lote> { return this.httpClient.get<Lote>(`${this.url}/lotes/${id}`); }
  listarUsuarios(idRol?: number): Observable<Usuario[]> {
    return this.httpClient.get<Usuario[]>(`${this.url}/usuarios`, { params: idRol ? { idRol } : undefined });
  }
  cambiarEstadoUsuario(id: number, estadoCuenta: 'verificado' | 'bloqueado'): Observable<Usuario> {
    return this.httpClient.patch<Usuario>(`${this.url}/usuarios/${id}/estado`, { estadoCuenta });
  }
  listarSolicitudesChat(): Observable<SolicitudChat[]> { return this.httpClient.get<SolicitudChat[]>(`${this.url}/chats/solicitudes`); }
  aprobarChat(id: number, idAdministrador: number): Observable<SolicitudChat> {
    return this.httpClient.put<SolicitudChat>(`${this.url}/chats/solicitudes/${id}/estado`, { estadoSolicitud: 'aprobado', idAdministrador });
  }
  listarPrecios(fecha?: string): Observable<PrecioMercado[]> {
    return this.httpClient.get<PrecioMercado[]>(`${this.url}/precios-mercado`, { params: fecha ? { fecha } : undefined });
  }
  notificaciones(id: number): Observable<NotificacionesRespuesta> { return this.httpClient.get<NotificacionesRespuesta>(`${this.url}/notificaciones/usuario/${id}`); }
  marcarLeida(id: number): Observable<Notificacion> { return this.httpClient.patch<Notificacion>(`${this.url}/notificaciones/${id}/leer`, {}); }
  transacciones(mes?: string): Observable<Lote[]> { return this.httpClient.get<Lote[]>(`${this.url}/transacciones`, { params: mes ? { mes } : undefined }); }
  resumenTransacciones(mes?: string): Observable<ResumenTransacciones> { return this.httpClient.get<ResumenTransacciones>(`${this.url}/reportes/transacciones/resumen`, { params: mes ? { mes } : undefined }); }
  saldoProductor(id: number): Observable<SaldoProductor> { return this.httpClient.get<SaldoProductor>(`${this.url}/productores/${id}/saldo`); }
  ahorroProductor(id: number): Observable<AhorroProductor> { return this.httpClient.get<AhorroProductor>(`${this.url}/reportes/ahorro-productor/${id}`); }
  perfilTransportista(id: number): Observable<Usuario> { return this.httpClient.get<Usuario>(`${this.url}/usuarios/${id}/transportista`); }
  reputacionTransportista(id: number): Observable<ReputacionTransportista> { return this.httpClient.get<ReputacionTransportista>(`${this.url}/reportes/reputacion-transportista/${id}`); }
  perfilAdministrador(id: number): Observable<Usuario> { return this.httpClient.get<Usuario>(`${this.url}/usuarios/${id}/administrador`); }
  retornoDisponible(): Observable<Carga[]> { return this.httpClient.get<Carga[]>(`${this.url}/cargas/retorno`); }
  asignarRetorno(idCarga: number, idLote: number): Observable<Carga> {
    return this.httpClient.patch<Carga>(`${this.url}/cargas/${idCarga}/asignar-retorno`, { idLote });
  }
  calificacionesLote(idLote: number): Observable<{ productor: Usuario }[]> {
    return this.httpClient.get<{ productor: Usuario }[]>(`${this.url}/calificaciones/lote/${idLote}`);
  }
  calificar(datos: { idLote: number; estrellas: number; recomienda: boolean; comentario: string }): Observable<unknown> {
    return this.httpClient.post(`${this.url}/calificaciones`, datos);
  }

  // ── HU-12: Pagos y comisiones del productor (EP22-EP23) ─────────────────────
  /** EP22: Saldo disponible del productor */
  saldo(id: number): Observable<SaldoProductor> {
    return this.httpClient.get<SaldoProductor>(`${this.url}/productores/${id}/saldo`);
  }
  /** EP23: Detalle financiero de un lote */
  loteFinanciero(idLote: number): Observable<LoteFinanciero> {
    return this.httpClient.get<LoteFinanciero>(`${this.url}/lotes/${idLote}/financiero`);
  }

  // ── HU-18: Seguimiento de viaje + chat (EP31-EP32-EP13) ─────────────────────
  /** EP31: Seguimiento GPS/estado del lote */
  seguimientoLote(idLote: number): Observable<SeguimientoLote> {
    return this.httpClient.get<SeguimientoLote>(`${this.url}/lotes/${idLote}/seguimiento`);
  }
  guardarPuntosRuta(idLote: number, puntos: PuntosRuta): Observable<SeguimientoLote> {
    return this.httpClient.patch<SeguimientoLote>(`${this.url}/lotes/${idLote}/puntos-ruta`, puntos);
  }
  actualizarUbicacion(idLote: number, latitud: number, longitud: number, eta?: string): Observable<SeguimientoLote> {
    return this.httpClient.patch<SeguimientoLote>(`${this.url}/lotes/${idLote}/ubicacion`, { latitud, longitud, eta });
  }
  confirmarEntrega(idLote: number, codigoValidacion: string): Observable<Lote> {
    return this.httpClient.patch<Lote>(`${this.url}/lotes/${idLote}/confirmar-entrega`, { codigoValidacion });
  }
  /** EP32: Reportar retraso en un lote */
  reportarRetraso(idLote: number, motivoRetraso: string): Observable<SeguimientoLote> {
    return this.httpClient.patch<SeguimientoLote>(`${this.url}/lotes/${idLote}/reportar-retraso`, { motivo: motivoRetraso });
  }
  /** EP13: Enviar mensaje de chat en una solicitud aprobada */
  enviarMensaje(idSolicitud: number, contenido: string): Observable<MensajeChat> {
    return this.httpClient.post<MensajeApi>(`${this.url}/chats/solicitudes/${idSolicitud}/mensajes`, { contenido })
      .pipe(map(m => convertirMensaje(m, idSolicitud)));
  }
  /** EP13: Listar mensajes de una solicitud de chat */
  mensajesChat(idSolicitud: number): Observable<MensajeChat[]> {
    return this.httpClient.get<MensajeApi[]>(`${this.url}/chats/solicitudes/${idSolicitud}/mensajes`)
      .pipe(map(ms => ms.map(m => convertirMensaje(m, idSolicitud))));
  }

  // ── HU-20: Gastos de viaje del transportista (EP35-EP36) ────────────────────
  /** EP35: Registrar un gasto de viaje */
  registrarGasto(idLote: number, datos: { categoria: string; monto: number; descripcion?: string }): Observable<GastoViaje> {
    const concepto = [datos.categoria, datos.descripcion?.trim()].filter(Boolean).join(': ');
    return this.httpClient.post<GastoApi>(`${this.url}/lotes/${idLote}/gastos`, { concepto, monto: datos.monto })
      .pipe(map(g => convertirGasto(g, idLote)));
  }
  /** EP36: Listar gastos de un lote */
  listarGastos(idLote: number): Observable<GastoViaje[]> {
    return this.httpClient.get<{ gastos: GastoApi[] }>(`${this.url}/lotes/${idLote}/gastos`)
      .pipe(map(r => r.gastos.map(g => convertirGasto(g, idLote))));
  }

  // ── HU-21: Suscripción premium (EP37-EP38) ───────────────────────────────────
  /** EP37: Activar suscripción premium */
  activarSuscripcion(idUsuario: number): Observable<Suscripcion> {
    return this.httpClient.post<SuscripcionApi>(`${this.url}/usuarios/${idUsuario}/suscripcion-premium`, { montoPagado: 49 })
      .pipe(map(s => convertirSuscripcion(s)));
  }
  /** EP38: Consultar suscripción premium */
  consultarSuscripcion(idUsuario: number): Observable<Suscripcion> {
    return this.httpClient.get<SuscripcionApi>(`${this.url}/usuarios/${idUsuario}/suscripcion-premium`)
      .pipe(map(s => convertirSuscripcion(s)));
  }
}

interface GastoApi { idGasto: number; concepto: string; monto: number; fechaHora: string; }
interface SuscripcionApi { idUsuario: number; premiumHasta: string | null; esPremium: boolean; }
interface MensajeApi { idMensaje: number; usuarioEmisor: PersonaChat; contenido: string; fechaEnvio: string; }
function convertirGasto(g: GastoApi, idLote: number): GastoViaje {
  const [primero, ...resto] = g.concepto.split(': ');
  const categorias = ['Combustible', 'Peaje', 'Alimentación', 'Mantenimiento', 'Alojamiento', 'Otro'];
  const categoria = categorias.find(c => primero.toLowerCase().startsWith(c.toLowerCase())) ?? 'Otro';
  return { idGasto: g.idGasto, idLote, categoria, monto: g.monto,
    descripcion: resto.length ? resto.join(': ') : g.concepto, fechaGasto: g.fechaHora };
}
function convertirSuscripcion(s: SuscripcionApi): Suscripcion {
  return { idUsuario: s.idUsuario, plan: 'Premium', activa: s.esPremium, fechaVencimiento: s.premiumHasta ?? undefined };
}
function convertirMensaje(m: MensajeApi, idSolicitud: number): MensajeChat {
  return { idMensaje: m.idMensaje, idSolicitud, emisor: m.usuarioEmisor, contenido: m.contenido, fechaEnvio: m.fechaEnvio };
}
