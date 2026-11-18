import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SesionServicio } from '../../servicios/sesion-servicio';

@Component({
  imports: [RouterLink],
  selector: 'app-perfil-admin-componente',
  styleUrl: '../../estilos/admin-base.css',
  templateUrl: './perfil-admin-componente.html',
})
export class PerfilAdminComponente {

  protected sesion: SesionServicio = inject(SesionServicio);

  cerrarSesion(evento: Event): void {
    evento.preventDefault();
    this.sesion.cerrarSesion();
  }
}
