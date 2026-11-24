import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Lote, Carga, Usuario, AhorroProductor, ResumenTransacciones } from '../../modelos/agro-modelos';
@Component({selector:'app-inicio-admin-componente',standalone:true,imports:[CommonModule,RouterLink, MatButtonModule],templateUrl:'./inicio-admin-componente.html',styleUrl:'../../estilos/admin-base.css'})
export class InicioAdminComponente implements OnInit {
 protected sesion=inject(SesionServicio);private api=inject(AgroApiServicio);
 error=signal('');
 cerrarSesion(e:Event){e.preventDefault();this.sesion.cerrarSesion();}
 ngOnInit(){this.cargar();}
resumen=signal<ResumenTransacciones|null>(null);
 cargas=signal<Carga[]>([]);usuarios=signal<Usuario[]>([]);
 numProductores(){return this.usuarios().filter(x=>x.rol?.nombreRol?.toLowerCase()==='productor').length;}
 numTransportistas(){return this.usuarios().filter(x=>x.rol?.nombreRol?.toLowerCase()==='transportista').length;}
 numCargasActivas(){return this.cargas().filter(x=>x.estadoCarga==='publicada').length;}
 enRevision(){return this.cargas().filter(x=>x.estadoCarga==='en_revision');}
 cargar(){this.api.listarUsuarios().subscribe({next:x=>this.usuarios.set(x),error:e=>this.error.set(mensajeError(e))});this.api.resumenTransacciones().subscribe({next:x=>this.resumen.set(x),error:e=>this.error.set(mensajeError(e))});this.api.listarCargas().subscribe({next:x=>this.cargas.set(x),error:e=>this.error.set(mensajeError(e))});}

}
