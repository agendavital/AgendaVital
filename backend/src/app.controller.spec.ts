import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './database/prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  const prisma = {
    usuario: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: PrismaService, useValue: prisma }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('devuelve el mensaje del backend', () => {
      expect(appController.getHello()).toBe('AgendaVital Backend funcionando');
    });
  });

  describe('prueba-db', () => {
    it('devuelve una respuesta de prueba con usuarios limitados', async () => {
      prisma.usuario.findMany.mockResolvedValue([
        { UsuarioId: 1, Correo: 'admin@example.com' },
      ]);

      await expect(appController.pruebaDB()).resolves.toEqual({
        conectado: true,
        cantidad: 1,
        usuarios: [{ UsuarioId: 1, Correo: 'admin@example.com' }],
      });
      expect(prisma.usuario.findMany).toHaveBeenCalledWith({
        take: 5,
        select: {
          UsuarioId: true,
          Correo: true,
          Nombres: true,
          Apellidos: true,
          Activo: true,
        },
      });
    });
  });
});
