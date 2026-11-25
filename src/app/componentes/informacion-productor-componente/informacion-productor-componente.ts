import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-informacion-productor-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule], templateUrl: './informacion-productor-componente.html', styleUrl: './informacion-productor-componente.css' })
export class InformacionProductorComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
saldo=signal(0);lotes=signal<Lote[]>([]);ahorro=signal<AhorroProductor|null>(null);
 reciente(){return this.lotes().filter(l=>l.estadoLote==='entregado').at(-1)??null;}
 exportarRecibo(){this.mensaje.set('La API aún no ofrece descarga PDF de recibos.');}
 cargar(){const id=this.sesion.idUsuario;if(id===null)return;this.api.ahorroProductor(id).subscribe({next:a=>this.ahorro.set(a),error:e=>this.error.set(mensajeError(e))});this.api.saldoProductor(id).subscribe({next:s=>this.saldo.set(s.saldoDisponible),error:e=>this.error.set(mensajeError(e))});this.api.listarLotesProductor(id).subscribe({next:x=>this.lotes.set(x),error:e=>this.error.set(mensajeError(e))});}

}
