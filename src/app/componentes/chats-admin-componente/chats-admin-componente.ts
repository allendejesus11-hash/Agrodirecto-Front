import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-chats-admin-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule], templateUrl: './chats-admin-componente.html', styleUrl: '../../estilos/admin-base.css' })
export class ChatsAdminComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
chats=signal<SolicitudChat[]>([]);
 cargar(){this.api.listarSolicitudesChat().subscribe({next:x=>this.chats.set(x),error:e=>this.error.set(mensajeError(e))});}
 aprobar(s:SolicitudChat){const id=this.sesion.idUsuario;if(id===null||s.estadoSolicitud!=='pendiente')return;this.api.aprobarChat(s.idSolicitud,id).subscribe({next:()=>{this.mensaje.set('Chat habilitado.');this.cargar();},error:e=>this.error.set(mensajeError(e))});}

}
