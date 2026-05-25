import { Router } from 'express';
import authenticate from '../../middleware/authenticate';
import requireRole from '../../middleware/requireRole';
import { validate, validateQuery } from '../../validators/shared';
import { createUserSchema, listUsersQuerySchema } from '../../validators/users';

const router = Router();

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, security, admin]
 *       - in: query
 *         name: isActive
 *         description: >
 *           HTTP query strings are always plain text — pass the string "true" or "false",
 *           not a JSON boolean. The server rejects any other value.
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - in: query
 *         name: campusId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *     responses:
 *       '200':
 *         description: Paginated list of users
 *       '401':
 *         description: Missing or invalid token
 *       '403':
 *         description: Insufficient permissions
 */
// TODO: List users with optional role, is_active, campus_id filters
router.get(
  '/',
  authenticate,
  requireRole('admin'),
  validateQuery(listUsersQuerySchema),
  (_req, res) => {
    res.status(501).json({
      code: 'NOT_IMPLEMENTED',
      message: 'GET /api/admin/users not yet implemented',
    });
  }
);

/**
 * @openapi
 * /api/admin/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, firstName, lastName, role, campusId]
 *             description: >
 *               role=student requires studentNumber;
 *               role=security or role=admin requires employeeId.
 *             properties:
 *               email:
 *                 type: string
 *                 example: student@myseneca.ca
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, security, admin]
 *               campusId:
 *                 type: string
 *                 format: uuid
 *               studentNumber:
 *                 type: integer
 *                 example: 123456789
 *               employeeId:
 *                 type: string
 *                 example: EMP00000001
 *               phone:
 *                 type: string
 *                 example: '4161234567'
 *     responses:
 *       '201':
 *         description: User created successfully
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Missing or invalid token
 *       '403':
 *         description: Insufficient permissions
 */
// TODO: Create user with auto-generated username and hashed password
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  validate(createUserSchema),
  (_req, res) => {
    res.status(501).json({
      code: 'NOT_IMPLEMENTED',
      message: 'POST /api/admin/users not yet implemented',
    });
  }
);

/**
 * @openapi
 * /api/admin/users/{userId}/deactivate:
 *   patch:
 *     summary: Deactivate a user
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: User deactivated successfully
 *       '401':
 *         description: Missing or invalid token
 *       '403':
 *         description: Insufficient permissions
 *       '404':
 *         description: User not found
 */
// TODO: Set is_active = false
router.patch(
  '/:userId/deactivate',
  authenticate,
  requireRole('admin'),
  (_req, res) => {
    res.status(501).json({
      code: 'NOT_IMPLEMENTED',
      message: 'PATCH /api/admin/users/:userId/deactivate not yet implemented',
    });
  }
);

/**
 * @openapi
 * /api/admin/users/{userId}/activate:
 *   patch:
 *     summary: Activate a user
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: User activated successfully
 *       '401':
 *         description: Missing or invalid token
 *       '403':
 *         description: Insufficient permissions
 *       '404':
 *         description: User not found
 */
// TODO: Set is_active = true
router.patch(
  '/:userId/activate',
  authenticate,
  requireRole('admin'),
  (_req, res) => {
    res.status(501).json({
      code: 'NOT_IMPLEMENTED',
      message: 'PATCH /api/admin/users/:userId/activate not yet implemented',
    });
  }
);

export default router;
