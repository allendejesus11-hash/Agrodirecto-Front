import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { LoginRespuesta } from '../modelos/agro-modelos';
const CLAVE = 'agrodirecto_sesion';
@Injectable({ providedIn: 'root' })
export class SesionServicio {
  private router = inject(Router);
  private sesionActual = signal<LoginRespuesta | null>(this.recuperar());
  avisoCerrarSesion = signal(false);
  usuario = this.sesionActual.asReadonly();

  private recuperar(): LoginRespuesta | null {
    try {
      if (typeof sessionStorage === 'undefined') return null;
      const raw = sessionStorage.getItem(CLAVE);
      return raw ? JSON.parse(raw) as LoginRespuesta : null;
    } catch { return null; }
  }
  guardarSesion(datos: LoginRespuesta): void {
    this.sesionActual.set(datos);
    sessionStorage.setItem(CLAVE, JSON.stringify(datos));
  }
  get idUsuario(): number | null { return this.sesionActual()?.idUsuario ?? null; }
  get rol(): string { return (this.sesionActual()?.rol ?? '').toLowerCase(); }
  get token(): string | null { return this.sesionActual()?.token ?? null; }
  cerrarSesion(): void {
    sessionStorage.removeItem(CLAVE);
    this.sesionActual.set(null);
    this.avisoCerrarSesion.set(true);
    setTimeout(() => {
      this.avisoCerrarSesion.set(false);
      this.router.navigateByUrl('/inicio-sesion');
    }, 1000);
  }
}
