import { Router } from 'express';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/songs - List all songs from database
router.get('/', async (req, res, next) => {
  try {
    const { search, artist, album, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { title: { contains: search as string, mode: 'insensitive' } },
        { artist: { contains: search as string, mode: 'insensitive' } },
        { album: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (artist) {
      where.artist = { contains: artist as string, mode: 'insensitive' };
    }

    if (album) {
      where.album = { contains: album as string, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.song.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { name: 'asc' },
      }),
      prisma.song.count({ where }),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      limit: limitNum,
      hasMore: skip + items.length < total,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/songs/:id - Get song by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const song = await prisma.song.findUnique({
      where: { id },
    });

    if (!song) {
      return next(new AppError('Song not found', 404));
    }

    res.json(song);
  } catch (error) {
    next(error);
  }
});

export default router;
