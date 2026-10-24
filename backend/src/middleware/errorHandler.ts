import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId || 'unknown';

  if (err instanceof AppError) {
    console.error(`[${requestId}] AppError: ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  console.error(`[${requestId}] Unhandled error:`, err);

  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message || 'Internal server error',
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}
