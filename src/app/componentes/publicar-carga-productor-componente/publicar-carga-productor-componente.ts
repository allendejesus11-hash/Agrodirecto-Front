import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-publicar-carga-productor-componente',
  styleUrl: './publicar-carga-productor-componente.css',
  templateUrl: './publicar-carga-productor-componente.html',
})
export class PublicarCargaProductorComponente {

  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);

  cultivos = [
    { valor: 'Papa', texto: 'Papa' },
    { valor: 'Maiz', texto: 'Maíz' },
    { valor: 'Cebolla', texto: 'Cebolla' },
    { valor: 'Otro', texto: 'Otro' },
  ];

  tipos = [
    { valor: 'Perecible', texto: 'Perecible' },
    { valor: 'Seco', texto: 'Seco' },
  ];

  cultivo = signal('Papa');
  tipo = signal('Perecible');
  urgente = signal(false);
  modalCancelar = signal(false);
  errorPeso = signal(false);
  errorTarifa = signal(false);

  publicarForm = this.fb.group({
    peso: [''],
    destino: [''],
    tarifa: [''],
    fecha: [''],
  });

  alternarUrgente(): void {
    this.urgente.update((valor) => !valor);
  }

  publicar(): void {
    const peso = this.publicarForm.controls.peso.value ?? '';
    const tarifa = this.publicarForm.controls.tarifa.value ?? '';

    const pesoValido = peso !== '' && Number(peso) > 0;
    const tarifaValida = tarifa !== '' && Number(tarifa) > 0;

    this.errorPeso.set(!pesoValido);
    this.errorTarifa.set(!tarifaValida);

    if (!pesoValido || !tarifaValida) return;

    this.router.navigateByUrl('/inicio-productor');
  }
}
