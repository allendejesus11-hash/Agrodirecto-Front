import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-precios-productor-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule], templateUrl: './precios-productor-componente.html', styleUrl: './precios-productor-componente.css' })
export class PreciosProductorComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
precios=signal<PrecioMercado[]>([]);cultivo=signal('todos');
 visibles=computed(()=>this.precios().filter(p=>this.cultivo()==='todos'||p.cultivo.nombreCultivo===this.cultivo()));
 nombres=computed(()=>[...new Set(this.precios().map(p=>p.cultivo.nombreCultivo))]);
 cargar(){this.api.listarPrecios().subscribe({next:x=>this.precios.set(x),error:e=>this.error.set(mensajeError(e))});}

}
