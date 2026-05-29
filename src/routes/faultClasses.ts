import { Router, Request, Response } from 'express';
import { getStorage } from '../storage';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/fault-classes
router.get('/', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const faultClasses = await getStorage().getFaultClasses();
    res.json(faultClasses);
  } catch (err) {
    console.error('Get fault classes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/fault-classes/:id
router.put('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { engineer_validated, priority_to_improve } = req.body;

  try {
    const updated = await getStorage().updateFaultClass(parseInt(id), {
      engineer_validated,
      priority_to_improve,
    });
    res.json(updated);
  } catch (err: any) {
    if (err.message?.includes('not found')) {
      res.status(404).json({ error: 'Fault class not found' });
      return;
    }
    console.error('Update fault class error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
