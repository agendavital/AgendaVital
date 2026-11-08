import {
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { JwtAuthGuard } from './JwtAuthGuard';

const TEST_SECRET = 'test-secret-with-at-least-32-characters';

type TestPayload = {
  sub: number;
  role: string;
  iat: number;
  exp: number;
};

function encode(value: object) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function createToken(
  options: {
    payload?: TestPayload;
    secret?: string;
    algorithm?: string;
  } = {},
) {
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: options.algorithm ?? 'HS256', typ: 'JWT' });
  const payload = encode(
    options.payload ?? {
      sub: 42,
      role: 'ADMIN',
      iat: now,
      exp: now + 3600,
    },
  );
  const signature = createHmac('sha256', options.secret ?? TEST_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

function createContext(authorization?: string) {
  const request: {
    headers: { authorization?: string };
    user?: TestPayload;
  } = { headers: {} };

  if (authorization) request.headers.authorization = authorization;

  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  return { context, request };
}

describe('JwtAuthGuard', () => {
  const originalSecret = process.env.JWT_SECRET;
  let guard: JwtAuthGuard;

  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET;
    guard = new JwtAuthGuard();
  });

  afterAll(() => {
    if (originalSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalSecret;
    }
  });

  it('acepta un token valido y adjunta sus claims a la solicitud', () => {
    const token = createToken();
    const { context, request } = createContext(`Bearer ${token}`);

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toMatchObject({ sub: 42, role: 'ADMIN' });
  });

  it('rechaza una solicitud sin token', () => {
    const { context } = createContext();

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rechaza un token con formato invalido', () => {
    const { context } = createContext('Bearer no-es-un-jwt');

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rechaza una firma incorrecta', () => {
    const token = createToken({ secret: 'a-different-secret' });
    const { context } = createContext(`Bearer ${token}`);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rechaza un token expirado', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = createToken({
      payload: { sub: 42, role: 'ADMIN', iat: now - 120, exp: now - 60 },
    });
    const { context } = createContext(`Bearer ${token}`);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rechaza algoritmos distintos de HS256', () => {
    const token = createToken({ algorithm: 'none' });
    const { context } = createContext(`Bearer ${token}`);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rechaza roles que el backend no reconoce', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = createToken({
      payload: { sub: 42, role: 'UNKNOWN', iat: now, exp: now + 3600 },
    });
    const { context } = createContext(`Bearer ${token}`);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('falla con error de servidor si falta JWT_SECRET', () => {
    delete process.env.JWT_SECRET;
    const token = createToken();
    const { context } = createContext(`Bearer ${token}`);

    expect(() => guard.canActivate(context)).toThrow(
      InternalServerErrorException,
    );
  });
});
