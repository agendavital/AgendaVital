import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.use((request: Request, response: Response, next: NextFunction) => {
    const isStateChanging = !['GET', 'HEAD', 'OPTIONS'].includes(
      request.method.toUpperCase(),
    );
    const origin = request.headers.origin;

    if (isStateChanging && origin && !allowedOrigins.includes(origin)) {
      response.status(403).json({
        message: 'El origen de la solicitud no esta permitido.',
      });
      return;
    }

    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
