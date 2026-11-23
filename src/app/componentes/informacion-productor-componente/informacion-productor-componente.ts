import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatButtonModule, RouterLink],
  selector: 'app-informacion-productor-componente',
  styleUrl: './informacion-productor-componente.css',
  templateUrl: './informacion-productor-componente.html',
})
export class InformacionProductorComponente {}
