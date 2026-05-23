import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: err.issues,
    });
    return;
  }

  if (err instanceof TokenExpiredError) {
    res
      .status(401)
      .json({ code: 'TOKEN_EXPIRED', message: 'Access token has expired' });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res
      .status(401)
      .json({ code: 'INVALID_TOKEN', message: 'Access token is invalid' });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : err.message,
    });
    return;
  }

  res
    .status(500)
    .json({ code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' });
};

export default errorHandler;
