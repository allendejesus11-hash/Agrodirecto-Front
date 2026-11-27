import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import type { GastoViaje, Lote } from '../../modelos/agro-modelos';

const CATEGORIAS = ['Combustible', 'Peaje', 'Alimentación', 'Mantenimiento', 'Alojamiento', 'Otro'];

@Component({
  selector: 'app-gastos-viaje-transportista-componente',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatButtonModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  templateUrl: './gastos-viaje-transportista-componente.html',
  styleUrl: './gastos-viaje-transportista-componente.css',
})
export class GastosViajeTransportistaComponente implements OnInit {
  private api = inject(AgroApiServicio);
  private sesion = inject(SesionServicio);
  private fb = inject(FormBuilder);

  cargando = signal(true);
  error = signal('');
  mensaje = signal('');
  lotes = signal<Lote[]>([]);
  loteActivo = signal<Lote | null>(null);
  gastos = signal<GastoViaje[]>([]);
  cargandoGastos = signal(false);
  registrando = signal(false);
  mostrarFormulario = signal(false);

  readonly categorias = CATEGORIAS;

  form = this.fb.group({
    categoria: ['', Validators.required],
    monto: [null as number | null, [Validators.required, Validators.min(0.01)]],
    descripcion: ['', Validators.maxLength(90)],
  });

  totalGastos = computed(() =>
    this.gastos().reduce((acc, g) => acc + g.monto, 0)
  );

  gastosPorCategoria = computed(() => {
    const mapa: Record<string, number> = {};
    for (const g of this.gastos()) {
      mapa[g.categoria] = (mapa[g.categoria] ?? 0) + g.monto;
    }
    return Object.entries(mapa).map(([categoria, total]) => ({ categoria, total }));
  });

  ngOnInit(): void {
    const id = this.sesion.idUsuario!;
    this.api.listarLotesTransportista(id).subscribe({
      next: (l) => {
        this.lotes.set(l.filter(x => ['en_transito', 'con_retraso', 'entregado'].includes(x.estadoLote)));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los lotes.');
        this.cargando.set(false);
      },
    });
  }

  verGastos(lote: Lote): void {
    this.loteActivo.set(lote);
    this.gastos.set([]);
    this.cargandoGastos.set(true);
    this.api.listarGastos(lote.idLote).subscribe({
      next: (g) => { this.gastos.set(g); this.cargandoGastos.set(false); },
      error: () => { this.error.set('No se pudieron consultar los gastos.'); this.cargandoGastos.set(false); }
    });
  }

  registrarGasto(): void {
    const lote = this.loteActivo();
    if (!lote || this.form.invalid) return;

    this.registrando.set(true);
    this.error.set('');
    const { categoria, monto, descripcion } = this.form.value;
    this.api.registrarGasto(lote.idLote, {
      categoria: categoria!,
      monto: monto!,
      descripcion: descripcion ?? undefined,
    }).subscribe({
      next: (g) => {
        this.gastos.set([...this.gastos(), g]);
        this.mensaje.set('Gasto registrado correctamente.');
        this.form.reset();
        this.mostrarFormulario.set(false);
        this.registrando.set(false);
      },
      error: () => {
        this.error.set('No se pudo registrar el gasto.');
        this.registrando.set(false);
      },
    });
  }

  volver(): void {
    this.loteActivo.set(null);
    this.gastos.set([]);
    this.mostrarFormulario.set(false);
    this.error.set('');
    this.mensaje.set('');
  }

  cerrarSesion(): void {
    this.sesion.cerrarSesion();
  }

  colorCategoria(cat: string): string {
    const paleta: Record<string, string> = {
      Combustible: '#fef9c3',
      Peaje: '#dbeafe',
      Alimentación: '#fce7f3',
      Mantenimiento: '#ede9fe',
      Alojamiento: '#ecfdf5',
      Otro: '#f3f4f6',
    };
    return paleta[cat] ?? '#f3f4f6';
  }
}
