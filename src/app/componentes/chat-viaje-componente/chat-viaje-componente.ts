import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription, interval, startWith, exhaustMap, catchError, EMPTY } from 'rxjs';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { SolicitudChat, MensajeChat, Lote } from '../../modelos/agro-modelos';
@Component({selector:'app-chat-viaje-componente',standalone:true,imports:[CommonModule,RouterLink,ReactiveFormsModule],templateUrl:'./chat-viaje-componente.html',styleUrl:'./chat-viaje-componente.css'})
export class ChatViajeComponente implements OnInit,OnDestroy {
 private api=inject(AgroApiServicio); private route=inject(ActivatedRoute); protected sesion=inject(SesionServicio);
 solicitudes=signal<SolicitudChat[]>([]); lotes=signal<Lote[]>([]); seleccion=signal<number|null>(null); mensajes=signal<MensajeChat[]>([]);
 error=signal(''); enviando=signal(false); cargando=signal(true); solicitando=signal(false);
 filtro=signal<number|null>(null); texto=new FormControl('',{nonNullable:true,validators:[Validators.required,Validators.maxLength(500)]});
 visibles=computed(()=>this.solicitudes().filter(s=>!this.filtro()||s.lote.idLote===this.filtro()));
 actual=computed(()=>this.solicitudes().find(s=>s.idSolicitud===this.seleccion()));
 lotesVisibles=computed(()=>this.lotes().filter(l=>['formandose','confirmado','en_transito','con_retraso'].includes(l.estadoLote)&&!!l.transportista&&(!this.filtro()||l.idLote===this.filtro())));
 private listaSub?:Subscription; private mensajesSub?:Subscription; private envioSub?:Subscription;
 get inicio(){return this.sesion.rol==='productor'?'/inicio-productor':'/inicio-transportista';}
 get miId(){return this.sesion.idUsuario;}
 nombre(s:SolicitudChat){return this.sesion.rol==='productor'?s.transportista.nombreCompleto:s.productor.nombreCompleto;}
 ngOnInit(){const filtro=Number(this.route.snapshot.queryParamMap.get('idLote'));this.filtro.set(filtro>0?filtro:null);const id=this.miId;if(id===null)return;
  (this.sesion.rol==='productor'?this.api.lotesDeProductor(id):this.api.listarLotesTransportista(id)).subscribe({next:l=>this.lotes.set(l),error:e=>this.error.set(mensajeError(e))});
  this.listaSub=interval(5000).pipe(startWith(0),exhaustMap(()=>this.api.listarSolicitudesChat().pipe(catchError(e=>{this.cargando.set(false);this.error.set(mensajeError(e));return EMPTY;})))).subscribe(s=>{this.solicitudes.set(s);this.cargando.set(false);if(this.seleccion()&&!this.actual())this.cerrar();});
 }
 solicitar(l:Lote){if(this.solicitando())return;this.solicitando.set(true);this.error.set('');this.api.solicitarChats(l.idLote).subscribe({next:s=>{this.solicitudes.update(prev=>[...prev.filter(x=>!s.some(y=>y.idSolicitud===x.idSolicitud)),...s]);this.solicitando.set(false);},error:e=>{this.error.set(mensajeError(e));this.solicitando.set(false);}});}
 abrir(s:SolicitudChat){if(s.estadoSolicitud!=='aprobado'||this.enviando())return;this.cerrar();this.error.set('');this.seleccion.set(s.idSolicitud);this.mensajesSub=interval(5000).pipe(startWith(0),exhaustMap(()=>this.api.mensajesChat(s.idSolicitud).pipe(catchError(e=>{this.error.set(mensajeError(e));return EMPTY;})))).subscribe(m=>{if(this.seleccion()===s.idSolicitud){this.mensajes.set(m);}});}
 cerrar(){this.mensajesSub?.unsubscribe();this.envioSub?.unsubscribe();this.enviando.set(false);this.seleccion.set(null);this.texto.reset();this.mensajes.set([]);}
 enviar(){const id=this.seleccion(),t=this.texto.value.trim();if(!id||!t||this.texto.invalid||this.enviando()||this.actual()?.estadoSolicitud!=='aprobado')return;this.enviando.set(true);this.error.set('');this.envioSub=this.api.enviarMensaje(id,t).subscribe({next:m=>{if(this.seleccion()===id){this.mensajes.update(ms=>ms.some(x=>x.idMensaje===m.idMensaje)?ms:[...ms,m]);this.texto.reset();}this.enviando.set(false);},error:e=>{this.error.set(mensajeError(e));this.enviando.set(false);}});}
 ngOnDestroy(){this.listaSub?.unsubscribe();this.cerrar();}
}
