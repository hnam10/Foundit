import { Router } from 'express';
import { ItemStatus, Prisma } from '@prisma/client';
import { prisma } from '../db';
import { validateQuery } from '../validators/shared';
import { publicItemsQuerySchema } from '../validators/items';

const router = Router();
const publicItemStatuses = [ItemStatus.stored] as const;

const publicItemSelect = {
  itemId: true,
  campusId: true,
  category: true,
  title: true,
  descriptionPublic: true,
  color: true,
  brand: true,
  locationFound: true,
  dateFound: true,
  status: true,
} as const;

function buildPublicItemWhere(query: { category?: string; campusId?: string }) {
  const where: Prisma.ItemWhereInput = {
    status: { in: [...publicItemStatuses] },
  };

  if (query.category) {
    where.category = query.category;
  }

  if (query.campusId) {
    where.campusId = query.campusId;
  }

  return where;
}

/**
 * @openapi
 * /api/public/items:
 *   get:
 *     summary: Browse public-safe found items
 *     tags: [Public Items]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: campusId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Public-safe item list
 *       '400':
 *         description: Invalid query parameters
 */
router.get(
  '/public/items',
  validateQuery(publicItemsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as { category?: string; campusId?: string };

      const items = await prisma.item.findMany({
        where: buildPublicItemWhere(query),
        select: publicItemSelect,
        orderBy: [{ dateFound: 'desc' }, { createdAt: 'desc' }],
      });

      res.status(200).json(items);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /api/items/category-stats:
 *   get:
 *     summary: Get public-safe item counts grouped by category
 *     tags: [Public Items]
 *     parameters:
 *       - in: query
 *         name: campusId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Category counts for public browse
 *       '400':
 *         description: Invalid query parameters
 */
router.get(
  '/items/category-stats',
  validateQuery(publicItemsQuerySchema.pick({ campusId: true })),
  async (req, res, next) => {
    try {
      const { campusId } = req.query as { campusId?: string };

      const rows = await prisma.item.groupBy({
        by: ['category'],
        where: {
          status: { in: [...publicItemStatuses] },
          ...(campusId ? { campusId } : {}),
        },
        _count: {
          category: true,
        },
        orderBy: {
          category: 'asc',
        },
      });

      res.status(200).json(
        rows.map((row) => ({
          category: row.category,
          count: row._count.category,
        }))
      );
    } catch (err) {
      next(err);
    }
  }
);

export default router;
