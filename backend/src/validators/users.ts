import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// TODO: Define zod schemas for user creation, profile update, notification toggle, and admin list query
export const createUserSchema = z.object({});

export const updateProfileSchema = z.object({});

export const updateNotificationSchema = z.object({});

export const listUsersQuerySchema = z.object({});

// TODO: Validate req.query against schema; return 400 VALIDATION_ERROR on failure
export const validateQuery = (_schema: z.ZodTypeAny) => {
  return (_req: Request, res: Response, _next: NextFunction): void => {
    res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'validateQuery middleware not yet implemented' });
  };
};
