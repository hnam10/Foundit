import { Router } from 'express';
import { User } from '@prisma/client';
import { prisma } from '../db';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';
import { validate } from '../validators/shared';
import {
  updateProfileSchema,
  updateNotificationSchema,
} from '../validators/users';

const router = Router();

/** Public profile fields — never expose passwordHash. */
const userProfileSelect = {
  userId: true,
  email: true,
  username: true,
  role: true,
  firstName: true,
  lastName: true,
  campusId: true,
  phone: true,
  studentNumber: true,
  employeeId: true,
  emailNotificationOptIn: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

type UserProfileRow = Pick<User, keyof typeof userProfileSelect>;

function toUserProfileDto(user: UserProfileRow) {
  return {
    userId: user.userId,
    email: user.email,
    username: user.username,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    campusId: user.campusId,
    phone: user.phone,
    studentNumber:
      user.studentNumber !== null ? Number(user.studentNumber) : null,
    employeeId: user.employeeId,
    emailNotificationOptIn: user.emailNotificationOptIn,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * @openapi
 * /api/users/me:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Current user's profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                 username:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [student, security, admin]
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 campusId:
 *                   type: string
 *                   format: uuid
 *                   nullable: true
 *                 phone:
 *                   type: string
 *                   nullable: true
 *                 studentNumber:
 *                   type: integer
 *                   nullable: true
 *                 employeeId:
 *                   type: string
 *                   nullable: true
 *                 emailNotificationOptIn:
 *                   type: boolean
 *                 isActive:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       '401':
 *         description: Missing or invalid access token
 *       '403':
 *         description: Account has been deactivated
 *       '404':
 *         description: User no longer exists
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: req.user!.user_id },
      select: userProfileSelect,
    });

    if (!user) {
      res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'User account no longer exists.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        code: 'ACCOUNT_INACTIVE',
        message:
          'Your account has been deactivated. Contact an administrator.',
      });
      return;
    }

    res.status(200).json(toUserProfileDto(user));
  } catch (err) {
    next(err);
  }
});

// TODO: Update first_name, last_name, or phone
router.patch(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  (_req, res) => {
    res.status(501).json({
      code: 'NOT_IMPLEMENTED',
      message: 'PATCH /api/users/me not yet implemented',
    });
  }
);

// TODO: Toggle email_notification_opt_in (students only)
router.patch(
  '/me/notifications',
  authenticate,
  requireRole('student'),
  validate(updateNotificationSchema),
  (_req, res) => {
    res.status(501).json({
      code: 'NOT_IMPLEMENTED',
      message: 'PATCH /api/users/me/notifications not yet implemented',
    });
  }
);

export default router;
