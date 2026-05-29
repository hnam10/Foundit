import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { validate } from '../validators/shared';
import { loginSchema, refreshSchema, logoutSchema } from '../validators/auth';
import { comparePassword } from '../utils/password';
import { signAccessToken, signRefreshToken, hashTokenForStorage } from '../utils/token';

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

    const accessToken = signAccessToken({
      user_id: user.userId,
      role: user.role,
      campus_id: user.campusId ?? null,
      email: user.email,
    });

    const refreshToken = signRefreshToken(user.userId);
    const tokenHash = hashTokenForStorage(refreshToken);
    const refreshDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS ?? '7') || 7;

    await prisma.refreshTokenLog.create({
      data: {
        userId: user.userId,
        tokenHash,
        expiresAt: new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000),
      },
    });

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        campusId: user.campusId,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Exchange a refresh token for a new access token
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
 *         description: Returns a new access token (refresh token is rotated)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Refresh token is invalid, expired, or already revoked
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
 *     summary: Revoke a refresh token and log out
 *     description: No access token required. The provided refresh token is revoked and cannot be used again.
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
 *         description: Logged out successfully — no response body
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Refresh token is invalid or already revoked
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
