import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { AhorroProductor, Carga, Cultivo, LoginRespuesta, Lote, Notificacion,
  NotificacionesRespuesta, PrecioMercado, RegistroRespuesta, ReputacionTransportista,
  ResumenTransacciones, SaldoProductor, SolicitudChat, Usuario } from '../modelos/agro-modelos';
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
  listarCultivos(): Observable<Cultivo[]> { return this.httpClient.get<Cultivo[]>(`${this.url}/cultivos`); }
  publicarCarga(datos: { idCultivo: number; pesoKg: number; tipoCarga: string; direccionDestino: string; tarifaPropuesta: number; fechaRecojo: string; esUrgente: boolean }): Observable<Carga> {
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
  calificar(datos: { idLote: number; estrellas: number; recomienda: boolean; comentario: string }): Observable<unknown> {
    return this.httpClient.post(`${this.url}/calificaciones`, datos);
  }
}
