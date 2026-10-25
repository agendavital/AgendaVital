import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/JwtAuthGuard';
import { Roles } from './auth/roles.decorator';
import { RolesGuard } from './auth/roles.guard';
import { PrismaService } from './database/prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHello(): string {
    return 'AgendaVital Backend funcionando';
  }

  @Get('prueba-db')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async pruebaDB() {
    const usuarios = await this.prisma.usuario.findMany({
      take: 5,
      select: {
        UsuarioId: true,
        Correo: true,
        Nombres: true,
        Apellidos: true,
        Activo: true,
      },
    });

    return {
      conectado: true,
      cantidad: usuarios.length,
      usuarios,
    };
  }
}
