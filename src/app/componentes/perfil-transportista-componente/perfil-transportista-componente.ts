import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatButtonModule, RouterLink],
  selector: 'app-perfil-transportista-componente',
  styleUrl: './perfil-transportista-componente.css',
  templateUrl: './perfil-transportista-componente.html',
})
export class PerfilTransportistaComponente {}
