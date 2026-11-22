import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../auth/JwtAuthGuard';
import { RolesGuard } from '../../../auth/roles.guard';
import { NotificacionesService } from '../services/notificaciones.service';

type AuthenticatedRequest = Request & {
  user: { sub: number };
};

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    return this.notificacionesService.findAll(request.user.sub);
  }

  @Patch(':notificationId/read')
  markAsRead(
    @Param('notificationId') notificationId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.notificacionesService.markAsRead(
      notificationId,
      request.user.sub,
    );
  }
}
