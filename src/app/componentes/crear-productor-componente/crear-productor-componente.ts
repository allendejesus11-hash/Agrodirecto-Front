import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-crear-productor-componente',
  styleUrl: './crear-productor-componente.css',
  templateUrl: './crear-productor-componente.html',
})
export class CrearProductorComponente {

  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);

  errorDni = signal(false);
  errorContrasena = signal(false);

  registroForm = this.fb.group({
    nombre: [''],
    dni: [''],
    correo: [''],
    distrito: [''],
    contrasena: [''],
  });

  continuar(): void {
    const dni = this.registroForm.controls.dni.value ?? '';
    const contrasena = this.registroForm.controls.contrasena.value ?? '';

    const dniValido = /^[0-9]{8}$/.test(dni);
    const contrasenaValida = contrasena.length >= 6;

    this.errorDni.set(!dniValido);
    this.errorContrasena.set(!contrasenaValida);

    if (!dniValido || !contrasenaValida) return;

    this.router.navigateByUrl('/inicio-productor');
  }
}
