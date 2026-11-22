import {
  Injectable,
  Logger,
  NestInterceptor,
  type CallHandler,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { mergeMap, type Observable } from 'rxjs';
import { PrismaService } from '../../../database/prisma/prisma.service';

type AuthenticatedRequest = Request & {
  user?: { sub?: number };
};

const ACTION_LABELS: Record<string, string> = {
  POST: 'CREAR',
  PUT: 'ACTUALIZAR',
  PATCH: 'ACTUALIZAR',
  DELETE: 'ELIMINAR',
};

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditoriaInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();
    const method = request.method.toUpperCase();
    const userId = request.user?.sub;

    if (!ACTION_LABELS[method] || !userId) {
      return next.handle();
    }

    const path = request.originalUrl.split('?')[0];
    const segments = path
      .replace(/^\/api\/?/, '')
      .split('/')
      .filter(Boolean);
    const entity = segments[0] ?? 'sistema';
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      mergeMap(async (result: unknown) => {
        try {
          const resultId =
            typeof result === 'object' && result !== null && 'id' in result
              ? String(result.id)
              : null;

          await this.prisma.auditoria.create({
            data: {
              UsuarioId: userId,
              Accion: ACTION_LABELS[method],
              Entidad: entity.slice(0, 80),
              EntidadId: resultId?.slice(0, 80) ?? null,
              Detalle: `${method} ${path} (${response.statusCode})`,
              DireccionIp: request.ip?.slice(0, 45) ?? null,
            },
          });
        } catch (error) {
          this.logger.error(
            'No se pudo guardar el registro de auditoría.',
            error instanceof Error ? error.stack : undefined,
          );
        }

        return result;
      }),
    );
  }
}
