import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-perfil-admin-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule], templateUrl: './perfil-admin-componente.html', styleUrl: '../../estilos/admin-base.css' })
export class PerfilAdminComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
usuario=signal<Usuario|null>(null);
 cargar(){const id=this.sesion.idUsuario;if(id===null)return;this.api.perfilAdministrador(id).subscribe({next:x=>this.usuario.set(x),error:e=>this.error.set(mensajeError(e))});}

}
