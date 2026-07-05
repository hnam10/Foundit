import { Router, Response } from 'express';
import { ItemStatus, Prisma } from '@prisma/client';
import { prisma } from '../db';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';
import { validateQuery, validate } from '../validators/shared';
import { resolveImageUrl } from '../utils/imageUrl';
import { writeAuditLog } from '../utils/auditLog';
import {
  itemParamsSchema,
  listSecurityItemsQuerySchema,
  publicItemsQuerySchema,
  updateSecurityItemSchema,
  createSecurityItemSchema,
  walkInReleaseSchema,
  UpdateSecurityItemInput,
  CreateSecurityItemInput,
  WalkInReleaseInput,
} from '../validators/items';
import {
  buildDescriptionInternal,
  computeRetentionExpiryDate,
  itemTitleFromDescription,
} from '../utils/itemHelpers';

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
 * /api/items:
 *   post:
 *     summary: Register a found item into inventory (security direct intake)
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [campusId, itemDescription, category, locationFound, dateFound]
 *             properties:
 *               campusId:
 *                 type: string
 *                 format: uuid
 *               itemDescription:
 *                 type: string
 *               category:
 *                 type: string
 *               locationFound:
 *                 type: string
 *               dateFound:
 *                 type: string
 *                 format: date
 *               images:
 *                 type: array
 *     responses:
 *       '201':
 *         description: Created security item detail
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Missing or invalid token
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Campus not found
 */
