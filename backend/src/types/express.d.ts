import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        role: 'student' | 'security' | 'admin';
        campus_id: string;
        email: string;
      };
    }
  }
}
