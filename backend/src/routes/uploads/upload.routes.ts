import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth/auth';
import { upload } from '../../middleware/upload';
import { storageService } from '../../services/storage/storageService';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/uploads:
 *   post:
 *     tags: [Uploads]
 *     summary: Upload a file
 *     security: [{ cookieAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       201: { description: File uploaded }
 */
router.post('/', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!req.file) return res.status(400).json({ success: false, error: { message: 'No file provided' } });
    const tenantId = authReq.user?.tenantId || 'global';
    const result = await storageService.upload(tenantId, req.file);
    res.status(201).json({ success: true, data: result });
  } catch (error) { next(error); }
});

/**
 * @swagger
 * /api/v1/uploads/{key}:
 *   delete:
 *     tags: [Uploads]
 *     summary: Delete a file
 *     security: [{ cookieAuth: [] }]
 *     parameters:
 *       - { in: path, name: key, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: File deleted }
 */
router.delete('/:key(*)', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await storageService.delete(req.params.key);
    res.status(204).send();
  } catch (error) { next(error); }
});

export default router;
