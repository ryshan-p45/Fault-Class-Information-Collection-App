import { Router, Request, Response } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/fault-classes
router.get('/', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, number, name, category, failure_reason, engineer_validated, priority_to_improve FROM fault_classes ORDER BY number ASC'
    );
    res.json(result.rows);
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
    const result = await pool.query(
      `UPDATE fault_classes
       SET engineer_validated = $1,
           priority_to_improve = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, number, name, category, failure_reason, engineer_validated, priority_to_improve`,
      [engineer_validated, priority_to_improve, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Fault class not found' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update fault class error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
