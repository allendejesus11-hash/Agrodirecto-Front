import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormControl } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-cargas-productor-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatInputModule, MatFormFieldModule], templateUrl: './cargas-productor-componente.html', styleUrl: './cargas-productor-componente.css' })
export class CargasProductorComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
cargas=signal<Carga[]>([]);seleccionada=signal<Carga|null>(null);
 nombreComprador=new FormControl('');dniComprador=new FormControl('');errorDniComprador=signal(false);
 limpiar(){this.nombreComprador.reset();this.dniComprador.reset();this.seleccionada.set(null);}
 cancelarSeleccionada(){const c=this.seleccionada();if(c)this.cancelar(c);}
 cargar(){const id=this.sesion.idUsuario;if(id===null)return;this.api.cargasDeProductor(id).subscribe({next:x=>this.cargas.set(x),error:e=>this.error.set(mensajeError(e))});}
 cancelar(c:Carga){if(c.estadoCarga!=='publicada')return;this.error.set('');this.api.cancelarCarga(c.idCarga).subscribe({next:()=>this.cargar(),error:e=>this.error.set(mensajeError(e))});}

}
