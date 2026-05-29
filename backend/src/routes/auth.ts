import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { validate } from '../validators/shared';
import { loginSchema, refreshSchema, logoutSchema } from '../validators/auth';
import { comparePassword } from '../utils/password';

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Log in with email and password
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
 *                 example: student@myseneca.ca
 *               password:
 *                 type: string
 *                 example: Secret@1234
 *     responses:
 *       '200':
 *         description: Login successful — returns access token, refresh token, and user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [student, security, admin]
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     campusId:
 *                       type: string
 *                       nullable: true
 *       '400':
 *         description: Validation error (e.g. not a @myseneca.ca email)
 *       '401':
 *         description: Email or password is incorrect
 *       '403':
 *         description: Account has been deactivated
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;

    // Look up the user by email — same generic error for not found and wrong password
    // to avoid leaking whether an email is registered.
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect.',
      });
      return;
    }

    // Check is_active before bcrypt to avoid unnecessary hashing work
    if (!user.isActive) {
      res.status(403).json({
        code: 'ACCOUNT_INACTIVE',
        message: 'Your account has been deactivated. Contact an administrator.',
      });
      return;
    }

    const passwordMatch = await comparePassword(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect.',
      });
      return;
    }

    // Token issuance in next commit
    res.status(200).json({ message: 'credentials verified (tokens pending)' });
  } catch (err) {
    next(err);
  }
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
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Refresh token is invalid or expired
 *       '501':
 *         description: Not yet implemented
 */
// TODO: Verify refresh token, rotate, issue new access token
router.post('/refresh', validate(refreshSchema), (_req, res) => {
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
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Refresh token is invalid
 *       '501':
 *         description: Not yet implemented
 */
// TODO: Revoke refresh token (no access token required)
router.post('/logout', validate(logoutSchema), (_req, res) => {
  res.status(501).json({
    code: 'NOT_IMPLEMENTED',
    message: 'POST /api/auth/logout not yet implemented',
  });
});

export default router;
