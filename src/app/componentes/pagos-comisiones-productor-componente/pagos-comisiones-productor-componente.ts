import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import type { SaldoProductor, LoteFinanciero, Lote } from '../../modelos/agro-modelos';

@Component({
  selector: 'app-pagos-comisiones-productor-componente',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './pagos-comisiones-productor-componente.html',
  styleUrl: './pagos-comisiones-productor-componente.css',
})
export class PagosComisionesProductorComponente implements OnInit {
  private api = inject(AgroApiServicio);
  private sesion = inject(SesionServicio);

  cargando = signal(true);
  error = signal('');
  saldo = signal<SaldoProductor | null>(null);
  lotes = signal<Lote[]>([]);
  loteSeleccionado = signal<LoteFinanciero | null>(null);
  cargandoDetalle = signal(false);

  ngOnInit(): void {
    const id = this.sesion.idUsuario!;
    this.api.saldo(id).subscribe({
      next: (s) => {
        this.saldo.set(s);
        this.cargarLotes(id);
      },
      error: () => {
        this.error.set('No se pudo cargar el saldo. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  private cargarLotes(id: number): void {
    this.api.listarLotesProductor(id).subscribe({
      next: (data) => {
        this.lotes.set(data.filter(l => l.estadoPago === 'pagado'));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los lotes.');
        this.cargando.set(false);
      },
    });
  }

  netoPropio(l:Lote):number {
    const cs=(l.cargas??[]).filter(c=>c.estadoCarga!=='cancelada'); const total=cs.reduce((s,c)=>s+c.pesoKg,0);
    const propio=cs.filter(c=>c.productor.idUsuario===this.sesion.idUsuario).reduce((s,c)=>s+c.pesoKg,0);
    const r=total>0?propio/total:0; const red=(v:number)=>Math.round((v+Number.EPSILON)*100)/100;
    return red(red((l.fleteTotal??0)*r)-red((l.montoComision??0)*r));
  }
  verDetalle(idLote: number): void {
    this.cargandoDetalle.set(true);
    this.loteSeleccionado.set(null);
    this.api.loteFinanciero(idLote).subscribe({
      next: (d) => {
        this.loteSeleccionado.set(d);
        this.cargandoDetalle.set(false);
      },
      error: () => {
        this.error.set('No se pudo obtener el detalle financiero.');
        this.cargandoDetalle.set(false);
      },
    });
  }

  cerrarDetalle(): void {
    this.loteSeleccionado.set(null);
  }

  cerrarSesion(): void {
    this.sesion.cerrarSesion();
  }

  badgeEstado(estado: string): string {
    const mapa: Record<string, string> = {
      pendiente: 'badge-pendiente',
      pagado: 'badge-pagado',
      procesando: 'badge-procesando',
    };
    return mapa[estado?.toLowerCase()] ?? 'badge-pendiente';
  }
}
