// Propiedades basadas en los DTO y entidades de AgroDirecto (Spring Boot).
export interface Rol { idRol: number; nombreRol: string; }
export interface Usuario {
  idUsuario: number; nombreCompleto: string; correo: string; rol: Rol;
  estadoCuenta: string; dni?: string; distrito?: string; ruc?: string; placa?: string;
  capacidadToneladas?: number; licencia?: string; ultimoAcceso?: string; premiumHasta?: string;
}
export interface Cultivo { idCultivo: number; nombreCultivo: string; }
export interface Carga {
  idCarga: number; codigoCarga: string; productor: Usuario; cultivo: Cultivo;
  pesoKg: number; tipoCarga: string; direccionDestino: string;
  latitudAcopio?: number | null; longitudAcopio?: number | null;
  latitudDestino?: number | null; longitudDestino?: number | null; idLote?: number | null;
  tarifaPropuesta: number; fechaRecojo: string; esUrgente: boolean;
  estadoCarga: string; fechaPublicacion: string;
}
export interface PuntosRuta {
  latitudOrigen: number; longitudOrigen: number;
  latitudDestino: number; longitudDestino: number;
}
export interface Lote extends Partial<PuntosRuta> {
  idLote: number; codigoLote: string; transportista?: Usuario;
  latitud?: number; longitud?: number; eta?: string; fechaActualizacion?: string;
  estadoLote: string; origen: string; destino: string; fechaSalida?: string;
  fechaLlegada?: string; fechaTransaccion?: string; fleteTotal?: number; porcentajeComision?: number;
  montoComision?: number; montoNeto?: number; estadoPago?: string;
  cargas?: Carga[];
}
export interface PrecioMercado { idPrecio: number; cultivo: Cultivo; precioPorKg: number; fechaPrecio: string; fuente?: string | null; }
export interface PersonaChat { idUsuario: number; nombreCompleto: string; }
export interface SolicitudChat { idSolicitud: number; productor: PersonaChat; transportista: PersonaChat;
  lote: Pick<Lote, 'idLote'|'codigoLote'|'destino'>; estadoSolicitud: string; fechaSolicitud: string; administrador?: PersonaChat; }
export interface Notificacion { idNotificacion: number; titulo: string; mensaje: string;
  leida: boolean; fechaCreacion: string; usuario: Usuario; }
export interface NotificacionesRespuesta { totalNoLeidas: number; notificaciones: Notificacion[]; }
export interface LoginRespuesta { token: string; tipo: string; idUsuario: number; correo: string;
  rol: string; estadoCuenta: string; }
export interface RegistroRespuesta { idUsuario: number; correo: string; estadoCuenta: string; idRol: number; }
export interface ResumenTransacciones { mes: string; totalTransado: number; comisionAcumulada: number; }
export interface AhorroProductor { ahorroTemporada: number; ahorroMesActual: number; totalViajes: number; }
export interface ReputacionTransportista { promedioEstrellas: number | null; totalResenas: number; totalViajes?: number;
  comentarios: { productor: string; estrellas: number; comentario: string }[]; }
export interface SaldoProductor { idProductor: number; saldoDisponible: number; }

// ── Nuevas interfaces para HU-12, HU-14, HU-18, HU-20, HU-21 ──────────────────

/** HU-12: Detalle financiero de un lote (EP23) */
export interface LoteFinanciero {
  idLote: number;
  codigoLote: string;
  fleteTotal: number;
  porcentajeComision: number;
  montoComision: number;
  montoNeto: number;
  estadoPago: string;
}

/** HU-18: Seguimiento en tiempo real de un lote (EP31) */
export interface SeguimientoLote extends Partial<PuntosRuta> {
  origen?: string; destino?: string; cargas?: Carga[];
  idLote: number;
  estadoLote: string;
  ubicacionActual?: string;
  latitud?: number;
  longitud?: number;
  fechaActualizacion?: string;
  motivoRetraso?: string;
  eta?: string;
}

/** HU-20: Gasto de viaje registrado por transportista (EP35) */
export interface GastoViaje {
  idGasto: number;
  idLote: number;
  categoria: string;
  monto: number;
  descripcion?: string;
  fechaGasto: string;
}

/** HU-21: Suscripción premium de un usuario (EP37) */
export interface Suscripcion {
  idUsuario: number;
  plan: string;
  activa: boolean;
  fechaVencimiento?: string;
}

/** HU-18: Mensaje de chat entre productor y transportista (EP13 / EP32) */
export interface MensajeChat {
  idMensaje: number;
  idSolicitud: number;
  emisor: PersonaChat;
  contenido: string;
  fechaEnvio: string;
}
