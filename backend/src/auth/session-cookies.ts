import { InternalServerErrorException } from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const ACCESS_COOKIE_NAME = 'agenda_vital_session';
export const CSRF_COOKIE_NAME = 'agenda_vital_csrf';
export const SESSION_MAX_AGE_MS = 60 * 60 * 1000;

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function getCookieOptions(httpOnly: boolean, path: string): CookieOptions {
  return {
    httpOnly,
    secure: isProduction(),
    sameSite: 'lax',
    path,
  };
}

export function setSessionCookies(response: Response, accessToken: string) {
  response.cookie(ACCESS_COOKIE_NAME, accessToken, {
    ...getCookieOptions(true, '/api'),
    maxAge: SESSION_MAX_AGE_MS,
  });

  response.cookie(CSRF_COOKIE_NAME, createCsrfToken(accessToken), {
    ...getCookieOptions(false, '/'),
    maxAge: SESSION_MAX_AGE_MS,
  });
}

export function clearSessionCookies(response: Response) {
  response.clearCookie(ACCESS_COOKIE_NAME, getCookieOptions(true, '/api'));
  response.clearCookie(CSRF_COOKIE_NAME, getCookieOptions(false, '/'));
}

export function readCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;

    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return undefined;
    }
  }

  return undefined;
}

export function hasValidCsrfToken(
  request: Request,
  accessToken: string,
): boolean {
  const cookieToken = readCookie(request, CSRF_COOKIE_NAME);
  const headerValue = request.headers['x-csrf-token'];
  const headerToken = Array.isArray(headerValue) ? headerValue[0] : headerValue;

  if (
    !cookieToken ||
    typeof headerToken !== 'string' ||
    cookieToken.length > 256 ||
    !constantTimeEqual(cookieToken, headerToken)
  ) {
    return false;
  }

  const [nonce, signature, ...extra] = cookieToken.split('.');
  if (
    !nonce ||
    !signature ||
    extra.length > 0 ||
    !/^[A-Za-z0-9_-]{40,}$/.test(nonce) ||
    !/^[A-Za-z0-9_-]{40,}$/.test(signature)
  ) {
    return false;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new InternalServerErrorException(
      'JWT_SECRET no esta configurado en el backend.',
    );
  }

  const expectedSignature = createHmac('sha256', secret)
    .update(`${nonce}.${accessToken}`)
    .digest();
  const providedSignature = Buffer.from(signature, 'base64url');

  return (
    providedSignature.length === expectedSignature.length &&
    providedSignature.toString('base64url') === signature &&
    timingSafeEqual(providedSignature, expectedSignature)
  );
}

function createCsrfToken(accessToken: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new InternalServerErrorException(
      'JWT_SECRET no esta configurado en el backend.',
    );
  }

  const nonce = randomBytes(32).toString('base64url');
  const signature = createHmac('sha256', secret)
    .update(`${nonce}.${accessToken}`)
    .digest('base64url');

  return `${nonce}.${signature}`;
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}