router.post(
  '/items',
  authenticate,
  requireRole('security', 'admin'),
  validate(createSecurityItemSchema),
  async (req, res, next) => {
    try {
      const {
        campusId,
        itemDescription,
        category,
        locationFound,
        dateFound,
        images,
      } = req.body as CreateSecurityItemInput;

      const campus = await prisma.campus.findUnique({
        where: { campusId },
        select: { campusId: true, retentionDays: true },
      });

      if (!campus) {
        res.status(404).json({
          code: 'CAMPUS_NOT_FOUND',
          message: 'Campus not found.',
        });
        return;
      }

      const item = await prisma.$transaction(async (tx) => {
        const created = await tx.item.create({
          data: {
            campusId,
            category,
            title: itemTitleFromDescription(itemDescription, category),
            descriptionInternal: buildDescriptionInternal(itemDescription),
            locationFound,
            dateFound,
            status: ItemStatus.stored,
            foundItemReportId: null,
            registeredBy: req.user!.user_id,
            retentionExpiryDate: computeRetentionExpiryDate(
              dateFound,
              campus.retentionDays
            ),
          },
          select: {
            itemId: true,
          },
        });

        if (images.length > 0) {
          await tx.itemImage.createMany({
            data: images.map((image) => ({
              itemId: created.itemId,
              imageUrl: image.imageUrl,
              uploadedBy: req.user!.user_id,
              fileType: image.fileType,
              fileSizeKb: image.fileSizeKb,
            })),
          });
        }

        return created;
      });

      const detail = await prisma.item.findUnique({
        where: { itemId: item.itemId },
        select: securityItemDetailSelect,
      });

      if (!detail) {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: 'Item was created but could not be loaded.',
        });
        return;
      }

      await writeAuditLog({
        actorId: req.user!.user_id,
        action: 'item_created',
        entityType: 'item',
        entityId: detail.itemId,
        details: {
          title: detail.title,
          category: detail.category,
          campusId,
          dateFound: dateFound.toISOString().slice(0, 10),
        },
        ipAddress: req.ip,
      });

      res.status(201).json(await toSecurityItemDetailDto(detail));
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

/**
 * @openapi
 * /api/items/{itemId}:
 *   patch:
 *     summary: Update item fields for security staff
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, category, dateFound, locationFound, descriptionInternal]
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               dateFound:
 *                 type: string
 *                 format: date
 *               locationFound:
 *                 type: string
 *                 nullable: true
 *               descriptionInternal:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       '200':
 *         description: Updated security item detail
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Missing or invalid token
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Item not found
 */
router.patch(
  '/items/:itemId',
  authenticate,
  requireRole('security', 'admin'),
  validate(updateSecurityItemSchema),
  async (req, res, next) => {
    try {
      const params = itemParamsSchema.safeParse(req.params);
      if (!params.success) {
        sendValidationError(res, params.error.issues);
        return;
      }

      const existing = await prisma.item.findUnique({
        where: { itemId: params.data.itemId },
        select: {
          itemId: true,
          campusId: true,
          dateFound: true,
        },
      });

      if (!existing) {
        res.status(404).json({
          code: 'ITEM_NOT_FOUND',
          message: 'Item not found.',
        });
        return;
      }

      const { title, category, dateFound, locationFound, descriptionInternal } =
        req.body as UpdateSecurityItemInput;

      const campus = await prisma.campus.findUnique({
        where: { campusId: existing.campusId },
        select: { retentionDays: true },
      });

      if (!campus) {
        res.status(500).json({
          code: 'INTERNAL_ERROR',
          message: 'Item campus is no longer available.',
        });
        return;
      }

      const dateChanged =
        existing.dateFound.toISOString().slice(0, 10) !==
        dateFound.toISOString().slice(0, 10);

      const updated = await prisma.item.update({
        where: { itemId: existing.itemId },
        data: {
          title,
          category,
          dateFound,
          locationFound,
          descriptionInternal,
          ...(dateChanged
            ? {
                retentionExpiryDate: computeRetentionExpiryDate(
                  dateFound,
                  campus.retentionDays
                ),
              }
            : {}),
        },
        select: securityItemDetailSelect,
      });

      await writeAuditLog({
        actorId: req.user!.user_id,
        action: 'item_updated',
        entityType: 'item',
        entityId: updated.itemId,
        details: {
          title,
          category,
          dateFound: dateFound.toISOString().slice(0, 10),
        },
        ipAddress: req.ip,
      });

      res.status(200).json(await toSecurityItemDetailDto(updated));
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @openapi
 * /api/items/{itemId}/walk-in-release:
 *   post:
 *     summary: Release an item to a walk-in student without a prior claim
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentFullName, idVerified, contactNumber]
 *             properties:
 *               studentFullName:
 *                 type: string
 *               idVerified:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               verificationNote:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       '200':
 *         description: Updated security item detail
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Missing or invalid token
 *       '403':
 *         description: Forbidden
 *       '404':
 *         description: Item not found
 *       '409':
 *         description: Item is not in storage
 */
router.post(
  '/items/:itemId/walk-in-release',
  authenticate,
  requireRole('security', 'admin'),
  validate(walkInReleaseSchema),
  async (req, res, next) => {
    try {
      const params = itemParamsSchema.safeParse(req.params);
      if (!params.success) {
        sendValidationError(res, params.error.issues);
        return;
      }

      const {
        studentFullName,
        idVerified,
        contactNumber,
        verificationNote,
      } = req.body as WalkInReleaseInput;

      const actor = await prisma.user.findUnique({
        where: { userId: req.user!.user_id },
        select: { userId: true, firstName: true, lastName: true },
      });

      if (!actor) {
        res.status(401).json({
          code: 'USER_NOT_FOUND',
          message: 'Authenticated user not found.',
        });
        return;
      }

      const existing = await prisma.item.findUnique({
        where: { itemId: params.data.itemId },
        select: { itemId: true, status: true },
      });

      if (!existing) {
        res.status(404).json({
          code: 'ITEM_NOT_FOUND',
          message: 'Item not found.',
        });
        return;
      }

      if (existing.status !== ItemStatus.stored) {
        res.status(409).json({
          code: 'ITEM_NOT_STORED',
          message: 'Only items in storage can be released.',
        });
        return;
      }

      const releasedAt = new Date();

      const updated = await prisma.item.update({
        where: { itemId: existing.itemId },
        data: { status: ItemStatus.claimed },
        select: securityItemDetailSelect,
      });

      await writeAuditLog({
        actorId: actor.userId,
        action: 'item_walk_in_released',
        entityType: 'item',
        entityId: updated.itemId,
        details: {
          releaseType: 'walk_in_no_claim',
          studentFullName,
          idVerified,
          contactNumber,
          verificationNote: verificationNote ?? null,
          releasedAt: releasedAt.toISOString(),
          releasedBy: {
            userId: actor.userId,
            name: `${actor.firstName} ${actor.lastName}`.trim(),
          },
        },
        ipAddress: req.ip,
      });

      res.status(200).json(await toSecurityItemDetailDto(updated));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
