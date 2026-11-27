import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { forkJoin, catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-precios-productor2-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule], templateUrl: './precios-productor2-componente.html', styleUrl: './precios-productor2-componente.css' })
export class PreciosProductor2Componente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
precios=signal<PrecioMercado[]>([]); anteriores=signal<PrecioMercado[]>([]); historial=signal<PrecioMercado[][]>([]);cultivo=signal('todos');
 visibles=computed(()=>this.precios().filter(p=>this.cultivo()==='todos'||p.cultivo.nombreCultivo===this.cultivo()));
 nombres=computed(()=>[...new Set(this.precios().map(p=>p.cultivo.nombreCultivo))]);
 tendencia(p:PrecioMercado){const a=this.anteriores().find(x=>x.cultivo.idCultivo===p.cultivo.idCultivo);return !a?'Sin datos previos':p.precioPorKg>a.precioPorKg?'Sube':p.precioPorKg<a.precioPorKg?'Baja':'Estable';}
 cargar(){this.api.listarPrecios().subscribe({next:x=>{this.precios.set(x);const hoy=x[0]?.fechaPrecio??new Date().toISOString().slice(0,10);const fechas=Array.from({length:6},(_,i)=>{const d=new Date(hoy+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-i-1);return d.toISOString().slice(0,10);});forkJoin(fechas.map(f=>this.api.listarPrecios(f).pipe(catchError(()=>of([] as PrecioMercado[]))))).subscribe({next:d=>{this.anteriores.set(d[0]??[]);this.historial.set([x,...d]);}});},error:e=>this.error.set(mensajeError(e))});}
 historialVisible(){return this.historial().flat().filter(p=>this.cultivo()==='todos'||p.cultivo.nombreCultivo===this.cultivo()).sort((a,b)=>b.fechaPrecio.localeCompare(a.fechaPrecio));}

}
