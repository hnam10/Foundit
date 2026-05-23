import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// TODO: Define zod schemas for user creation, profile update, notification toggle, and admin list query
export const createUserSchema = z.object({});

export const updateProfileSchema = z.object({});

export const updateNotificationSchema = z.object({});

export const listUsersQuerySchema = z.object({});

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
