# Backend de AgendaVital

API REST construida con NestJS y TypeScript. Usa Prisma para acceder a SQL Server. La API aplica el prefijo `/api`.

## Requisitos

- Node.js compatible con la versión usada por el proyecto.
- SQL Server accesible en la dirección configurada en `DB_SERVER` y `DB_PORT`.
- Variables de entorno configuradas en `backend/.env`.

Para crear `backend/.env`, copia `backend/.env.example` y reemplaza los marcadores por los valores locales. No compartas ni subas el archivo `.env`.

La base de datos de desarrollo puede levantarse desde la raíz del repositorio con Docker Compose. Sigue el inicio rápido del README principal. Para iniciar solamente la base de datos y su inicialización, ejecuta `docker compose --env-file .env.docker up -d database database-init`.

## Variables de entorno

`backend/.env.example` muestra nombres y marcadores ficticios. La aplicación actualmente consume:

- `DB_SERVER`, `DB_PORT`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`: conexión a SQL Server.
- `JWT_SECRET`: secreto privado para firmar y verificar sesiones JWT.
- `PORT`: puerto de la API; si no está definido, NestJS usa `3000`.
- `FRONTEND_URL`: orígenes permitidos por CORS y base del enlace de recuperación.
- `GOOGLE_CLIENT_ID`: Client ID OAuth esperado al verificar el login de Google.
- `RECAPTCHA_PROJECT_ID`, `RECAPTCHA_SITE_KEY`, `RECAPTCHA_API_KEY`, `RECAPTCHA_ALLOWED_HOSTNAMES`: verificación de reCAPTCHA Enterprise.
- `SMIP_HOST`, `SMIP_PORT`, `SMIP_USER`, `SMIP_PASS`, `SMIP_FROM`, `SMIP_SECURE`: configuración SMTP según los nombres que espera hoy `AuthService`.

El prefijo `SMIP_` está escrito así en el código actual. No lo cambies solo en el `.env`: el nombre del código y el de la variable deben coincidir. Docker Compose aún no entrega al backend las variables de reCAPTCHA ni SMTP.

## Instalar y ejecutar en desarrollo

Desde esta carpeta:

```bash
npm install
npm run start:dev
```

La API queda disponible en `http://localhost:3000/api`, salvo que configures otro `PORT`. Si ejecutas el backend local y Docker intenta publicar el mismo puerto, detén uno de los dos procesos o configura un puerto distinto.

## Comandos disponibles

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
```

`npm run lint` ejecuta ESLint con `--fix` y puede modificar archivos. Las pruebas y compilaciones deben ejecutarse para validar cambios; esta guía no afirma que se hayan ejecutado recientemente.

## Estructura relevante

- `src/auth/`: endpoints y lógica de autenticación, roles y recuperación.
- `src/database/prisma/`: módulo y servicio Prisma.
- `prisma/schema.prisma`: modelos de SQL Server usados por Prisma.
- `docker/`: inicialización y seed usados por Docker Compose.
