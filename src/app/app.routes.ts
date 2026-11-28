import { authGuard } from './guards/auth-guard';
import { Routes } from '@angular/router';
import {CalificacionViajeProductorComponente} from './componentes/calificacion-viaje-productor-componente/calificacion-viaje-productor-componente';
import {CargasAdminComponente} from './componentes/cargas-admin-componente/cargas-admin-componente';
import {CargasProductorComponente} from './componentes/cargas-productor-componente/cargas-productor-componente';
import {ChatsAdminComponente} from './componentes/chats-admin-componente/chats-admin-componente';
import {CrearProductorComponente} from './componentes/crear-productor-componente/crear-productor-componente';
import {CrearTransportistaComponente} from './componentes/crear-transportista-componente/crear-transportista-componente';
import {FleteProductorComponente} from './componentes/flete-productor-componente/flete-productor-componente';
import {GastosViajeTransportistaComponente} from './componentes/gastos-viaje-transportista-componente/gastos-viaje-transportista-componente';
import {HomeComponente} from './componentes/home-componente/home-componente';
import {InformacionProductorComponente} from './componentes/informacion-productor-componente/informacion-productor-componente';
import {InicioAdminComponente} from './componentes/inicio-admin-componente/inicio-admin-componente';
import {InicioProductorComponente} from './componentes/inicio-productor-componente/inicio-productor-componente';
import {InicioSesionComponente} from './componentes/inicio-sesion-componente/inicio-sesion-componente';
import {InicioTransportistaComponente} from './componentes/inicio-transportista-componente/inicio-transportista-componente';
import {LogrosProductorComponente} from './componentes/logros-productor-componente/logros-productor-componente';
import {LotesTransportistaComponente} from './componentes/lotes-transportista-componente/lotes-transportista-componente';
import {LotesTransportista2Componente} from './componentes/lotes-transportista2-componente/lotes-transportista2-componente';
import {NotificacionesProductorComponente} from './componentes/notificaciones-productor-componente/notificaciones-productor-componente';
import {NotificacionesTransportistaComponente} from './componentes/notificaciones-transportista-componente/notificaciones-transportista-componente';
import {PagosComisionesProductorComponente} from './componentes/pagos-comisiones-productor-componente/pagos-comisiones-productor-componente';
import {PerfilAdminComponente} from './componentes/perfil-admin-componente/perfil-admin-componente';
import {PerfilTransportistaComponente} from './componentes/perfil-transportista-componente/perfil-transportista-componente';
import {PreciosProductorComponente} from './componentes/precios-productor-componente/precios-productor-componente';
import {PreciosProductor2Componente} from './componentes/precios-productor2-componente/precios-productor2-componente';
import {PublicarCargaProductorComponente} from './componentes/publicar-carga-productor-componente/publicar-carga-productor-componente';
import {QrTransportistaComponente} from './componentes/qr-transportista-componente/qr-transportista-componente';
import {ReportesAdminComponente} from './componentes/reportes-admin-componente/reportes-admin-componente';
import {RetornoTransportistaComponente} from './componentes/retorno-transportista-componente/retorno-transportista-componente';
import {SeguimientoViajeComponente} from './componentes/seguimiento-viaje-componente/seguimiento-viaje-componente';
import {SuscripcionProductorComponente} from './componentes/suscripcion-productor-componente/suscripcion-productor-componente';
import {SuscripcionTransportistaComponente} from './componentes/suscripcion-transportista-componente/suscripcion-transportista-componente';
import {UsuariosAdminComponente} from './componentes/usuarios-admin-componente/usuarios-admin-componente';
import {ViajesProductorComponente} from './componentes/viajes-productor-componente/viajes-productor-componente';

