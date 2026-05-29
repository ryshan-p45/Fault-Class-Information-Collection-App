import { Router, Request, Response } from 'express';
import { getStorage } from '../storage';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/global-answers
router.get('/', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const answers = await getStorage().getGlobalAnswers();
    res.json(answers);
  } catch (err) {
    console.error('Get global answers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/global-answers
router.put('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const saved = await getStorage().updateGlobalAnswers(req.body);
    res.json(saved);
  } catch (err) {
    console.error('Save global answers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
