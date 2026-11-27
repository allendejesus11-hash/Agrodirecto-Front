import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import type { Suscripcion } from '../../modelos/agro-modelos';

@Component({
  selector: 'app-suscripcion-productor-componente',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './suscripcion-productor-componente.html',
  styleUrl: './suscripcion-productor-componente.css',
})
export class SuscripcionProductorComponente implements OnInit {
  private api = inject(AgroApiServicio);
  private sesion = inject(SesionServicio);

  cargando = signal(true);
  activando = signal(false);
  error = signal('');
  mensaje = signal('');
  suscripcion = signal<Suscripcion | null>(null);

  ngOnInit(): void {
    const id = this.sesion.idUsuario!;
    this.api.consultarSuscripcion(id).subscribe({
      next: (s) => { this.suscripcion.set(s); this.cargando.set(false); },
      error: (err) => {
        // 404 significa que no tiene suscripción activa: estado normal
        if (err.status === 404) { this.suscripcion.set(null); }
        else { this.error.set('No se pudo verificar tu suscripción.'); }
        this.cargando.set(false);
      }
    });
  }

  activar(): void {
    const id = this.sesion.idUsuario!;
    this.activando.set(true);
    this.error.set('');
    this.api.activarSuscripcion(id).subscribe({
      next: (s) => {
        this.suscripcion.set(s);
        this.mensaje.set('¡Suscripción Premium activada exitosamente!');
        this.activando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'No se pudo activar la suscripción. Intenta más tarde.');
        this.activando.set(false);
      }
    });
  }

  cerrarSesion(): void {
    this.sesion.cerrarSesion();
  }

  diasRestantes(): number {
    const s = this.suscripcion();
    if (!s?.fechaVencimiento) return 0;
    const hoy = new Date();
    const vence = new Date(s.fechaVencimiento);
    return Math.max(0, Math.ceil((vence.getTime() - hoy.getTime()) / 86400000));
  }
}
