# Frontend de AgendaVital

Aplicación web construida con React y Vite. Se comunica con la API de AgendaVital mediante solicitudes HTTP en JSON.

## Requisitos y configuración

Instala una versión de Node.js compatible con el proyecto. Copia `frontend/.env.example` como `frontend/.env.local` y configura las direcciones e identificadores públicos de desarrollo. Vite expone al navegador las variables que comienzan con `VITE_`; nunca pongas contraseñas, secretos JWT, secretos OAuth ni claves privadas en esas variables.

Variables usadas por el frontend:

- `VITE_API_BASE_URL`: URL base de la API, por ejemplo `http://localhost:3000/api` en desarrollo local.
- `VITE_GOOGLE_CLIENT_ID`: identificador público del cliente OAuth web.
- `VITE_RECAPTCHA_SITE_KEY`: clave pública del sitio reCAPTCHA.

Después de cambiar un archivo `.env.local`, reinicia Vite para cargar los valores nuevos.

## Ejecutar en desarrollo

Desde esta carpeta:

```bash
npm install
npm run dev
```

Vite muestra en la terminal la URL local, normalmente `http://localhost:5173`. Si el puerto está ocupado, revisa la URL que Vite informa antes de agregar ese origen a Google Cloud.

## Compilar y revisar

```bash
npm run build
npm run preview
npm run lint
```

`npm run preview` sirve localmente la compilación de producción. Estos comandos no implican que la API o SQL Server estén ejecutándose.

## Sesión y API

El servicio HTTP usa `VITE_API_BASE_URL`. La sesión actual se guarda en `sessionStorage` y el cliente agrega el JWT como encabezado `Authorization: Bearer`. El uso de cookies seguras es un pendiente documentado en `docs/arquitectura-y-seguridad.md`.

En Docker, el frontend se sirve por Nginx y su URL pública suele ser `http://localhost:8080`. La configuración actual de Compose todavía no pasa las variables de Google y reCAPTCHA al build del frontend.
