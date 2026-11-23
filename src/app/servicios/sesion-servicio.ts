import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SesionServicio {
  private router: Router = inject(Router);

  // controla el aviso "Sesión cerrada correctamente"
  avisoCerrarSesion = signal(false);

  cerrarSesion(): void {
    this.avisoCerrarSesion.set(true);

    setTimeout(() => {
      this.avisoCerrarSesion.set(false);
      this.router.navigateByUrl('/inicio-sesion');
    }, 1500);
  }
}
