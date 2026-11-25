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
@Component({ selector: 'app-inicio-sesion-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatInputModule, MatFormFieldModule], templateUrl: './inicio-sesion-componente.html', styleUrl: './inicio-sesion-componente.css' })
export class InicioSesionComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
 cargar(): void {}
tipoUsuario=signal('productor');
 form=this.fb.nonNullable.group({correo:'',contrasena:''});
 ingresar():void {
  const datos=this.form.getRawValue();this.error.set('');this.mensaje.set('');
  if (!datos.correo.trim() || !datos.contrasena) { this.error.set('Introduce tu correo y contraseña.');return; }
  this.cargando.set(true);
  this.api.login(datos.correo.trim(),datos.contrasena).subscribe({next:r=>{
   this.cargando.set(false);
   const rol=r.rol.toLowerCase().replace('role_', '');
   if (rol!==this.tipoUsuario().replace('admin','administrador')) {
     this.error.set('La cuenta no tiene el rol seleccionado.');return;
   }
   if (r.estadoCuenta==='bloqueado') {this.error.set('Tu cuenta está bloqueada.');return;}
   this.sesion.guardarSesion(r);
   this.router.navigateByUrl(rol==='administrador'?'/inicio-admin':rol==='transportista'?'/inicio-transportista':'/inicio-productor');
  },error:e=>{this.cargando.set(false);this.error.set(mensajeError(e));}});
 }

}
