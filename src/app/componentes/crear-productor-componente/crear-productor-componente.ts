import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-crear-productor-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatInputModule, MatFormFieldModule], templateUrl: './crear-productor-componente.html', styleUrl: './crear-productor-componente.css' })
export class CrearProductorComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
 cargar(): void {}
form=this.fb.nonNullable.group({nombreCompleto:'',dni:'',correo:'',distrito:'',contrasena:''});
 registrar() { const d=this.form.getRawValue();this.error.set('');
  if (!d.nombreCompleto.trim() || !/^[0-9]{8}$/.test(d.dni) || !d.correo.includes('@') || !d.distrito.trim() || d.contrasena.length<6) {this.error.set('Revisa nombre, DNI de 8 dígitos, correo, distrito y contraseña (mínimo 6 caracteres).');return;}
  this.cargando.set(true); this.api.registrarProductor(d).subscribe({next:r=>{this.cargando.set(false);this.mensaje.set('Cuenta creada en estado '+r.estadoCuenta+'. Inicia sesión cuando sea verificada.');this.form.reset();},error:e=>{this.cargando.set(false);this.error.set(mensajeError(e));}});
 }

}
