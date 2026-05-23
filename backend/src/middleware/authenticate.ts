import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * Express middleware that verifies the JWT access token on protected routes.
 *
 * Expects the request to include an `Authorization: Bearer <token>` header.
 * On success, attaches the decoded user payload to `req.user` and calls `next()`.
 * On failure, responds with a 401 and a machine-readable error code.
 */
const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  // Reject requests that are missing the Authorization header or not using Bearer scheme
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      code: 'MISSING_TOKEN',
      message: 'Authorization token is required',
    });
    return;
  }

  // Strip the "Bearer " prefix (7 characters) to get the raw token string
  const token = authHeader.slice(7);

  try {
    // Verify signature and expiry; throws if the token is invalid or expired
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      user_id: string;
      role: 'student' | 'security' | 'admin';
      campus_id: string;
      email: string;
    };

    // Attach the verified user identity to the request for downstream handlers
    req.user = {
      user_id: payload.user_id,
      role: payload.role,
      campus_id: payload.campus_id,
      email: payload.email,
    };

    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      // Token was valid but has passed its expiry time — client should refresh
      res
        .status(401)
        .json({ code: 'TOKEN_EXPIRED', message: 'Access token has expired' });
    } else if (err instanceof JsonWebTokenError) {
      // Token is malformed, tampered with, or signed with the wrong secret
      res
        .status(401)
        .json({ code: 'INVALID_TOKEN', message: 'Access token is invalid' });
    } else {
      // Unexpected error — delegate to the global error handler
      next(err);
    }
  }
};

export default authenticate;
