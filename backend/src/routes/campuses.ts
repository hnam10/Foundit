import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

/**
 * @openapi
 * /api/campuses:
 *   get:
 *     summary: List campuses
 *     tags: [Campuses]
 *     responses:
 *       '200':
 *         description: Campus list
 */
router.get('/', async (_req, res, next) => {
  try {
    const campuses = await prisma.campus.findMany({
      select: {
        campusId: true,
        campusName: true,
      },
      orderBy: { campusName: 'asc' },
    });

    res.status(200).json(campuses);
  } catch (err) {
    next(err);
  }
});

export default router;
