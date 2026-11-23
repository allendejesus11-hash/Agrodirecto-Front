import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatButtonModule, RouterLink],
  selector: 'app-perfil-transportista2-componente',
  styleUrl: './perfil-transportista2-componente.css',
  templateUrl: './perfil-transportista2-componente.html',
})
export class PerfilTransportista2Componente {}
