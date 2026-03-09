import { Router } from 'express';
import { getAccessToken } from '../config/google.js';

const router = Router();

router.get('/:fileId', async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const accessToken = await getAccessToken();

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
    };

    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers }
    );

    if (!driveResponse.ok && driveResponse.status !== 206) {
      return res.status(driveResponse.status).json({ error: 'Failed to fetch audio' });
    }

    res.status(driveResponse.status);

    const contentType = driveResponse.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);
    const contentLength = driveResponse.headers.get('content-length');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    const contentRange = driveResponse.headers.get('content-range');
    if (contentRange) res.setHeader('Content-Range', contentRange);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    if (!driveResponse.body) {
      return res.status(500).json({ error: 'No response body' });
    }

    const reader = driveResponse.body.getReader();
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    };
    await pump();
  } catch (error) {
    next(error);
  }
});

export default router;
