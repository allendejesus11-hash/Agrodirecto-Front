import { MatButtonModule } from '@angular/material/button';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SesionServicio } from '../../servicios/sesion-servicio';

@Component({
  imports: [MatButtonModule, RouterLink],
  selector: 'app-reportes-admin-componente',
  styleUrl: '../../estilos/admin-base.css',
  templateUrl: './reportes-admin-componente.html',
})
export class ReportesAdminComponente {

  protected sesion: SesionServicio = inject(SesionServicio);

  cerrarSesion(evento: Event): void {
    evento.preventDefault();
    this.sesion.cerrarSesion();
  }
}
