import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import type { Lote } from '../../modelos/agro-modelos';
@Component({ imports: [MatButtonModule, RouterLink, CommonModule, FormsModule], selector: 'app-qr-transportista-componente', styleUrl: './qr-transportista-componente.css', templateUrl: './qr-transportista-componente.html' })
export class QrTransportistaComponente implements OnInit {
  private api=inject(AgroApiServicio); private sesion=inject(SesionServicio); private ruta=inject(ActivatedRoute);
  lotes=signal<Lote[]>([]); seleccionado=signal<Lote|null>(null); error=signal(''); mensaje=signal(''); cargando=signal(true); enviando=signal(false);
  codigo='';
  ngOnInit(){const id=this.sesion.idUsuario; if(id===null){this.cargando.set(false);return;}
    this.api.listarLotesTransportista(id,'activos').subscribe({next: ls=>{this.lotes.set(ls);this.cargando.set(false);const solicitado=Number(this.ruta.snapshot.queryParamMap.get('idLote'));this.seleccionar(ls.find(l=>l.idLote===solicitado)?.idLote ?? ls[0]?.idLote ?? 0);},error:e=>{this.error.set(mensajeError(e));this.cargando.set(false);}});
  }
  seleccionar(id:number){this.codigo='';this.seleccionado.set(this.lotes().find(l=>l.idLote===id)??null);}
  peso(l:Lote){return (l.cargas??[]).reduce((s,c)=>s+c.pesoKg,0);}
  confirmar(){const l=this.seleccionado();if(!l||!this.codigo.trim()||this.enviando())return;this.error.set('');this.mensaje.set('');this.enviando.set(true);
    this.api.confirmarEntrega(l.idLote,this.codigo.trim()).subscribe({next:()=>{this.lotes.update(ls=>ls.filter(x=>x.idLote!==l.idLote));this.seleccionado.set(null);this.codigo='';this.mensaje.set('Entrega confirmada correctamente.');this.enviando.set(false);},error:e=>{this.error.set(mensajeError(e));this.enviando.set(false);}});
  }
}
