import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SesionServicio } from '../../servicios/sesion-servicio';

@Component({
  imports: [RouterLink],
  selector: 'app-inicio-productor-componente',
  styleUrl: './inicio-productor-componente.css',
  templateUrl: './inicio-productor-componente.html',
})
export class InicioProductorComponente {

  protected sesion: SesionServicio = inject(SesionServicio);

  cerrarSesion(evento: Event): void {
    evento.preventDefault();
    this.sesion.cerrarSesion();
  }
}
