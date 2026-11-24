import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionServicio } from '../servicios/sesion-servicio';
export const authGuard: CanActivateFn = (route) => {
  const sesion = inject(SesionServicio);
  const router = inject(Router);
  if (!sesion.token) return router.createUrlTree(['/inicio-sesion']);
  const esperado = route.data['rol'] as string | undefined;
  if (esperado && sesion.rol !== esperado) return router.createUrlTree(['/inicio-sesion']);
  return true;
};
