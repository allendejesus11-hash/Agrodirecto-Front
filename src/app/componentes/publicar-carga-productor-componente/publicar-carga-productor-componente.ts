import { MatCheckboxModule } from '@angular/material/checkbox';
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
@Component({ selector: 'app-publicar-carga-productor-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatCheckboxModule], templateUrl: './publicar-carga-productor-componente.html', styleUrl: './publicar-carga-productor-componente.css' })
export class PublicarCargaProductorComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); }
cultivos=signal<Cultivo[]>([]);
 tipos=[{valor:'perecible',texto:'Perecible'},{valor:'no_perecible',texto:'No perecible'}];
 modalCancelar=signal(false);
 form=this.fb.nonNullable.group({idCultivo:0,pesoKg:0,tipoCarga:'perecible',direccionDestino:'',tarifaPropuesta:0,fechaRecojo:'',esUrgente:false});
 cargar() {this.api.listarCultivos().subscribe({next:c=>{this.cultivos.set(c);if (c.length)this.form.patchValue({idCultivo:c[0].idCultivo});},error:e=>this.error.set(mensajeError(e))});}
 fechaLocalHoy():string{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
 publicar() {const d=this.form.getRawValue();this.error.set('');
  if (!d.idCultivo || d.pesoKg<=0 || d.tarifaPropuesta<=0 || !d.direccionDestino.trim() || !d.fechaRecojo || d.fechaRecojo<this.fechaLocalHoy()) {this.error.set('Completa cultivo, peso, tarifa, destino y fecha no anterior a hoy.');return;}
  this.cargando.set(true);this.api.publicarCarga(d).subscribe({next:r=>{this.cargando.set(false);this.mensaje.set('Carga '+r.codigoCarga+' publicada.');this.router.navigateByUrl('/cargas-productor');},error:e=>{this.cargando.set(false);this.error.set(mensajeError(e));}});
 }

}
