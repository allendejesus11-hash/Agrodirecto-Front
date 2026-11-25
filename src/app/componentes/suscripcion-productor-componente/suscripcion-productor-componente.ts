import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatButtonModule, RouterLink],
  selector: 'app-suscripcion-productor-componente',
  styleUrl: './suscripcion-productor-componente.css',
  templateUrl: './suscripcion-productor-componente.html',
})
export class SuscripcionProductorComponente {}
