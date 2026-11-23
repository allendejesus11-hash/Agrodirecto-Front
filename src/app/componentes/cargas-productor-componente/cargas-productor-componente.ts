import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [MatButtonModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule, RouterLink],
  selector: 'app-cargas-productor-componente',
  styleUrl: './cargas-productor-componente.css',
  templateUrl: './cargas-productor-componente.html',
})
export class CargasProductorComponente {

  private router: Router = inject(Router);

  cargas = [1, 2];

  seleccionada = signal<number | null>(null);
  errorDniComprador = signal(false);

  nombreComprador = new FormControl('');
  dniComprador = new FormControl('');

  limpiar(): void {
    this.seleccionada.set(null);
    this.nombreComprador.setValue('');
    this.dniComprador.setValue('');
  }

  confirmarEntrega(evento: Event): void {
    evento.preventDefault();

    const dniRuc = this.dniComprador.value ?? '';
    const dniRucValido = /^([0-9]{8}|[0-9]{11})$/.test(dniRuc);

    if (!dniRucValido) {
      this.errorDniComprador.set(true);
      return;
    }

    this.errorDniComprador.set(false);
    this.router.navigateByUrl('/inicio-productor');
  }
}
