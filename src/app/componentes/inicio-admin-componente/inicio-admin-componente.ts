import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SesionServicio } from '../../servicios/sesion-servicio';

@Component({
  imports: [RouterLink],
  selector: 'app-inicio-admin-componente',
  styleUrl: '../../estilos/admin-base.css',
  templateUrl: './inicio-admin-componente.html',
})
export class InicioAdminComponente {

  protected sesion: SesionServicio = inject(SesionServicio);

  cerrarSesion(evento: Event): void {
    evento.preventDefault();
    this.sesion.cerrarSesion();
  }
}
