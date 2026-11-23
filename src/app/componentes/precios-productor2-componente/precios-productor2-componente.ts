import { MatButtonModule } from '@angular/material/button';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatButtonModule, RouterLink],
  selector: 'app-precios-productor2-componente',
  styleUrl: './precios-productor2-componente.css',
  templateUrl: './precios-productor2-componente.html',
})
export class PreciosProductor2Componente {

  cultivos = [
    { valor: 'papa', texto: 'Papa blanca' },
    { valor: 'cebolla', texto: 'Cebolla' },
    { valor: 'zanahoria', texto: 'Zanahoria' },
    { valor: 'otro', texto: 'Otro' },
  ];

  cultivo = signal('papa');
}
