import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { RolesGuard } from './roles.guard';

function createContext(role?: string) {
  const request = role ? { user: { role } } : {};
  const handler = jest.fn();
  const controller = jest.fn();
  const context = {
    getHandler: () => handler,
    getClass: () => controller,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  return { context, handler, controller };
}

describe('RolesGuard', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it('permite continuar si no se definieron roles requeridos', () => {
    const { context, handler, controller } = createContext('HR');
    const getRoles = jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValueOnce(undefined);

    expect(guard.canActivate(context)).toBe(true);
    expect(getRoles).toHaveBeenCalledWith(ROLES_KEY, [handler, controller]);
  });

  it('permite el rol requerido', () => {
    const { context } = createContext('ADMIN');
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(['ADMIN']);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rechaza un rol que no tiene permiso', () => {
    const { context } = createContext('HR');
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(['ADMIN']);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
