import { Router } from 'express';

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: student@senecapolytechnic.ca
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       '200':
 *         description: Login successful, returns access and refresh tokens
 *       '401':
 *         description: Invalid credentials
 */
// TODO: Validate credentials, compare bcrypt hash, issue JWT tokens
router.post('/login', (_req, res) => {
  res.status(501).json({
    code: 'NOT_IMPLEMENTED',
    message: 'POST /api/auth/login not yet implemented',
  });
});

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Returns a new access token
 *       '401':
 *         description: Refresh token is invalid or expired
 */
// TODO: Verify refresh token, rotate, issue new access token
router.post('/refresh', (_req, res) => {
  res.status(501).json({
    code: 'NOT_IMPLEMENTED',
    message: 'POST /api/auth/refresh not yet implemented',
  });
});

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '204':
 *         description: Logged out successfully
 *       '401':
 *         description: Refresh token is invalid
 */
// TODO: Revoke refresh token (no access token required)
router.post('/logout', (_req, res) => {
  res.status(501).json({
    code: 'NOT_IMPLEMENTED',
    message: 'POST /api/auth/logout not yet implemented',
  });
});

export default router;
