import { Router } from 'express';
import { prisma } from '../db';
import { MISSING_CAMPUS_ID } from '../constants/campus';

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
      where: {
        campusId: { not: MISSING_CAMPUS_ID },
      },
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