import {ChatViajeComponente} from './componentes/chat-viaje-componente/chat-viaje-componente';
import {PreciosAdminComponente} from './componentes/precios-admin-componente/precios-admin-componente';
export const routes: Routes = [
  {path:'precios-admin',canActivate:[authGuard],data:{rol:'administrador'},component:PreciosAdminComponente},
  { path: 'chats-productor', canActivate:[authGuard], data:{rol:'productor'}, component:ChatViajeComponente },
  { path: 'chats-transportista', canActivate:[authGuard], data:{rol:'transportista'}, component:ChatViajeComponente },
  { path: 'calificacion-viaje-productor', canActivate: [authGuard], data: {rol:'productor'}, component: CalificacionViajeProductorComponente },
  { path: 'cargas-admin', canActivate: [authGuard], data: {rol:'administrador'}, component: CargasAdminComponente },
  { path: 'cargas-productor', canActivate: [authGuard], data: {rol:'productor'}, component: CargasProductorComponente },
  { path: 'chats-admin', canActivate: [authGuard], data: {rol:'administrador'}, component: ChatsAdminComponente },
  { path: 'crear-productor', component: CrearProductorComponente },
  { path: 'crear-transportista', component: CrearTransportistaComponente },
  { path: 'flete-productor', canActivate: [authGuard], data: {rol:'productor'}, component: FleteProductorComponente },
  // HU-20: Gastos de viaje (transportista)
  { path: 'gastos-viaje-transportista', canActivate: [authGuard], data: {rol:'transportista'}, component: GastosViajeTransportistaComponente },
  { path: '', component: HomeComponente },
  { path: 'home', component: HomeComponente },
  { path: 'informacion-productor', canActivate: [authGuard], data: {rol:'productor'}, component: InformacionProductorComponente },
  { path: 'inicio-admin', canActivate: [authGuard], data: {rol:'administrador'}, component: InicioAdminComponente },
  { path: 'inicio-productor', canActivate: [authGuard], data: {rol:'productor'}, component: InicioProductorComponente },
  { path: 'inicio-sesion', component: InicioSesionComponente },
  { path: 'inicio-transportista', canActivate: [authGuard], data: {rol:'transportista'}, component: InicioTransportistaComponente },
  { path: 'logros-productor', canActivate: [authGuard], data: {rol:'productor'}, component: LogrosProductorComponente },
  { path: 'lotes-transportista', canActivate: [authGuard], data: {rol:'transportista'}, component: LotesTransportistaComponente },
  { path: 'lotes-transportista2', canActivate: [authGuard], data: {rol:'transportista'}, component: LotesTransportista2Componente },
  { path: 'notificaciones-productor', canActivate: [authGuard], data: {rol:'productor'}, component: NotificacionesProductorComponente },
  { path: 'notificaciones-transportista', canActivate: [authGuard], data: {rol:'transportista'}, component: NotificacionesTransportistaComponente },
  // HU-12: Pagos y comisiones (productor)
  { path: 'pagos-comisiones-productor', canActivate: [authGuard], data: {rol:'productor'}, component: PagosComisionesProductorComponente },
  { path: 'perfil-admin', canActivate: [authGuard], data: {rol:'administrador'}, component: PerfilAdminComponente },
  { path: 'perfil-publico-transportista', canActivate: [authGuard], data: {rol:'productor'}, component: PerfilTransportistaComponente },
  { path: 'perfil-transportista', canActivate: [authGuard], data: {rol:'transportista'}, component: PerfilTransportistaComponente },
  { path: 'perfil-transportista2', redirectTo: 'gastos-viaje-transportista', pathMatch: 'full' },
  { path: 'precios-productor', canActivate: [authGuard], data: {rol:'productor'}, component: PreciosProductorComponente },
  { path: 'precios-productor2', redirectTo:'precios-productor', pathMatch:'full' },
  { path: 'publicar-carga-productor', canActivate: [authGuard], data: {rol:'productor'}, component: PublicarCargaProductorComponente },
  { path: 'qr-transportista', canActivate: [authGuard], data: {rol:'transportista'}, component: QrTransportistaComponente },
  { path: 'reportes-admin', canActivate: [authGuard], data: {rol:'administrador'}, component: ReportesAdminComponente },
  // HU-14: Cargas de retorno (transportista)
  { path: 'retorno-transportista', canActivate: [authGuard], data: {rol:'transportista'}, component: RetornoTransportistaComponente },
  { path: 'rutas-transportista', redirectTo: 'seguimiento-viaje-transportista', pathMatch: 'full' },
  // HU-18: Seguimiento de viaje (productor + transportista)
  { path: 'seguimiento-viaje', canActivate: [authGuard], data: {rol:'productor'}, component: SeguimientoViajeComponente },
  { path: 'seguimiento-viaje-transportista', canActivate: [authGuard], data: {rol:'transportista'}, component: SeguimientoViajeComponente },
  // HU-21: Suscripción premium (ambos roles – componentes separados)
  { path: 'suscripcion-productor', canActivate: [authGuard], data: {rol:'productor'}, component: SuscripcionProductorComponente },
  { path: 'suscripcion-transportista', canActivate: [authGuard], data: {rol:'transportista'}, component: SuscripcionTransportistaComponente },
  { path: 'usuarios-admin', canActivate: [authGuard], data: {rol:'administrador'}, component: UsuariosAdminComponente },
  { path: 'viajes-productor', canActivate: [authGuard], data: {rol:'productor'}, component: ViajesProductorComponente },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];
