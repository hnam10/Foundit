import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res
        .status(401)
        .json({ code: 'UNAUTHENTICATED', message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res
        .status(403)
        .json({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export default requireRole;
