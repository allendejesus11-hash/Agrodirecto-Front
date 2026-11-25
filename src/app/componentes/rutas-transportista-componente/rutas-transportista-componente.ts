import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatButtonModule, RouterLink],
  selector: 'app-rutas-transportista-componente',
  styleUrl: './rutas-transportista-componente.css',
  templateUrl: './rutas-transportista-componente.html',
})
export class RutasTransportistaComponente {}
