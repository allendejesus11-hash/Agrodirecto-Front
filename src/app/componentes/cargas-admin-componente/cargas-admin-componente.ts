import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Usuario, Carga, Lote, Cultivo, PrecioMercado, SolicitudChat, Notificacion, ResumenTransacciones, AhorroProductor, ReputacionTransportista } from '../../modelos/agro-modelos';
@Component({ selector: 'app-cargas-admin-componente', standalone: true, imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule], templateUrl: './cargas-admin-componente.html', styleUrls: ['../../estilos/admin-base.css','./cargas-admin-componente.css'] })
export class CargasAdminComponente implements OnInit {
 private api = inject(AgroApiServicio);
 protected sesion = inject(SesionServicio);
 private router = inject(Router);
 private ruta = inject(ActivatedRoute);
 private fb = inject(FormBuilder);
 error = signal(''); mensaje = signal(''); cargando = signal(false);
 cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }
 ngOnInit(): void { this.cargar(); this.api.listarUsuarios(2).subscribe({next:u=>this.transportistas.set(u.filter(t=>t.estadoCuenta==='verificado')),error:e=>this.error.set(mensajeError(e))});this.cargarAntiguos(); }
 transportistas=signal<Usuario[]>([]); elegidos=signal<number[]>([]); transporte=new FormControl<number|null>(null); flete=new FormControl<number|null>(null);
 seleccionadas=computed(()=>this.cargas().filter(c=>this.elegidos().includes(c.idCarga)));
 peso=computed(()=>this.seleccionadas().reduce((a,c)=>a+c.pesoKg,0));
 disponibles=computed(()=>this.cargas().filter(c=>c.estadoCarga==='publicada'&&!c.idLote&&c.latitudAcopio!=null&&c.longitudAcopio!=null&&c.latitudDestino!=null&&c.longitudDestino!=null));
 alternar(c:Carga){this.elegidos.update(ids=>ids.includes(c.idCarga)?ids.filter(id=>id!==c.idCarga):[...ids,c.idCarga]);}
 consolidar(){const t=Number(this.transporte.value),f=Number(this.flete.value);if(!t||!Number.isFinite(f)||f<=0||!this.elegidos().length||this.cargando())return;if(!window.confirm('¿Crear lote y solicitar confirmación de flete a los productores?'))return;this.cargando.set(true);this.error.set('');this.mensaje.set('');this.api.consolidar(this.elegidos(),t,f).subscribe({next:l=>{this.mensaje.set('Lote '+l.codigoLote+' creado. Los productores deben confirmar su flete; los chats esperan aprobación.');this.elegidos.set([]);this.cargando.set(false);this.cargar();this.cargarAntiguos();},error:e=>{this.error.set(mensajeError(e));this.cargando.set(false);}});}
 antiguos=signal<Lote[]>([]); antiguo=new FormControl<number|null>(null); latO=new FormControl<number|null>(null);lonO=new FormControl<number|null>(null);latD=new FormControl<number|null>(null);lonD=new FormControl<number|null>(null);
 cargarAntiguos(){this.api.lotesAdmin().subscribe({next:l=>this.antiguos.set(l.filter(x=>['formandose','confirmado','en_transito','con_retraso'].includes(x.estadoLote)&&!(x.cargas||[]).some(c=>c.latitudDestino!=null))),error:e=>this.error.set(mensajeError(e))});}
 elegirAntiguo(){const l=this.antiguos().find(x=>x.idLote===Number(this.antiguo.value));this.latO.setValue(l?.latitudOrigen??null);this.lonO.setValue(l?.longitudOrigen??null);this.latD.setValue(l?.latitudDestino??null);this.lonD.setValue(l?.longitudDestino??null);}
 guardarAntiguo(){const id=Number(this.antiguo.value),a=this.latO.value,b=this.lonO.value,c=this.latD.value,d=this.lonD.value;if(!id||a===null||b===null||c===null||d===null||this.cargando())return;if(!window.confirm('¿Confirmar que estas coordenadas corresponden al origen y destino acordados del lote antiguo?'))return;this.cargando.set(true);this.api.guardarPuntosRuta(id,{latitudOrigen:a,longitudOrigen:b,latitudDestino:c,longitudDestino:d}).subscribe({next:()=>{this.mensaje.set('Ruta antigua actualizada.');this.cargando.set(false);this.cargarAntiguos();},error:e=>{this.error.set(mensajeError(e));this.cargando.set(false);}});}

cargas=signal<Carga[]>([]);filtro=signal('todos');
 visibles=computed(()=>this.cargas().filter(c=>this.filtro()==='todos'||c.estadoCarga===this.filtro()));
 cargar(){this.api.listarCargas().subscribe({next:x=>this.cargas.set(x),error:e=>this.error.set(mensajeError(e))});}

}
