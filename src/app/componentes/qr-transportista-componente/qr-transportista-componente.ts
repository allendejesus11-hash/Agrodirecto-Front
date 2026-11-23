import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatButtonModule, RouterLink],
  selector: 'app-qr-transportista-componente',
  styleUrl: './qr-transportista-componente.css',
  templateUrl: './qr-transportista-componente.html',
})
export class QrTransportistaComponente {}
