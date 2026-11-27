import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Lote, Carga, AhorroProductor, ResumenTransacciones } from '../../modelos/agro-modelos';
@Component({selector:'app-inicio-productor-componente',standalone:true,imports:[CommonModule,RouterLink, MatButtonModule],templateUrl:'./inicio-productor-componente.html',styleUrl:'./inicio-productor-componente.css'})
export class InicioProductorComponente implements OnInit {
 protected sesion=inject(SesionServicio);private api=inject(AgroApiServicio);
 error=signal('');
 cerrarSesion(e:Event){e.preventDefault();this.sesion.cerrarSesion();}
 ngOnInit(){this.cargar();}
saldo=signal(0);ahorro=signal<AhorroProductor|null>(null);cargas=signal<Carga[]>([]);
 activos(){return this.cargas().filter(x=>['publicada','en_revision','confirmada_en_lote','en_transito'].includes(x.estadoCarga)).length;}
 cargar(){const id=this.sesion.idUsuario;if(id===null)return;this.api.cargasDeProductor(id).subscribe({next:x=>this.cargas.set(x),error:e=>this.error.set(mensajeError(e))});this.api.saldoProductor(id).subscribe({next:x=>this.saldo.set(x.saldoDisponible),error:e=>this.error.set(mensajeError(e))});this.api.ahorroProductor(id).subscribe({next:x=>this.ahorro.set(x),error:e=>this.error.set(mensajeError(e))});}

}
