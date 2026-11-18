import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SesionServicio } from '../../servicios/sesion-servicio';

type FiltroUsuario = 'todos' | 'productor' | 'transportista';

interface Usuario {
  foto: string;
  nombre: string;
  detalle: string;
  tipo: 'productor' | 'transportista';
  bloqueado: boolean;
}

@Component({
  imports: [RouterLink],
  selector: 'app-usuarios-admin-componente',
  styleUrl: '../../estilos/admin-base.css',
  templateUrl: './usuarios-admin-componente.html',
})
export class UsuariosAdminComponente {

  protected sesion: SesionServicio = inject(SesionServicio);

  cerrarSesion(evento: Event): void {
    evento.preventDefault();
    this.sesion.cerrarSesion();
  }

  filtro = signal<FiltroUsuario>('todos');

  usuarios = signal<Usuario[]>([
    { foto: 'assets/images/persona_real1.png', nombre: 'Rosa Quispe Huamán', detalle: 'Productora · Huancayo', tipo: 'productor', bloqueado: false },
    { foto: 'assets/images/persona_real2.png', nombre: 'Miguel Asto Ramos', detalle: 'Transportista · Placa A62BX-5T', tipo: 'transportista', bloqueado: false },
    { foto: 'assets/images/persona_real3.png', nombre: 'Julio Cesar Anccasi', detalle: 'Productor · Chupaca', tipo: 'productor', bloqueado: true },
    { foto: 'assets/images/persona_real4.png', nombre: 'Daniela Molocho', detalle: 'Transportista · Camión 10 t', tipo: 'transportista', bloqueado: false },
  ]);

  filtrar(filtro: FiltroUsuario): void {
    this.filtro.set(filtro);
  }

  esVisible(usuario: Usuario): boolean {
    return this.filtro() === 'todos' || usuario.tipo === this.filtro();
  }

  // Alternar entre verificado y bloqueado
  alternarEstado(usuario: Usuario): void {
    this.usuarios.update((lista) =>
      lista.map((u) => (u === usuario ? { ...u, bloqueado: !u.bloqueado } : u)),
    );
  }
}
