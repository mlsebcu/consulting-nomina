import type { NextFunction, Request, Response } from 'express';

const HSTS_MAX_AGE_SEGUNDOS = 31_536_000;

export function cabecerasSeguridad(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader(
    'Strict-Transport-Security',
    `max-age=${HSTS_MAX_AGE_SEGUNDOS}; includeSubDomains`,
  );
  next();
}
