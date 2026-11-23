// Propiedades basadas en los DTO y entidades de AgroDirecto (Spring Boot).
export interface Rol { idRol: number; nombreRol: string; }
export interface Usuario {
  idUsuario: number; nombreCompleto: string; correo: string; rol: Rol;
  estadoCuenta: string; dni?: string; distrito?: string; ruc?: string; placa?: string;
  capacidadToneladas?: number; licencia?: string; ultimoAcceso?: string;
}
export interface Cultivo { idCultivo: number; nombreCultivo: string; }
export interface Carga {
  idCarga: number; codigoCarga: string; productor: Usuario; cultivo: Cultivo;
  pesoKg: number; tipoCarga: string; direccionDestino: string;
  tarifaPropuesta: number; fechaRecojo: string; esUrgente: boolean;
  estadoCarga: string; fechaPublicacion: string;
}
export interface Lote {
  idLote: number; codigoLote: string; transportista?: Usuario;
  estadoLote: string; origen: string; destino: string; fechaSalida?: string;
  fechaLlegada?: string; fleteTotal?: number; porcentajeComision?: number;
  montoComision?: number; montoNeto?: number; estadoPago?: string;
  cargas?: Carga[];
}
export interface PrecioMercado { idPrecio: number; cultivo: Cultivo; precioPorKg: number; fechaPrecio: string; }
export interface SolicitudChat { idSolicitud: number; productor: Usuario; transportista: Usuario;
  lote: Lote; estadoSolicitud: string; fechaSolicitud: string; administrador?: Usuario; }
export interface Notificacion { idNotificacion: number; titulo: string; mensaje: string;
  leida: boolean; fechaCreacion: string; usuario: Usuario; }
export interface NotificacionesRespuesta { totalNoLeidas: number; notificaciones: Notificacion[]; }
export interface LoginRespuesta { token: string; tipo: string; idUsuario: number; correo: string;
  rol: string; estadoCuenta: string; }
export interface RegistroRespuesta { idUsuario: number; correo: string; estadoCuenta: string; idRol: number; }
export interface ResumenTransacciones { mes: string; totalTransado: number; comisionAcumulada: number; }
export interface AhorroProductor { ahorroTemporada: number; ahorroMesActual: number; totalViajes: number; }
export interface ReputacionTransportista { promedioEstrellas: number | null; totalResenas: number;
  comentarios: { productor: string; estrellas: number; comentario: string }[]; }
export interface SaldoProductor { idProductor: number; saldoDisponible: number; }
