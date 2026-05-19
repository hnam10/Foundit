import { Router } from 'express';
import authenticate from '../../middleware/authenticate';
import requireRole from '../../middleware/requireRole';

const router = Router();

// TODO: List users with optional role, is_active, campus_id filters
router.get('/', authenticate, requireRole('admin'), (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'GET /api/admin/users not yet implemented' });
});

// TODO: Create user with auto-generated username and hashed password
router.post('/', authenticate, requireRole('admin'), (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'POST /api/admin/users not yet implemented' });
});

// TODO: Set is_active = false
router.patch('/:userId/deactivate', authenticate, requireRole('admin'), (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'PATCH /api/admin/users/:userId/deactivate not yet implemented' });
});

// TODO: Set is_active = true
router.patch('/:userId/activate', authenticate, requireRole('admin'), (_req, res) => {
  res.status(501).json({ code: 'NOT_IMPLEMENTED', message: 'PATCH /api/admin/users/:userId/activate not yet implemented' });
});

export default router;
