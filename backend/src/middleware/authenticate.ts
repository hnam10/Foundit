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

  // Missing secret is a server misconfiguration, not a client error — forward as 500
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    next(new Error('JWT_ACCESS_SECRET is not configured'));
    return;
  }

  try {
    // Verify signature and expiry; throws if the token is invalid or expired
    const payload = jwt.verify(token, secret);

    // jwt.verify only guarantees the signature is valid and the token has not
    // expired. It does NOT guarantee the payload contains the fields our app
    // expects (user_id, campus_id, email, role). If we skip this check and cast
    // directly to our User type, a legitimately-signed token that is missing a
    // field (e.g. an old token or a manually crafted one) would set req.user
    // with undefined values — which could silently bypass role checks downstream.
    //
    // This guard ensures every field is present and has the correct type before
    // we attach anything to req.user.
    if (
      typeof payload !== 'object' ||
      payload === null ||
      typeof (payload as Record<string, unknown>).user_id !== 'string' ||
      (typeof (payload as Record<string, unknown>).campus_id !== 'string' &&
        (payload as Record<string, unknown>).campus_id !== null) ||
      typeof (payload as Record<string, unknown>).email !== 'string' ||
      !['student', 'security', 'admin'].includes(
        (payload as Record<string, unknown>).role as string
      )
    ) {
      res
        .status(401)
        .json({ code: 'INVALID_TOKEN', message: 'Access token is invalid' });
      return;
    }

    const p = payload as Record<string, unknown>;
    req.user = {
      user_id: p.user_id as string,
      role: p.role as 'student' | 'security' | 'admin',
      campus_id: (p.campus_id as string | null) ?? null,
      email: p.email as string,
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
