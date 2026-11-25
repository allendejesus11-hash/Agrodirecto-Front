import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-usuarios-admin-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule], templateUrl: './usuarios-admin-componente.html', styleUrl: '../../estilos/admin-base.css' })
export class UsuariosAdminComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
usuarios=signal<Usuario[]>([]);filtro=signal('todos');
 visibles=computed(()=>this.usuarios().filter(u=>this.filtro()==='todos'||u.rol.nombreRol.toLowerCase()===this.filtro()));
 cargar(){this.api.listarUsuarios().subscribe({next:u=>this.usuarios.set(u),error:e=>this.error.set(mensajeError(e))});}
 cambiarPendiente(u:Usuario){this.api.cambiarEstadoUsuario(u.idUsuario,'verificado').subscribe({next:()=>this.cargar(),error:e=>this.error.set(mensajeError(e))});}
 cambiar(u:Usuario){const estado=u.estadoCuenta==='bloqueado'?'verificado':'bloqueado';this.api.cambiarEstadoUsuario(u.idUsuario,estado).subscribe({next:()=>{this.mensaje.set('Estado actualizado');this.cargar();},error:e=>this.error.set(mensajeError(e))});}

}
