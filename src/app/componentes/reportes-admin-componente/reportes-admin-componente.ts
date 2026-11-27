import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-reportes-admin-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule], templateUrl: './reportes-admin-componente.html', styleUrl: '../../estilos/admin-base.css' })
export class ReportesAdminComponente implements OnInit, OnDestroy {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
 resumen=signal<ResumenTransacciones|null>(null); transacciones=signal<Lote[]>([]);
 private consulta?: Subscription;
 mes=signal(`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`);
 cambiarMes(e:Event){const mes=(e.target as HTMLInputElement).value; if(mes){this.mes.set(mes);this.cargar();}}
 cargar(){
   this.consulta?.unsubscribe(); this.error.set(''); this.cargando.set(true);
   this.resumen.set(null); this.transacciones.set([]); this.dibujarGrafico([]);
   this.consulta=forkJoin({resumen:this.api.resumenTransacciones(this.mes()), lotes:this.api.transacciones(this.mes())}).subscribe({
      next: ({resumen,lotes}) => {this.resumen.set(resumen);this.transacciones.set(lotes);this.cargando.set(false);requestAnimationFrame(()=>this.dibujarGrafico(lotes));},
      error: e => {this.error.set(mensajeError(e));this.cargando.set(false);}
   });
 }
 ngOnDestroy(){this.consulta?.unsubscribe();}

 productores(lote:Lote):string {return [...new Set((lote.cargas??[]).map(c=>c.productor.nombreCompleto))].join(', ') || 'Sin cargas asociadas';}
 dibujarGrafico(lotes: Lote[]) {
   const canvas = document.getElementById('graficoBarras') as HTMLCanvasElement;
   if (!canvas) return;
   const ctx = canvas.getContext('2d');
   if (!ctx) return;
   const datos = lotes.slice(0, 6);
   const etiquetas = datos.map(l => l.codigoLote || l.destino || 'Carga');
   const valores = datos.map(l => l.fleteTotal ?? 0);
   const W = canvas.offsetWidth || 320;
   const H = 200;
   canvas.width = W;
   canvas.height = H;
   ctx.clearRect(0, 0, W, H);
   const max = Math.max(...valores, 1);
   const slot = Math.max(1, (W - 32) / (datos.length || 1));
   const barW = Math.max(1, Math.min(64, slot * 0.56));
   const colores = ['#4CAF50','#8BC34A','#CDDC39','#FFC107','#FF9800','#FF5722'];
   datos.forEach((_, i) => {
     const x = 16 + slot * (i + 0.5) - barW / 2;
     const barH = Math.floor((valores[i] / max) * (H - 50));
     const y = H - 30 - barH;
     ctx.fillStyle = colores[i % colores.length];
     ctx.fillRect(x, y, barW, barH);
     ctx.fillStyle = '#fff';
     ctx.font = '10px sans-serif';
     ctx.textAlign = 'center';
     ctx.fillText(etiquetas[i], x + barW/2, H - 15, slot - 2);
     ctx.fillText('S/'+valores[i].toFixed(2), x + barW/2, y - 4, slot - 2);
   });
   if (datos.length === 0) {
     ctx.fillStyle = '#aaa';
     ctx.font = '14px sans-serif';
     ctx.textAlign = 'center';
     ctx.fillText('Sin datos para este mes', W/2, H/2);
   }
 }

}
