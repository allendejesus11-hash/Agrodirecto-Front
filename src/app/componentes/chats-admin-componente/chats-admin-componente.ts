import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SesionServicio } from '../../servicios/sesion-servicio';

interface SolicitudChat {
  fotoA: string;
  fotoB: string;
  nombres: string;
  detalle: string;
  estado: 'pendiente' | 'aprobado';
}

@Component({
  imports: [RouterLink],
  selector: 'app-chats-admin-componente',
  styleUrl: '../../estilos/admin-base.css',
  templateUrl: './chats-admin-componente.html',
})
export class ChatsAdminComponente {

  protected sesion: SesionServicio = inject(SesionServicio);

  cerrarSesion(evento: Event): void {
    evento.preventDefault();
    this.sesion.cerrarSesion();
  }

  chats = signal<SolicitudChat[]>([
    { fotoA: 'assets/images/persona_real1.png', fotoB: 'assets/images/persona_real2.png', nombres: 'Rosa Quispe Huamán ↔ Miguel Asto Ramos', detalle: 'Lote #A-04 · Papa + Zanahoria · Huancayo', estado: 'pendiente' },
    { fotoA: 'assets/images/persona_real3.png', fotoB: 'assets/images/persona_real4.png', nombres: 'Julio Cesar Anccasi ↔ Daniela Molocho', detalle: 'Lote #A-06 · Papa · Concepción', estado: 'aprobado' },
    { fotoA: 'assets/images/persona_real5.png', fotoB: 'assets/images/persona_real6.png', nombres: 'Elena Ccorimanya ↔ Franco Delgado', detalle: 'Lote #A-07 · Cebolla · Chupaca', estado: 'pendiente' },
  ]);

  // Aprobar / habilitar chat entre productor y transportista
  aprobar(chat: SolicitudChat): void {
    if (chat.estado !== 'pendiente') return;

    this.chats.update((lista) =>
      lista.map((c) => (c === chat ? { ...c, estado: 'aprobado' } : c)),
    );
  }
}
