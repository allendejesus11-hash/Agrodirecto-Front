import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SesionServicio } from '../../servicios/sesion-servicio';

@Component({
  imports: [RouterLink],
  selector: 'app-inicio-transportista-componente',
  styleUrl: './inicio-transportista-componente.css',
  templateUrl: './inicio-transportista-componente.html',
})
export class InicioTransportistaComponente {

  protected sesion: SesionServicio = inject(SesionServicio);

  cerrarSesion(evento: Event): void {
    evento.preventDefault();
    this.sesion.cerrarSesion();
  }

  unidadLlena = signal(false);

  alternarUnidadLlena(): void {
    this.unidadLlena.update((valor) => !valor);
  }
}
