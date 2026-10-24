import { Router, Request, Response } from 'express';
import { getConnectionStatus } from '../../db/connection';

const router = Router();

router.get('/live', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/ready', (_req: Request, res: Response) => {
  const dbReady = getConnectionStatus();

  if (dbReady) {
    res.json({
      status: 'ready',
      dependencies: { mongodb: 'connected' },
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'not_ready',
      dependencies: { mongodb: 'disconnected' },
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
