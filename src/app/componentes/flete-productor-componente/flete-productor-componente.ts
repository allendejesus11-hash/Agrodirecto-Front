import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-flete-productor-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule], templateUrl: './flete-productor-componente.html', styleUrl: './flete-productor-componente.css' })
export class FleteProductorComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
puedeConfirmar(){return this.seleccionado()?.estadoLote==='formandose'&&!!this.seleccionado()?.cargas?.some(c=>c.productor.idUsuario===this.sesion.idUsuario&&c.estadoCarga==='en_revision');}
 confirmar(){const l=this.seleccionado();if(!l||!this.puedeConfirmar()||this.cargando()||!window.confirm('¿Confirmar tu parte del flete?'))return;this.cargando.set(true);this.api.confirmarFlete(l.idLote).subscribe({next:x=>{this.seleccionado.set(x);this.cargando.set(false);this.mensaje.set('Tu parte del flete está confirmada.');},error:e=>{this.cargando.set(false);this.error.set(mensajeError(e));}});}
 lotes=signal<Lote[]>([]);seleccionado=signal<Lote|null>(null);
 cambiarLote(e:Event){const id=Number((e.target as HTMLSelectElement).value);const lote=this.lotes().find(x=>x.idLote===id);if(lote)this.ver(lote);}
 parte(){const l=this.seleccionado();if(!l?.cargas?.length)return 0;const pesoTotal=l.cargas.reduce((s,c)=>s+c.pesoKg,0);const pesoPropio=l.cargas.filter(c=>c.productor.idUsuario===this.sesion.idUsuario).reduce((s,c)=>s+c.pesoKg,0);return (l.fleteTotal||0)*(pesoTotal?pesoPropio/pesoTotal:0);}
 cargar(){const id=this.sesion.idUsuario;if(id===null)return;this.api.lotesDeProductor(id).subscribe({next:x=>{this.lotes.set(x);if(x.length)this.ver(x.find(l=>l.idLote===Number(this.ruta.snapshot.queryParamMap.get('idLote')))||x[0]);},error:e=>this.error.set(mensajeError(e))});}
 ver(l:Lote){this.api.lote(l.idLote).subscribe({next:x=>this.seleccionado.set(x),error:e=>this.error.set(mensajeError(e))});}

}
