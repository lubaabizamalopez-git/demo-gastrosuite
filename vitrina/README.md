# GastroSuite · Vitrina online

Vitrina pública para el cliente final (Angular 17 con SSR). Consume la API NestJS (`/api/v1/vitrina/...`) y **nunca** accede directo a la BD.

## Desarrollo

```bash
# 1. Backend en el puerto 3000 (carpeta backend)
npm run start:dev

# 2. Vitrina en http://localhost:4300 (hace proxy de /api y /uploads al backend)
npm start
```

URL por restaurante: `http://localhost:4300/<slug>` (ej. `/vitrina-demo`).

## Pagos (Webpay Plus)

Sin variables de entorno el backend usa el **ambiente de integración** de Transbank (pruebas).
Producción: definir en el backend `WEBPAY_ENTORNO=PRODUCCION`, `WEBPAY_CODIGO_COMERCIO` y `WEBPAY_API_KEY`.

## Producción (Docker)

El contenedor ejecuta el servidor SSR (puerto 4000), que además hace proxy de `/api` y `/uploads` hacia `API_URL`
(por defecto `http://localhost:3000`; en docker-compose `http://backend:3000`).
