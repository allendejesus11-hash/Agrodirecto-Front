import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Lote, Carga, Usuario, AhorroProductor, ResumenTransacciones } from '../../modelos/agro-modelos';
@Component({selector:'app-inicio-transportista-componente',standalone:true,imports:[CommonModule,RouterLink, MatButtonModule, MatInputModule, MatCheckboxModule],templateUrl:'./inicio-transportista-componente.html',styleUrl:'./inicio-transportista-componente.css'})
export class InicioTransportistaComponente implements OnInit {
 protected sesion=inject(SesionServicio);private api=inject(AgroApiServicio);
 error=signal('');
 cerrarSesion(e:Event){e.preventDefault();this.sesion.cerrarSesion();}
 ngOnInit(){this.cargar();}
lotes=signal<Lote[]>([]);perfil=signal<Usuario|null>(null);
 usado(){return this.lotes().filter(x=>x.estadoLote!=='entregado').reduce((s,l)=>s+(l.cargas||[]).reduce((v,c)=>v+c.pesoKg/1000,0),0);}
 disponible(){return Math.max(0,(this.perfil()?.capacidadToneladas||0)-this.usado());}
 activos(){return this.lotes().filter(x=>['en_transito','con_retraso'].includes(x.estadoLote)).length;}
 cargar(){const id=this.sesion.idUsuario;if(id===null)return;this.api.perfilTransportista(id).subscribe({next:x=>this.perfil.set(x),error:e=>this.error.set(mensajeError(e))});this.api.listarLotesTransportista(id).subscribe({next:x=>this.lotes.set(x),error:e=>this.error.set(mensajeError(e))});}

}
