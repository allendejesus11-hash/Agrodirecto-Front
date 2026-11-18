import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-calificacion-viaje-productor-componente',
  styleUrl: './calificacion-viaje-productor-componente.css',
  templateUrl: './calificacion-viaje-productor-componente.html',
})
export class CalificacionViajeProductorComponente {

  valores = [1, 2, 3, 4, 5];

  calificacion = signal(0);
  recomienda = signal<'si' | 'no' | null>(null);
}
