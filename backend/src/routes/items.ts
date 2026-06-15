import { Router, Response } from 'express';
import { ItemStatus, Prisma } from '@prisma/client';
import { prisma } from '../db';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';
import { validateQuery } from '../validators/shared';
import { resolveImageUrl } from '../utils/imageUrl';
import {
  itemParamsSchema,
  listSecurityItemsQuerySchema,
  publicItemsQuerySchema,
} from '../validators/items';

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

const securityItemListSelect = {
  itemId: true,
  campusId: true,
  category: true,
  title: true,
  dateFound: true,
  status: true,
  retentionExpiryDate: true,
  campus: {
    select: {
      campusName: true,
    },
  },
  images: {
    select: {
      imageUrl: true,
    },
    take: 1,
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
} as const;

const securityItemDetailSelect = {
  itemId: true,
  campusId: true,
  category: true,
  title: true,
  descriptionPublic: true,
  descriptionInternal: true,
  color: true,
  brand: true,
  locationFound: true,
  dateFound: true,
  status: true,
  foundItemReportId: true,
  retentionExpiryDate: true,
  createdAt: true,
  updatedAt: true,
  campus: {
    select: {
      campusName: true,
    },
  },
  registrar: {
    select: {
      userId: true,
      firstName: true,
      lastName: true,
    },
  },
  images: {
    select: {
      imageId: true,
      imageUrl: true,
    },
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
  claims: {
    select: {
      claimId: true,
      status: true,
      student: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc' as const,
    },
  },
  foundItemReport: {
    select: {
      finder: {
        select: {
          userId: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
    },
  },
} as const;

type SecurityItemListRow = Prisma.ItemGetPayload<{
  select: typeof securityItemListSelect;
}>;

type SecurityItemDetailRow = Prisma.ItemGetPayload<{
  select: typeof securityItemDetailSelect;
}>;

function sendValidationError(res: Response, details: unknown) {
  res.status(400).json({
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details,
  });
}

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

function buildSecurityItemListWhere(query: {
  status?: ItemStatus;
  campusId?: string;
  category?: string;
}) {
  const where: Prisma.ItemWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.campusId) {
    where.campusId = query.campusId;
  }

  if (query.category) {
    where.category = query.category;
  }

  return where;
}

async function toSecurityItemListDto(item: SecurityItemListRow) {
  const storedImageUrl = item.images[0]?.imageUrl ?? null;
  return {
    itemId: item.itemId,
    campusId: item.campusId,
    campusName: item.campus.campusName,
    category: item.category,
    title: item.title,
    dateFound: item.dateFound,
    status: item.status,
    retentionExpiryDate: item.retentionExpiryDate,
    imageUrl: storedImageUrl ? await resolveImageUrl(storedImageUrl) : null,
  };
}

async function toSecurityItemDetailDto(item: SecurityItemDetailRow) {
  const storedImageUrl = item.images[0]?.imageUrl ?? null;
  const resolvedImages = await Promise.all(
    item.images.map(async (image) => ({
      imageId: image.imageId,
      imageUrl: await resolveImageUrl(image.imageUrl),
    }))
  );

  return {
    itemId: item.itemId,
    campusId: item.campusId,
    campusName: item.campus.campusName,
    category: item.category,
    title: item.title,
    descriptionPublic: item.descriptionPublic,
    descriptionInternal: item.descriptionInternal,
    color: item.color,
    brand: item.brand,
    locationFound: item.locationFound,
    dateFound: item.dateFound,
    status: item.status,
    foundItemReportId: item.foundItemReportId,
    retentionExpiryDate: item.retentionExpiryDate,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    imageUrl: storedImageUrl ? await resolveImageUrl(storedImageUrl) : null,
    images: resolvedImages,
    registeredBy: {
      userId: item.registrar.userId,
      firstName: item.registrar.firstName,
      lastName: item.registrar.lastName,
    },
    claims: item.claims.map((claim) => ({
      claimId: claim.claimId,
      status: claim.status,
      studentName:
        `${claim.student.firstName} ${claim.student.lastName}`.trim(),
    })),
    finder: item.foundItemReport
      ? {
          userId: item.foundItemReport.finder.userId,
          firstName: item.foundItemReport.finder.firstName,
          lastName: item.foundItemReport.finder.lastName,
          email: item.foundItemReport.finder.email,
          phone: item.foundItemReport.finder.phone,
        }
      : null,
  };
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

/**
 * @openapi
 * /api/items:
 *   get:
 *     summary: List items for security staff
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending_report, stored, claimed, expired, disposed]
 *       - in: query
 *         name: campusId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *     responses:
 *       '200':
 *         description: Paginated security item list
 *       '400':
 *         description: Invalid query parameters
 *       '401':
 *         description: Missing or invalid token
 *       '403':
 *         description: Forbidden
 */
router.get(
  '/items',
  authenticate,
  requireRole('security', 'admin'),
  validateQuery(listSecurityItemsQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as {
        status?: ItemStatus;
        campusId?: string;
        category?: string;
        cursor?: string;
        limit: number;
      };

      const items = await prisma.item.findMany({
        where: buildSecurityItemListWhere(query),
        orderBy: [
          { dateFound: 'desc' },
          { createdAt: 'desc' },
          { itemId: 'desc' },
        ],
        take: query.limit + 1,
        ...(query.cursor
          ? {
              cursor: { itemId: query.cursor },
              skip: 1,
            }
          : {}),
        select: securityItemListSelect,
      });

      const nextCursor =
        items.length > query.limit ? items[query.limit].itemId : null;
      const data = await Promise.all(
        items.slice(0, query.limit).map((item) => toSecurityItemListDto(item))
      );

      res.status(200).json({ data, nextCursor });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /api/items/{itemId}:
 *   get:
 *     summary: Get item detail for security staff
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Security item detail
 *       '401':
 *         description: Missing or invalid token
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Item not found
 */
router.get(
  '/items/:itemId',
  authenticate,
  requireRole('security', 'admin'),
  async (req, res, next) => {
    try {
      const params = itemParamsSchema.safeParse(req.params);
      if (!params.success) {
        sendValidationError(res, params.error.issues);
        return;
      }

      const item = await prisma.item.findUnique({
        where: { itemId: params.data.itemId },
        select: securityItemDetailSelect,
      });

      if (!item) {
        res.status(404).json({
          code: 'ITEM_NOT_FOUND',
          message: 'Item not found.',
        });
        return;
      }

      res.status(200).json(await toSecurityItemDetailDto(item));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
