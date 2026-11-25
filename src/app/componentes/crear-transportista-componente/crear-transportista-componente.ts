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
@Component({ selector: 'app-crear-transportista-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatInputModule, MatFormFieldModule], templateUrl: './crear-transportista-componente.html', styleUrl: './crear-transportista-componente.css' })
export class CrearTransportistaComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
 cargar(): void {}
form=this.fb.nonNullable.group({nombreCompleto:'',correo:'',contrasena:'',ruc:'',placa:'',capacidadKg:0,licencia:''});
 registrar() { const {capacidadKg,...campos}=this.form.getRawValue();const d={...campos,capacidadToneladas:capacidadKg/1000};this.error.set('');
  if (!d.nombreCompleto.trim() || !/^[0-9]{11}$/.test(d.ruc) || !d.correo.includes('@') || d.contrasena.length<6 || !d.placa.trim() || d.capacidadToneladas<=0 || !d.licencia.trim()) {this.error.set('Completa todos los campos. El RUC necesita 11 dígitos y contraseña al menos 6 caracteres.');return;}
  this.cargando.set(true);this.api.registrarTransportista(d).subscribe({next:r=>{this.cargando.set(false);this.mensaje.set('Registro recibido: '+r.estadoCuenta+'.');this.form.reset();},error:e=>{this.cargando.set(false);this.error.set(mensajeError(e));}});
 }

}
