import { Component,inject,signal,computed,OnInit } from '@angular/core';import {CommonModule} from '@angular/common';import {RouterLink} from '@angular/router';import {AgroApiServicio} from '../../servicios/agro-api-servicio';import {mensajeError} from '../../servicios/mensaje-error';import type {PrecioMercado} from '../../modelos/agro-modelos';
@Component({selector:'app-precios-productor-componente',standalone:true,imports:[CommonModule,RouterLink],templateUrl:'./precios-productor-componente.html',styleUrl:'./precios-productor-componente.css'})
export class PreciosProductorComponente implements OnInit{private api=inject(AgroApiServicio);error=signal('');cargando=signal(true);historial=signal<PrecioMercado[]>([]);cultivo=signal(0);
 nombres=computed(()=>[...new Map(this.historial().map(p=>[p.cultivo.idCultivo,p.cultivo])).values()]);
 precios=computed(()=>{const m=new Map<number,PrecioMercado>();for(const p of this.historial())m.set(p.cultivo.idCultivo,p);return [...m.values()];});
 visibles=computed(()=>this.precios().filter(p=>!this.cultivo()||p.cultivo.idCultivo===this.cultivo()));
 serie=computed(()=>this.historial().filter(p=>p.cultivo.idCultivo===(this.cultivo()||this.nombres()[0]?.idCultivo)).sort((a,b)=>a.fechaPrecio.localeCompare(b.fechaPrecio)));
 max=computed(()=>Math.max(0.01,...this.serie().map(p=>p.precioPorKg)));
 nombreGrafico=computed(()=>this.serie()[0]?.cultivo.nombreCultivo||'');
 tendencia(p:PrecioMercado){const d=new Date(p.fechaPrecio+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-1);const fecha=d.toISOString().slice(0,10);const a=this.historial().find(x=>x.cultivo.idCultivo===p.cultivo.idCultivo&&x.fechaPrecio===fecha);return a&&a.precioPorKg>0?(p.precioPorKg-a.precioPorKg)/a.precioPorKg*100:null;}
 ngOnInit(){this.cargar();}cargar(){this.cargando.set(true);this.error.set('');this.api.historialPrecios().subscribe({next:p=>{this.historial.set(p);this.cargando.set(false);},error:e=>{this.error.set(mensajeError(e));this.cargando.set(false);}});}}
