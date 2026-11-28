import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-lotes-transportista-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule], templateUrl: './lotes-transportista-componente.html', styleUrl: './lotes-transportista-componente.css' })
export class LotesTransportistaComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
iniciando=signal(false);
 iniciar(l:Lote){if(this.iniciando()||!window.confirm('¿Iniciar el viaje '+l.codigoLote+'?'))return;this.iniciando.set(true);this.error.set('');this.api.iniciarViaje(l.idLote).subscribe({next:()=>{this.iniciando.set(false);this.router.navigate(['/seguimiento-viaje-transportista']);},error:e=>{this.iniciando.set(false);this.error.set(mensajeError(e));}});}
 lotes=signal<Lote[]>([]); filtro=signal('todos');
 cargar(){const id=this.sesion.idUsuario;if(id===null)return;this.error.set('');this.api.listarLotesTransportista(id).subscribe({next:x=>this.lotes.set(x),error:e=>this.error.set(mensajeError(e))});}
 entregados(){return this.lotes().filter(l=>l.estadoLote==='entregado').length;}
 visibles=computed(()=>this.lotes().filter(l=>this.filtro()==='todos'||(this.filtro()==='activos'?['en_transito','con_retraso'].includes(l.estadoLote):l.estadoLote==='entregado')));

}
