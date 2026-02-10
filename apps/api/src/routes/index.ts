import { Router } from 'express';
import driveRoutes from './driveRoutes.js';
import streamRoutes from './streamRoutes.js';
import playlistRoutes from './playlistRoutes.js';
import songRoutes from './songRoutes.js';

const router = Router();

router.use('/drive', driveRoutes);
router.use('/stream', streamRoutes);
router.use('/playlists', playlistRoutes);
router.use('/songs', songRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.1.0', timestamp: new Date().toISOString() });
});

export default router;
