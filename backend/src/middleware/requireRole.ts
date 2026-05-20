import { Request, Response, NextFunction } from 'express';

type UserRole = 'student' | 'security' | 'admin';

// TODO: Return 403 if req.user.role is not in the allowed roles
const requireRole = (..._roles: UserRole[]) => {
  return (_req: Request, res: Response, _next: NextFunction): void => {
    res.status(501).json({
      code: 'NOT_IMPLEMENTED',
      message: 'requireRole middleware not yet implemented',
    });
  };
};

export default requireRole;
