import { HttpErrorResponse } from '@angular/common/http';
export function mensajeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'No se pudo conectar con la API. Comprueba que Spring Boot esté encendido en el puerto 8088.';
    const respuesta: unknown = error.error;
    if (respuesta && typeof respuesta === 'object' && 'message' in respuesta) {
      const mensaje = (respuesta as { message?: unknown }).message;
      if (typeof mensaje === 'string' && mensaje.trim()) return mensaje;
    }
    if (error.status === 401) return 'Sesión inválida o caducada. Inicia sesión nuevamente.';
    if (error.status === 403) return 'Tu cuenta no tiene permisos para esta operación.';
    if (error.status === 404) return 'El recurso solicitado no existe.';
    if (error.status === 409) return 'La operación entra en conflicto con el estado actual de los datos.';
    return `Error del servidor (${error.status}).`;
  }
  return 'Ocurrió un error inesperado.';
}
