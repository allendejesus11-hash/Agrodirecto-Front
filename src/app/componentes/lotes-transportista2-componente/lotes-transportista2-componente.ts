import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Lote, Carga } from '../../modelos/agro-modelos';
@Component({selector:'app-lotes-transportista2-componente',standalone:true,imports:[CommonModule,RouterLink, MatButtonModule],templateUrl:'./lotes-transportista2-componente.html',styleUrl:'./lotes-transportista2-componente.css'})
export class LotesTransportista2Componente implements OnInit {
 private api=inject(AgroApiServicio);protected sesion=inject(SesionServicio);
 error=signal('');mensaje=signal('');cargas=signal<Carga[]>([]);lotes=signal<Lote[]>([]);
 perfil=signal<Usuario|null>(null);detalle=signal<Lote|null>(null);seleccion=signal(0);
 ngOnInit(){this.cargar();}
 cargar(){const id=this.sesion.idUsuario;if(id===null)return;
 this.api.retornoDisponible().subscribe({next:x=>this.cargas.set(x),error:e=>this.error.set(mensajeError(e))});
 this.api.perfilTransportista(id).subscribe({next:x=>this.perfil.set(x),error:e=>this.error.set(mensajeError(e))});
 this.api.listarLotesTransportista(id).subscribe({next:x=>{this.lotes.set(x);if(x.length && !this.seleccion())this.seleccionarId(x[0].idLote);},error:e=>this.error.set(mensajeError(e))});}
 seleccionar(e:Event){this.seleccionarId(Number((e.target as HTMLSelectElement).value));}
 seleccionarId(id:number){this.seleccion.set(id);this.api.lote(id).subscribe({next:x=>this.detalle.set(x),error:e=>this.error.set(mensajeError(e))});}
 capacidad(){const ocupada=(this.detalle()?.cargas||[]).reduce((s,c)=>s+c.pesoKg,0);return Math.max(0,(this.perfil()?.capacidadToneladas||0)*1000-ocupada);}
 aceptar(c:Carga){if(!this.seleccion()){this.error.set('Selecciona un lote de retorno.');return;}if(c.pesoKg>this.capacidad()){this.error.set('Capacidad insuficiente.');return;}
 this.api.asignarRetorno(c.idCarga,this.seleccion()).subscribe({next:()=>{this.mensaje.set('Carga asignada.');this.cargar();this.seleccionarId(this.seleccion());},error:e=>this.error.set(mensajeError(e))});}
}