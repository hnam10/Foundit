import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// TODO: Define zod schemas for login, refresh, and logout request bodies
export const loginSchema = z.object({});

export const refreshSchema = z.object({});

export const logoutSchema = z.object({});

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
