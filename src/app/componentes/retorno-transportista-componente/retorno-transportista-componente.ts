import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import type { Carga, Lote } from '../../modelos/agro-modelos';

@Component({
  selector: 'app-retorno-transportista-componente',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './retorno-transportista-componente.html',
  styleUrl: './retorno-transportista-componente.css',
})
export class RetornoTransportistaComponente implements OnInit {
  private api = inject(AgroApiServicio);
  private sesion = inject(SesionServicio);

  cargando = signal(true);
  error = signal('');
  mensaje = signal('');
  cargasRetorno = signal<Carga[]>([]);
  lotesActivos = signal<Lote[]>([]);
  capacidadKg = signal(0);
  asignando = signal<number | null>(null);

  ngOnInit(): void {
    const id = this.sesion.idUsuario!;
    this.api.perfilTransportista(id).subscribe({next:u=>this.capacidadKg.set((u.capacidadToneladas??0)*1000),error:()=>this.error.set('No se pudo consultar la capacidad.')});
    this.api.retornoDisponible().subscribe({
      next: (cargas) => {
        this.cargasRetorno.set(cargas);
        this.cargarLotesActivos(id);
      },
      error: () => {
        this.error.set('No se pudo cargar las cargas de retorno.');
        this.cargando.set(false);
      },
    });
  }

  private cargarLotesActivos(id: number): void {
    this.api.listarLotesTransportista(id, 'activos').subscribe({
      next: (lotes) => {
        this.lotesActivos.set(lotes);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron consultar los lotes activos.');this.cargando.set(false);
      },
    });
  }

  asignar(idCarga: number, idLote: number): void {
    const lote = this.lotesActivos().find(l => l.idLote === idLote);
    if (!lote) return;
    const carga=this.cargasRetorno().find(c=>c.idCarga===idCarga);if(carga&&carga.pesoKg>this.disponible(lote)){this.error.set('Capacidad insuficiente.');return;}

    this.asignando.set(idCarga);
    this.error.set('');
    this.mensaje.set('');

    this.api.asignarRetorno(idCarga, idLote).subscribe({
      next: () => {
        this.mensaje.set('¡Carga de retorno asignada exitosamente!');
        this.cargasRetorno.set(this.cargasRetorno().filter(c => c.idCarga !== idCarga));
        if(this.sesion.idUsuario!==null)this.cargarLotesActivos(this.sesion.idUsuario);
        this.asignando.set(null);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Error al asignar la carga. Verifica la capacidad disponible.';
        this.error.set(msg);
        this.asignando.set(null);
      },
    });
  }

  loteSeleccionado = signal<number | null>(null);

  seleccionarLote(idCarga: number): void {
    this.loteSeleccionado.set(idCarga);
  }

  confirmarAsignacion(idLote: number): void {
    const idCarga = this.loteSeleccionado();
    if (idCarga !== null) {
      this.asignar(idCarga, idLote);
      this.loteSeleccionado.set(null);
    }
  }

  cerrarModal(): void {
    this.loteSeleccionado.set(null);
  }

  cerrarSesion(): void {
    this.sesion.cerrarSesion();
  }

  disponible(l:Lote){return Math.max(0,this.capacidadKg()-(l.cargas??[]).filter(c=>c.estadoCarga!=='cancelada').reduce((s,c)=>s+c.pesoKg,0));}
  capacidadTexto(carga: Carga): string {
    return `${carga.pesoKg} kg`;
  }
}
