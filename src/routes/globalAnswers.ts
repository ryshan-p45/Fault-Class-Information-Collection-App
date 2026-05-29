import { Router, Request, Response } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/global-answers
router.get('/', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM global_answers ORDER BY id ASC LIMIT 1');

    if (result.rows.length === 0) {
      res.json({
        s1_new_fault_classes: '',
        s1_disputed_fault_classes: '',
        s1_rare_obsolete: '',
        s3_highest_impact: '',
        s3_hardest_to_diagnose: '',
        s3_most_misdiagnosed: '',
        s3_first_to_improve: '',
        s3_unlisted_faults: '',
        s3_additional_endpoints: '',
        s3_data_quality_issues: '',
        s3_historical_cases: '',
        s3_real_scenarios: '',
        s3_wrong_recommendation: '',
      });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get global answers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/global-answers
router.put('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const {
    s1_new_fault_classes,
    s1_disputed_fault_classes,
    s1_rare_obsolete,
    s3_highest_impact,
    s3_hardest_to_diagnose,
    s3_most_misdiagnosed,
    s3_first_to_improve,
    s3_unlisted_faults,
    s3_additional_endpoints,
    s3_data_quality_issues,
    s3_historical_cases,
    s3_real_scenarios,
    s3_wrong_recommendation,
  } = req.body;

  try {
    // Check if a row exists
    const existing = await pool.query('SELECT id FROM global_answers LIMIT 1');

    let result;
    if (existing.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO global_answers (
          s1_new_fault_classes, s1_disputed_fault_classes, s1_rare_obsolete,
          s3_highest_impact, s3_hardest_to_diagnose, s3_most_misdiagnosed,
          s3_first_to_improve, s3_unlisted_faults, s3_additional_endpoints,
          s3_data_quality_issues, s3_historical_cases, s3_real_scenarios,
          s3_wrong_recommendation, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        RETURNING *`,
        [
          s1_new_fault_classes || null,
          s1_disputed_fault_classes || null,
          s1_rare_obsolete || null,
          s3_highest_impact || null,
          s3_hardest_to_diagnose || null,
          s3_most_misdiagnosed || null,
          s3_first_to_improve || null,
          s3_unlisted_faults || null,
          s3_additional_endpoints || null,
          s3_data_quality_issues || null,
          s3_historical_cases || null,
          s3_real_scenarios || null,
          s3_wrong_recommendation || null,
        ]
      );
    } else {
      result = await pool.query(
        `UPDATE global_answers SET
          s1_new_fault_classes = $1,
          s1_disputed_fault_classes = $2,
          s1_rare_obsolete = $3,
          s3_highest_impact = $4,
          s3_hardest_to_diagnose = $5,
          s3_most_misdiagnosed = $6,
          s3_first_to_improve = $7,
          s3_unlisted_faults = $8,
          s3_additional_endpoints = $9,
          s3_data_quality_issues = $10,
          s3_historical_cases = $11,
          s3_real_scenarios = $12,
          s3_wrong_recommendation = $13,
          updated_at = NOW()
        WHERE id = $14
        RETURNING *`,
        [
          s1_new_fault_classes || null,
          s1_disputed_fault_classes || null,
          s1_rare_obsolete || null,
          s3_highest_impact || null,
          s3_hardest_to_diagnose || null,
          s3_most_misdiagnosed || null,
          s3_first_to_improve || null,
          s3_unlisted_faults || null,
          s3_additional_endpoints || null,
          s3_data_quality_issues || null,
          s3_historical_cases || null,
          s3_real_scenarios || null,
          s3_wrong_recommendation || null,
          existing.rows[0].id,
        ]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Save global answers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
