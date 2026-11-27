import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Lote } from '../../modelos/agro-modelos';
@Component({ imports:[RouterLink,CommonModule], selector:'app-viajes-productor-componente', styleUrl:'./viajes-productor-componente.css', templateUrl:'./viajes-productor-componente.html' })
export class ViajesProductorComponente implements OnInit {
  private api=inject(AgroApiServicio); private sesion=inject(SesionServicio);
  lotes=signal<Lote[]>([]); error=signal(''); cargando=signal(true);
  calificados=signal<Set<number>>(new Set());
  ingresos=computed(()=>this.lotes().reduce((s,l)=>s+this.ingreso(l),0));
  peso(l:Lote){return (l.cargas??[]).filter(c=>c.estadoCarga!=='cancelada' && c.productor.idUsuario===this.sesion.idUsuario).reduce((s,c)=>s+c.pesoKg,0);}
  ingreso(l:Lote){const pesoTotal=(l.cargas??[]).filter(c=>c.estadoCarga!=='cancelada').reduce((s,c)=>s+c.pesoKg,0);const ratio=pesoTotal>0?this.peso(l)/pesoTotal:0;const redondear=(v:number)=>Math.round((v+Number.EPSILON)*100)/100;return l.estadoPago==='pagado' && l.montoNeto!=null ? redondear(redondear((l.fleteTotal??0)*ratio)-redondear((l.montoComision??0)*ratio)):0;}
  meses=computed(()=>{const m=new Map<string,number>();for(const l of this.lotes()){const key=(l.fechaLlegada??'').slice(0,7);if(key)m.set(key,(m.get(key)??0)+this.ingreso(l));}return [...m.entries()].sort(([a],[b])=>a.localeCompare(b)).slice(-6).map(([mes,total])=>({mes,total}));});
  maxMes=computed(()=>Math.max(1,...this.meses().map(m=>m.total)));
  ngOnInit(){const id=this.sesion.idUsuario;if(id===null){this.cargando.set(false);return;}this.api.listarLotesProductor(id).subscribe({next:ls=>{this.lotes.set(ls);this.cargando.set(false);for(const l of ls)this.api.calificacionesLote(l.idLote).subscribe({next:cs=>{if(cs.some(c=>c.productor.idUsuario===id))this.calificados.update(s=>new Set([...s,l.idLote]));},error:()=>{}});},error:e=>{this.error.set(mensajeError(e));this.cargando.set(false);}});}
}
