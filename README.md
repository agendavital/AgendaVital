# AgendaVital

Plataforma web para apoyar la gestión de candidatos, empresas, clínicas, profesionales, documentos, citas y procesos de salud ocupacional.

## Organización del proyecto

- `frontend/`: aplicación web construida con React y Vite.
- `backend/`: API REST construida con NestJS y TypeScript.
- `backend/prisma/`: esquema de datos y configuración de Prisma para SQL Server.
- `compose.yaml`: servicios para ejecutar la base de datos, su inicialización, la API y el frontend con Docker Compose.
- `docs/arquitectura-y-seguridad.md`: arquitectura, flujos de autenticación, controles existentes y pendientes conocidos.

Consulta los README de `frontend/` y `backend/` para instrucciones propias de cada aplicación. Usa los archivos `.env.example` como referencia; no publiques archivos `.env` ni credenciales reales.

## Ejecutar el proyecto con Docker

1. Copia `.env.docker.example` como `.env.docker` y configura localmente `MSSQL_SA_PASSWORD`, `ADMIN_PASSWORD`, `JWT_SECRET` y `GOOGLE_CLIENT_ID`. Puedes definir `ADMIN_EMAIL`; si no, Compose usa el correo de demostración indicado en su configuración.
2. Desde la raíz del repositorio, ejecuta:

   ```bash
   docker compose --env-file .env.docker up -d
   ```

3. Abre `http://localhost:8080`. La API se publica en `http://localhost:3000/api`.

`.env.docker` está excluido de Git. No lo subas ni compartas sus valores.

La configuración actual de Compose inicia los servicios, pero todavía no pasa al frontend y backend todos los valores necesarios para reCAPTCHA y Google. Consulta [arquitectura y seguridad](docs/arquitectura-y-seguridad.md) antes de considerar esos accesos configurados en Docker.
