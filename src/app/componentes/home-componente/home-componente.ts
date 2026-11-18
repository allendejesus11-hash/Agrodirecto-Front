import { Component, DOCUMENT, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-home-componente',
  styleUrl: './home-componente.css',
  templateUrl: './home-componente.html',
})
export class HomeComponente {

  private documento: Document = inject(DOCUMENT);

  // Desplazamiento suave hacia una sección de la página
  desplazarA(id: string, evento: Event): void {
    evento.preventDefault();
    this.documento.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
