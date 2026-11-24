# Instalación del proyecto integrado

Esta versión incorpora conexiones API y Security JWT; el documento anterior correspondía a una versión previa sin API.

El procedimiento vigente y el alcance de la integración se explican en `INTEGRACION_75_POR_CIENTO.md`.

Para revisar dependencias: `npm ci` (con Node compatible con Angular 22), `npm run build`, y `npm start` (el proxy reenvía /api al backend del puerto 8088). Los avisos de npm audit no se silencian. 

**Verificación local de autoría**: análisis sintáctico TypeScript y rutas/importaciones; pruebas reales de login/BD requieren PostgreSQL y ejecución local. No presentar el 75% como probado de extremo a extremo sin ejecutar esa batería.
