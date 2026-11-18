import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-crear-transportista-componente',
  styleUrl: './crear-transportista-componente.css',
  templateUrl: './crear-transportista-componente.html',
})
export class CrearTransportistaComponente {

  private fb: FormBuilder = inject(FormBuilder);

  errorRuc = signal(false);
  errorCapacidad = signal(false);
  modalRegistro = signal(false);

  transportistaForm = this.fb.group({
    nombre: [''],
    ruc: [''],
    correo: [''],
    placa: [''],
    capacidad: [''],
  });

  continuar(): void {
    const ruc = this.transportistaForm.controls.ruc.value ?? '';
    const capacidad = this.transportistaForm.controls.capacidad.value ?? '';

    const rucValido = /^[0-9]{11}$/.test(ruc);
    const capacidadValida = capacidad !== '' && Number(capacidad) >= 0;

    this.errorRuc.set(!rucValido);
    this.errorCapacidad.set(!capacidadValida);

    if (!rucValido || !capacidadValida) return;

    this.modalRegistro.set(true);
  }
}
