import { Router } from 'express';

const router = Router();

// TODO: Validate credentials, compare bcrypt hash, issue JWT tokens
router.post('/login', (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'POST /api/auth/login not yet implemented' });
});

// TODO: Verify refresh token, rotate, issue new access token
router.post('/refresh', (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'POST /api/auth/refresh not yet implemented' });
});

// TODO: Revoke refresh token (no access token required)
router.post('/logout', (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'POST /api/auth/logout not yet implemented' });
});

export default router;
