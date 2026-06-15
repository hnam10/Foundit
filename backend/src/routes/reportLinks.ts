import { Response, Router } from 'express';
import { FoundReportStatus, ItemStatus } from '@prisma/client';
import rateLimit from 'express-rate-limit';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';
import { prisma } from '../db';
import { validate } from '../validators/shared';
import {
  reportLinkTokenParamsSchema,
  SubmitFoundItemReportInput,
  submitFoundItemReportSchema,
} from '../validators/reportLinks';

const router = Router();
const validateRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'RATE_LIMITED',
    message: 'Too many report-link validation attempts. Try again later.',
  },
});
const submitRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 'RATE_LIMITED',
    message: 'Too many report submissions. Try again later.',
  },
});

const reportLinkSelect = {
  linkId: true,
  campusId: true,
  expiresAt: true,
  isUsed: true,
  usedAt: true,
} as const;

const submitterSelect = {
  userId: true,
  campusId: true,
  isActive: true,
} as const;

function parseParamsToken(rawToken: unknown): string | null {
  const parsed = reportLinkTokenParamsSchema.safeParse({ token: rawToken });
  return parsed.success ? parsed.data.token : null;
}

function getReportLinkAvailability(
  link: {
    isUsed: boolean;
    expiresAt: Date;
    usedAt: Date | null;
  } | null
) {
  if (!link) {
    return { valid: false, reason: 'not_found' as const };
  }

  if (link.isUsed) {
    return {
      valid: false,
      reason: 'used' as const,
      usedAt: link.usedAt?.toISOString() ?? null,
    };
  }

  if (link.expiresAt <= new Date()) {
    return {
      valid: false,
      reason: 'expired' as const,
      expiresAt: link.expiresAt.toISOString(),
    };
  }

  return {
    valid: true,
    reason: 'available' as const,
    expiresAt: link.expiresAt.toISOString(),
  };
}

function toPrismaTime(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return new Date(`1970-01-01T${value}:00.000Z`);
}

function setNoStoreHeader(res: Response) {
  res.set('Cache-Control', 'no-store');
}

/**
 * @openapi
 * /api/report-links/{token}/validate:
 *   get:
 *     summary: Check whether a report-link token can still be used
 *     tags: [Report Links]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Token availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 reason:
 *                   type: string
 *                   enum: [available, not_found, used, expired]
 *                 campusId:
 *                   type: string
 *                   format: uuid
 *                   nullable: true
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *                 usedAt:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *       '400':
 *         description: Invalid token path parameter
 *       '429':
 *         description: Too many validation attempts
 */
router.get('/:token/validate', validateRateLimiter, async (req, res, next) => {
  try {
    setNoStoreHeader(res);
    const token = parseParamsToken(req.params.token);
    if (!token) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [
          {
            path: ['token'],
            message: 'Token is required',
          },
        ],
      });
      return;
    }

    const link = await prisma.reportLink.findUnique({
      where: { token },
      select: reportLinkSelect,
    });

    const availability = getReportLinkAvailability(link);

    res.status(200).json({
      ...availability,
      campusId: link?.campusId ?? null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @openapi
 * /api/report-links/{token}/submit:
 *   post:
 *     summary: Submit a found-item report from a valid report-link token
 *     tags: [Report Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itemDescription, category, locationFound, dateFound]
 *             properties:
 *               itemDescription:
 *                 type: string
 *               category:
 *                 type: string
 *               locationFound:
 *                 type: string
 *               dateFound:
 *                 type: string
 *                 format: date
 *               timeFound:
 *                 type: string
 *                 example: "14:30"
 *               additionalNotes:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Found-item report created and report link consumed
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Missing or invalid access token
 *       '403':
 *         description: Student role required
 *       '404':
 *         description: Report link not found
 *       '409':
 *         description: Report link already used or expired
 *       '429':
 *         description: Too many submission attempts
 */
router.post(
  '/:token/submit',
  submitRateLimiter,
  authenticate,
  requireRole('student'),
  validate(submitFoundItemReportSchema),
  async (req, res, next) => {
    try {
      setNoStoreHeader(res);
      const token = parseParamsToken(req.params.token);
      if (!token) {
        res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [
            {
              path: ['token'],
              message: 'Token is required',
            },
          ],
        });
        return;
      }

      const link = await prisma.reportLink.findUnique({
        where: { token },
        select: reportLinkSelect,
      });

      if (!link) {
        res.status(404).json({
          code: 'REPORT_LINK_NOT_FOUND',
          message: 'Report link does not exist.',
        });
        return;
      }

      if (link.isUsed) {
        res.status(409).json({
          code: 'REPORT_LINK_USED',
          message: 'Report link has already been used.',
        });
        return;
      }

      const now = new Date();
      if (link.expiresAt <= now) {
        res.status(409).json({
          code: 'REPORT_LINK_EXPIRED',
          message: 'Report link has expired.',
        });
        return;
      }

      const submitter = await prisma.user.findUnique({
        where: { userId: req.user!.user_id },
        select: submitterSelect,
      });

      if (!submitter) {
        res.status(404).json({
          code: 'USER_NOT_FOUND',
          message: 'User account no longer exists.',
        });
        return;
      }

      if (!submitter.isActive) {
        res.status(403).json({
          code: 'ACCOUNT_INACTIVE',
          message:
            'Your account has been deactivated. Contact an administrator.',
        });
        return;
      }

      // if (!submitter.campusId || submitter.campusId !== link.campusId) {
      //   res.status(403).json({
      //     code: 'FORBIDDEN',
      //     message: 'You cannot submit reports for this campus.',
      //   });
      //   return;
      // }

      const {
        itemDescription,
        category,
        locationFound,
        dateFound,
        timeFound,
        additionalNotes,
      } = req.body as SubmitFoundItemReportInput;

      const result = await prisma.$transaction(async (tx) => {
        const report = await tx.foundItemReport.create({
          data: {
            reportLinkId: link.linkId,
            finderId: req.user!.user_id,
            itemDescription,
            category,
            locationFound,
            dateFound,
            timeFound: toPrismaTime(timeFound),
            additionalNotes,
            status: FoundReportStatus.submitted,
          },
          select: {
            reportId: true,
            reportLinkId: true,
            finderId: true,
            category: true,
            locationFound: true,
            dateFound: true,
            timeFound: true,
            status: true,
            createdAt: true,
          },
        });

        const updateResult = await tx.reportLink.updateMany({
          where: {
            linkId: link.linkId,
            isUsed: false,
            expiresAt: { gt: now },
          },
          data: {
            isUsed: true,
            usedAt: now,
          },
        });

        if (updateResult.count !== 1) {
          throw new Error('REPORT_LINK_CONFLICT');
        }

        return report;
      });

      res.status(201).json({
        reportId: result.reportId,
        reportLinkId: result.reportLinkId,
        finderId: result.finderId,
        category: result.category,
        locationFound: result.locationFound,
        dateFound: result.dateFound,
        timeFound: result.timeFound,
        status: result.status,
        createdAt: result.createdAt,
      });
    } catch (err) {
      if (err instanceof Error && err.message === 'REPORT_LINK_CONFLICT') {
        res.status(409).json({
          code: 'REPORT_LINK_USED',
          message: 'Report link has already been used.',
        });
        return;
      }

      next(err);
    }
  }
);

/**
 * Public-safe status gate for student/public browse.
 * Internal workflow states such as pending_report and closed-out records are excluded.
 */
export const publicItemStatuses = [ItemStatus.stored] as const;

export default router;
