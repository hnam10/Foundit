import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// TODO: Define zod schemas for login, refresh, and logout request bodies
export const loginSchema = z.object({});

export const refreshSchema = z.object({});

export const logoutSchema = z.object({});

// TODO: Validate req.body against schema; return 400 VALIDATION_ERROR on failure
export const validate = (_schema: z.ZodTypeAny) => {
  return (_req: Request, res: Response, _next: NextFunction): void => {
    res.status(501).json({
      code: 'NOT_IMPLEMENTED',
      message: 'validate middleware not yet implemented',
    });
  };
};
