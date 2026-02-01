import { Router } from 'express';
import { driveService } from '../services/driveService.js';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/drive/files - List music files
router.get('/files', async (req, res, next) => {
  try {
    const { search, pageToken } = req.query;

    const result = await driveService.listMusicFiles(
      pageToken as string | undefined,
      search as string | undefined
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/drive/sync - Sync files from Drive to database
router.post('/sync', async (_req, res, next) => {
  try {
    const synced = await driveService.syncFilesToDatabase();
    res.json({ synced });
  } catch (error) {
    next(error);
  }
});

export default router;
