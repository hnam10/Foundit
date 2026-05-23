import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Validates req.body against a Zod schema; returns 400 on failure.
export const validate = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: result.error.issues,
      });
      return;
    }
    req.body = result.data;
    next();
  };
};

// Validates req.query against a Zod schema; returns 400 on failure.
export const validateQuery = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: result.error.issues,
      });
      return;
    }
    req.query = result.data as typeof req.query;
    next();
  };
};
