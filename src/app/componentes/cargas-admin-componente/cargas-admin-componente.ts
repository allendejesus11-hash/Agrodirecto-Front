import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-cargas-admin-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule], templateUrl: './cargas-admin-componente.html', styleUrl: '../../estilos/admin-base.css' })
export class CargasAdminComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
cargas=signal<Carga[]>([]);filtro=signal('todos');
 visibles=computed(()=>this.cargas().filter(c=>this.filtro()==='todos'||c.estadoCarga===this.filtro()));
 cargar(){this.api.listarCargas().subscribe({next:x=>this.cargas.set(x),error:e=>this.error.set(mensajeError(e))});}

}
