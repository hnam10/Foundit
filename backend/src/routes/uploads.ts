import { Router } from 'express';
import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2 } from '../lib/r2';
// import { requireAuth } from '../middleware/requireAuth';

const router = Router();

/**
 * @openapi
 * /api/uploads/presigned-url:
 *   post:
 *     summary: Create a presigned upload URL for an image
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fileName, contentType, fileSizeKb]
 *             properties:
 *               fileName:
 *                 type: string
 *                 example: cat.png
 *               contentType:
 *                 type: string
 *                 example: image/png
 *               fileSizeKb:
 *                 type: integer
 *                 example: 350
 *     responses:
 *       '200':
 *         description: Presigned upload URL created
 *       '400':
 *         description: Invalid file information
 */
router.post('/presigned-url', async (req, res, next) => {
  try {
    const { fileName, contentType, fileSizeKb } = req.body;

    if (!fileName || !contentType || !fileSizeKb) {
      res.status(400).json({
        code: 'MISSING_FILE_INFO',
        message: 'fileName, contentType, and fileSizeKb are required.',
      });
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      res.status(400).json({
        code: 'UNSUPPORTED_FILE_TYPE',
        message: 'Only JPEG, PNG, and WebP images are supported.',
      });
      return;
    }

    const maxFileSizeKb = 5 * 1024;
    if (fileSizeKb > maxFileSizeKb) {
      res.status(400).json({
        code: 'FILE_TOO_LARGE',
        message: 'Image must be 5MB or smaller.',
      });
      return;
    }

    const ext = contentType.split('/')[1];
    const key = `reports/${crypto.randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2, command, {
      expiresIn: 5 * 60 * 60, // 5 hours
    });

    res.status(200).json({
      uploadUrl,
      imageUrl: key,
      fileType: ext,
      fileSizeKb,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
