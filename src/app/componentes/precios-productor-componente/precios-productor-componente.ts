import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatButtonModule, RouterLink],
  selector: 'app-precios-productor-componente',
  styleUrl: './precios-productor-componente.css',
  templateUrl: './precios-productor-componente.html',
})
export class PreciosProductorComponente {}
