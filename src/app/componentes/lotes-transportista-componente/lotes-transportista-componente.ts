import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatButtonModule, RouterLink],
  selector: 'app-lotes-transportista-componente',
  styleUrl: './lotes-transportista-componente.css',
  templateUrl: './lotes-transportista-componente.html',
})
export class LotesTransportistaComponente {}
