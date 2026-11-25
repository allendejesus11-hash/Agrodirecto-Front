import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { SesionServicio } from './sesion-servicio';
export const autorizacionInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(SesionServicio).token;
  // No enviar el token a otros servicios ni al endpoint de autenticación.
  if (token && req.url.startsWith('/api/v1/') && !req.url.includes('/auth/')) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }
  return next(req);
};
