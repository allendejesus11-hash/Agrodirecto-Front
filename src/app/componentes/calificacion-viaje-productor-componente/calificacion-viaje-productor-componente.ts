import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-calificacion-viaje-productor-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatInputModule, MatFormFieldModule], templateUrl: './calificacion-viaje-productor-componente.html', styleUrl: './calificacion-viaje-productor-componente.css' })
export class CalificacionViajeProductorComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
lotes=signal<Lote[]>([]); idLote=signal(0);
 form=this.fb.nonNullable.group({estrellas:0,recomienda:true,comentario:''});
 cargar(){const id=this.sesion.idUsuario;if(id===null)return;this.api.listarLotesProductor(id).subscribe({next:x=>{this.lotes.set(x.filter(l=>l.estadoLote==='entregado'));if(x.length){const solicitado=Number(this.ruta.snapshot.queryParamMap.get('idLote'));this.idLote.set(this.lotes().find(l=>l.idLote===solicitado)?.idLote ?? this.lotes()[0]?.idLote ?? 0);}},error:e=>this.error.set(mensajeError(e))});}
 seleccionado(){return this.lotes().find(x=>x.idLote===this.idLote()) ?? null;}
 elegirLote(e:Event){this.idLote.set(Number((e.target as HTMLSelectElement).value));}
 calificar(){const d=this.form.getRawValue();if(this.idLote()<=0||d.estrellas<1||d.estrellas>5){this.error.set('Selecciona un viaje entregado y de 1 a 5 estrellas.');return;}
 this.error.set('');this.cargando.set(true);this.api.calificar({idLote:this.idLote(),...d}).subscribe({next:()=>{this.cargando.set(false);this.mensaje.set('Calificación registrada.');},error:e=>{this.cargando.set(false);this.error.set(mensajeError(e));}});}

}
