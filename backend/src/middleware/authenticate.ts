import { Request, Response, NextFunction } from 'express';

// TODO: Verify JWT access token and attach decoded payload to req.user
const authenticate = (
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(501).json({
    code: 'NOT_IMPLEMENTED',
    message: 'authenticate middleware not yet implemented',
  });
};

export default authenticate;
