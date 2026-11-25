# AgroDirecto — integración frontend/API (HU-01 a HU-16)

Versión de Angular: proyecto original Angular Material; HTTP con `environment.apiURL`, `HttpClient` e interceptor JWT, patrón empleado en clases del profesor. Se conserva el sistema de roles de Spring Security existente. Se usan respuestas reales, no datos de prueba codificados.

## Preparación

1. Crear base PostgreSQL `agrodirecto` y ejecutar `src/main/resources/db/agrodirecto_schema_postgresql.sql` del backend. Para demostración, ejecutar opcionalmente `datos_prueba_postgresql_bcrypt.sql` en el orden recomendado (revisar si ya existen registros).
2. Proveer variables del backend: `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` (mínimo 32 caracteres) según `application.properties`; los valores por defecto son solo para el entorno local; iniciar backend en `http://localhost:8088` (Spring Boot). No subir contraseñas reales a Git.
3. Frontend: Node compatible con Angular 22; `npm ci`, `npm run build`, `npm start`. Proxy en `proxy.conf.json` reenvía `/api` a `http://localhost:8088`.
4. Abrir `http://localhost:4200`. Registrar usuario y verificarlo desde una cuenta administradora; iniciar sesión. JWT se guarda en sessionStorage, header Authorization Bearer se envía solo al backend `/api/v1/`.

## Alcance

Conectadas a endpoints: HU-01 registro/autenticación; HU-02 publicación/listado propio/cancelación; HU-03 historial de transportista; HU-04 calificar lote entregado; HU-05 administración de cuentas; HU-06 aprobar chat; HU-07 cotizaciones del día; HU-08 notificaciones; HU-09 transacciones y resumen; HU-10 supervisión de cargas; HU-11 consolidación por lote; HU-12 saldo y desglose; HU-13 ahorros; HU-14 retorno; HU-15 perfil/reputación; HU-16 perfil y permisos del administrador. Son 16/21 historias (76,2 %).

**Límites de la API recibida**: HU-07 devuelve precio de hoy, no tendencia histórica; HU-11 devuelve estados de cargas, no una confirmación separada por productor; HU-15 devuelve total de reseñas, no número total de viajes. No se muestran datos ficticios ni se afirma que esos subcriterios estén cubiertos.

HU-17, HU-18, HU-19, HU-20 y HU-21 fuera del 75 %; su interfaz preexistente puede seguir siendo maqueta y no se presenta como integrada.

## Seguridad

Guard de rutas por rol para UX, interceptor que añade Bearer, permisos definitivos aplicados en Spring Security. Cuentas bloqueadas no pueden operar. Login y registro son endpoints públicos. No se modificaron reglas SecurityConfig.

## Pruebas y límites de verificación

Se comprobó correspondencia estática de rutas y DTO con los controladores incluidos. La compilación Angular y las pruebas de extremo a extremo requieren dependencias npm descargadas, PostgreSQL y backend ejecutándose; **no se declaran como aprobadas sin haber sido ejecutadas**. Probar con los roles productor, transportista y administrador, y respuestas 400/401/403/409.
