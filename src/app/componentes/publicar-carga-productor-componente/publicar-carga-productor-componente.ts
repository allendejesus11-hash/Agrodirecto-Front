import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Component, inject, signal, computed, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AgroApiServicio } from '../../servicios/agro-api-servicio';
import { SesionServicio } from '../../servicios/sesion-servicio';
import { mensajeError } from '../../servicios/mensaje-error';
import { cargarLeaflet, agregarMapaBase, punto, geocodificar } from '../../servicios/mapas-servicio';
import type { Cultivo } from '../../modelos/agro-modelos';

@Component({
  selector: 'app-publicar-carga-productor-componente',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatCheckboxModule],
  templateUrl: './publicar-carga-productor-componente.html',
  styleUrl: './publicar-carga-productor-componente.css'
})
export class PublicarCargaProductorComponente implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(AgroApiServicio);
  protected sesion = inject(SesionServicio);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  error = signal('');
  mensaje = signal('');
  cargando = signal(false);
  cultivos = signal<Cultivo[]>([]);
  tipos = [
    { valor: 'perecible', texto: 'Perecible' },
    { valor: 'seco', texto: 'No perecible' }
  ];
  modalCancelar = signal(false);

  acopioSeleccionado = signal<{ lat: number; lng: number } | null>(null);
  coordenadasAcopioTexto = computed(() => {
    const p = this.acopioSeleccionado();
    return p ? `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}` : 'Haz clic en el mapa para marcar un punto de acopio.';
  });

  private mapa: any;
  private marcador: any;
  private destruido = false;
  errorMapa = signal('');
  buscando = signal(false);
  controlBusqueda = new FormControl('');
  latAcopio = new FormControl<number | null>(null);
  lonAcopio = new FormControl<number | null>(null);

  form = this.fb.nonNullable.group({
    idCultivo: 0,
    pesoKg: 0,
    tipoCarga: 'perecible',
    direccionDestino: '',
    tarifaPropuesta: 0,
    fechaRecojo: '',
    esUrgente: false
  });

  cerrarSesion(e: Event) { e.preventDefault(); this.sesion.cerrarSesion(); }

  ngOnInit(): void { this.cargar(); }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.inicializarMapaAcopio());
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.mapa?.remove();
  }

  cargar() {
    this.api.listarCultivos().subscribe({
      next: c => {
        this.cultivos.set(c);
        if (c.length) this.form.patchValue({ idCultivo: c[0].idCultivo });
      },
      error: e => this.error.set(mensajeError(e))
    });
  }

  fechaLocalHoy(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  publicar() {
    const d = this.form.getRawValue();
    this.error.set('');
    if (!d.idCultivo || d.pesoKg <= 0 || d.pesoKg > 50000 || d.tarifaPropuesta <= 0 || !d.direccionDestino.trim() || !d.fechaRecojo || d.fechaRecojo < this.fechaLocalHoy()) {
      this.error.set('Completa cultivo, peso, tarifa, destino y fecha no anterior a hoy.');
      return;
    }
    const acopio = this.acopioSeleccionado();
    if (!acopio || acopio.lat !== this.latAcopio.value || acopio.lng !== this.lonAcopio.value) { this.error.set('Selecciona el punto de acopio en el mapa o confirma las coordenadas antes de publicar.'); return; }
    this.cargando.set(true);
    this.api.publicarCarga({...d, latitudAcopio: acopio.lat, longitudAcopio: acopio.lng}).subscribe({
      next: r => {
        this.cargando.set(false);
        this.mensaje.set('Carga ' + r.codigoCarga + ' publicada.');
        this.router.navigateByUrl('/cargas-productor');
      },
      error: e => {
        this.cargando.set(false);
        this.error.set(mensajeError(e));
      }
    });
  }

  async inicializarMapaAcopio(): Promise<void> {
    const el = document.getElementById('mapa-acopio');
    if (!el || this.mapa || this.destruido) return;
    try {
      const L = await cargarLeaflet();
      if (this.destruido || !el.isConnected) return;
      this.mapa = L.map(el, { zoomControl: true }).setView([-11.52, -75.9], 7);
      agregarMapaBase(L, this.mapa);
      this.mapa.on('click', (e: any) => this.actualizarPuntoAcopio(e.latlng.lat, e.latlng.lng));
      const previo = this.acopioSeleccionado();
      if (previo) this.actualizarPuntoAcopio(previo.lat, previo.lng);
      this.errorMapa.set('');
      setTimeout(() => this.mapa?.invalidateSize(), 100);
    } catch { this.errorMapa.set('No se pudo cargar el mapa. Puedes ingresar las coordenadas manualmente.'); }
  }

  registrarAcopioManual(): void {
    const p = punto(this.latAcopio.value, this.lonAcopio.value);
    if (!p) { this.errorMapa.set('Introduce latitud y longitud válidas.'); return; }
    this.actualizarPuntoAcopio(p.lat, p.lon);
  }

  async buscarAcopio(): Promise<void> {
    const texto = this.controlBusqueda.value?.trim();
    if (!texto || this.buscando()) return;
    this.buscando.set(true);
    const p = await geocodificar(texto);
    if (this.destruido) return;
    this.buscando.set(false);
    if (!p) { this.errorMapa.set('No se encontró la dirección. Selecciona el punto en el mapa o ingresa coordenadas.'); return; }
    this.errorMapa.set('');
    // La búsqueda centra el mapa; el productor confirma el punto con un clic o coordenadas.
    this.mapa?.setView([p.lat,p.lon], 15);
    this.latAcopio.setValue(p.lat); this.lonAcopio.setValue(p.lon);
  }

  private actualizarPuntoAcopio(lat: number, lng: number): void {
    const p = punto(lat,lng);
    if (!p) return;
    this.acopioSeleccionado.set({ lat, lng });
    this.latAcopio.setValue(lat); this.lonAcopio.setValue(lng);
    this.errorMapa.set('');
    if (!this.mapa) return;
    const L = (window as any).L;
    const icono = L.divIcon({className:'pin-acopio-wrapper',html:'<div class="pin-acopio"></div>',iconSize:[22,22],iconAnchor:[11,11]});
    if (!this.marcador) {
      this.marcador = L.marker([lat,lng],{draggable:true,icon:icono}).addTo(this.mapa);
      this.marcador.on('dragend',(event:any)=>{ const pos=event.target.getLatLng(); this.actualizarPuntoAcopio(pos.lat,pos.lng); });
    } else this.marcador.setLatLng([lat,lng]);
    this.marcador.bindPopup('Punto de acopio seleccionado').openPopup();
  }
}
