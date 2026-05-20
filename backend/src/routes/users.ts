import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';

const router = Router();

// TODO: Return authenticated user's profile
router.get('/me', authenticate, (_req, res) => {
  res.status(501).json({
    code: 'NOT_IMPLEMENTED',
    message: 'GET /api/users/me not yet implemented',
  });
});

// TODO: Update first_name, last_name, or phone
router.patch('/me', authenticate, (_req, res) => {
  res.status(501).json({
    code: 'NOT_IMPLEMENTED',
    message: 'PATCH /api/users/me not yet implemented',
  });
});

// TODO: Toggle email_notification_opt_in (students only)
router.patch(
  '/me/notifications',
  authenticate,
  requireRole('student'),
  (_req, res) => {
    res.status(501).json({
      code: 'NOT_IMPLEMENTED',
      message: 'PATCH /api/users/me/notifications not yet implemented',
    });
  }
);

export default router;
