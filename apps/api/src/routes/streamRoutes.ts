import { Router } from 'express';
import { driveService } from '../services/driveService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/stream/:fileId - Stream audio file
router.get('/:fileId', async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const range = req.headers.range;

    const { stream, metadata, contentRange } = await driveService.getFileStream(
      fileId,
      range as string | undefined
    );

    const fileSize = parseInt(metadata.size, 10);

    // Set headers
    const headers: Record<string, string | number> = {
      'Content-Type': metadata.mimeType || 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    };

    if (contentRange) {
      const { start, end, size } = contentRange;
      headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
      headers['Content-Length'] = end - start + 1;
      res.writeHead(206, headers); // Partial Content
    } else {
      headers['Content-Length'] = fileSize;
      res.writeHead(200, headers);
    }

    // Pipe stream to response
    stream.pipe(res);

    stream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Streaming failed' });
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router;
