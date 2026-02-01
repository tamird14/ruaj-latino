import { Router } from 'express';
import { z } from 'zod';
import { playlistService } from '../services/playlistService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Validation schemas
const createPlaylistSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
  password: z.string().min(4).max(100).optional(),
  songIds: z.array(z.string().uuid()).optional(),
});

const updatePlaylistSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
  password: z.string().min(4).max(100).optional(),
  removePassword: z.boolean().optional(),
});

// GET /api/playlists - List all playlists
router.get('/', async (req, res, next) => {
  try {
    const includePrivate = req.query.includePrivate === 'true';
    const playlists = await playlistService.getPlaylists(includePrivate);
    res.json({ playlists });
  } catch (error) {
    next(error);
  }
});

// GET /api/playlists/:id - Get playlist by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const password = req.headers['x-playlist-password'] as string | undefined;

    const playlist = await playlistService.getPlaylist(id, password);
    res.json(playlist);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Playlist not found') {
        return next(new AppError('Playlist not found', 404));
      }
      if (error.message === 'Password required' || error.message === 'Invalid password') {
        return next(new AppError(error.message, 401));
      }
    }
    next(error);
  }
});

// POST /api/playlists - Create playlist
router.post('/', async (req, res, next) => {
  try {
    const data = createPlaylistSchema.parse(req.body);
    const playlist = await playlistService.createPlaylist(data);
    res.status(201).json(playlist);
  } catch (error) {
    next(error);
  }
});

// PUT /api/playlists/:id - Update playlist
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const password = req.headers['x-playlist-password'] as string | undefined;
    const data = updatePlaylistSchema.parse(req.body);

    const playlist = await playlistService.updatePlaylist(id, data, password);
    res.json(playlist);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Password required' || error.message === 'Invalid password') {
        return next(new AppError(error.message, 401));
      }
    }
    next(error);
  }
});

// DELETE /api/playlists/:id - Delete playlist
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const password = req.headers['x-playlist-password'] as string | undefined;

    await playlistService.deletePlaylist(id, password);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Password required' || error.message === 'Invalid password') {
        return next(new AppError(error.message, 401));
      }
    }
    next(error);
  }
});

// POST /api/playlists/:id/verify-password - Verify playlist password
router.post('/:id/verify-password', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.json({ valid: false });
    }

    const valid = await playlistService.verifyPassword(id, password);
    res.json({ valid });
  } catch (error) {
    next(error);
  }
});

// POST /api/playlists/:id/songs - Add songs to playlist
router.post('/:id/songs', async (req, res, next) => {
  try {
    const { id } = req.params;
    const password = req.headers['x-playlist-password'] as string | undefined;
    const { songIds } = req.body;

    if (!Array.isArray(songIds) || songIds.length === 0) {
      return next(new AppError('songIds array is required', 400));
    }

    await playlistService.addSongs(id, songIds, password);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Password required' || error.message === 'Invalid password') {
        return next(new AppError(error.message, 401));
      }
    }
    next(error);
  }
});

// DELETE /api/playlists/:id/songs/:songId - Remove song from playlist
router.delete('/:id/songs/:songId', async (req, res, next) => {
  try {
    const { id, songId } = req.params;
    const password = req.headers['x-playlist-password'] as string | undefined;

    await playlistService.removeSong(id, songId, password);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Password required' || error.message === 'Invalid password') {
        return next(new AppError(error.message, 401));
      }
    }
    next(error);
  }
});

// PUT /api/playlists/:id/reorder - Reorder songs in playlist
router.put('/:id/reorder', async (req, res, next) => {
  try {
    const { id } = req.params;
    const password = req.headers['x-playlist-password'] as string | undefined;
    const { songIds } = req.body;

    if (!Array.isArray(songIds)) {
      return next(new AppError('songIds array is required', 400));
    }

    await playlistService.reorderSongs(id, songIds, password);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Password required' || error.message === 'Invalid password') {
        return next(new AppError(error.message, 401));
      }
    }
    next(error);
  }
});

export default router;
