import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-perfil-transportista-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule], templateUrl: './perfil-transportista-componente.html', styleUrl: './perfil-transportista-componente.css' })
export class PerfilTransportistaComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
usuario=signal<Usuario|null>(null);reputacion=signal<ReputacionTransportista|null>(null);
 idBusqueda=signal(0);
 cargar(){const id=Number(this.ruta.snapshot.queryParamMap.get('id')||this.sesion.idUsuario);if(!id){this.error.set('Indica el identificador del transportista.');return;}this.idBusqueda.set(id);this.api.perfilTransportista(id).subscribe({next:x=>this.usuario.set(x),error:e=>this.error.set(mensajeError(e))});this.api.reputacionTransportista(id).subscribe({next:x=>this.reputacion.set(x),error:e=>this.error.set(mensajeError(e))});}
 consultar(){this.router.navigate([], {relativeTo:this.ruta,queryParams:{id:this.idBusqueda()}}).then(()=>this.cargar());}

}
