import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-logros-productor-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule], templateUrl: './logros-productor-componente.html', styleUrl: './logros-productor-componente.css' })
export class LogrosProductorComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
ahorro=signal<AhorroProductor|null>(null);
 cargar(){const id=this.sesion.idUsuario;if(id===null)return;this.api.ahorroProductor(id).subscribe({next:x=>this.ahorro.set(x),error:e=>this.error.set(mensajeError(e))});}

}
