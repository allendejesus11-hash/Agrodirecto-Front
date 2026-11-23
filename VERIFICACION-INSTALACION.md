# AgroDirecto Angular — instalación y verificación

## Qué se corrigió

1. `src/app/servicios/sesion-servicio.ts`: se sustituyó `@Service()` (no existe en Angular) por `@Injectable({ providedIn: 'root' })`. La lógica de cerrar sesión no cambia.
2. `package.json`: se aprobó **solamente** la ejecución de los scripts de instalación de 4 dependencias concretas, fijadas a las versiones registradas en el `package-lock.json` original:
   - `@parcel/watcher@2.6.0`
   - `esbuild@0.28.2`
   - `lmdb@3.5.6`
   - `msgpackr-extract@3.0.4`
   No se habilita la ejecución indiscriminada de scripts de otras dependencias, y los paquetes mantienen sus versiones originales.
3. Se documentó el requisito de Node.js de Angular 22 y se añadió `.nvmrc` para equipos con gestores de versión compatibles. Versión válida recomendada: Node.js 22.22.3. También se admiten las versiones compatibles indicadas por Angular (`^24.15.0` o `>=26.0.0`).

No se agregaron llamadas a API, no se cambió la configuración de entornos, ni se modificaron pantallas, datos ni rutas.

## Cómo comprobarlo en Windows (IntelliJ o VS Code)

Abra una terminal dentro de `AgroDirecto-Angular` (donde está `package.json`). Compruebe:

```powershell
node --version
npm --version
```

Use una versión de Node compatible con Angular 22 (Node 22.22.3 o superior dentro de la rama 22; alternativamente Node 24.15.0 o superior dentro de la rama 24, o Node 26+). El proyecto declara `npm@11.19.1`.

Ejecute, en este orden:

```powershell
npm ci
npm run build
npm start
```

`npm ci` usa las versiones exactas fijadas en `package-lock.json` y evita actualizar paquetes sin querer. La política `allowScripts` permite ejecutar los scripts de las cuatro dependencias enumeradas, sin ocultar advertencias de instalación. Para revisar autorizaciones y seguridad:

```powershell
npm install-scripts ls
npm audit
```

Según la versión de npm, el comando puede llamarse `npm approve-scripts --allow-scripts-pending`.

## Alcance de la verificación

Se verificaron estáticamente las rutas registradas, los enlaces `routerLink` literales, las rutas de los recursos gráficos, los importes TypeScript relativos, los nombres de manejadores de eventos en las plantillas, los controles de formularios y la sintaxis de los archivos TypeScript. La instalación y la compilación completas **no pudieron comprobarse en el entorno donde se preparó este ZIP**, porque allí no había acceso a `registry.npmjs.org` y la versión de Node disponible era `22.16.0`, incompatible con Angular 22.

Las advertencias de `npm audit` son distintas de los scripts bloqueados: no se silencian ni se ejecuta `npm audit fix --force`, ya que podría introducir cambios incompatibles. Consúltelas y evalúe la actualización cuando se pueda verificar con pruebas completas. La ausencia de API no impide que se inspeccionen las pantallas y los flujos locales ya programados, pero las funciones que requieran backend real seguirán pendientes de esa integración.
