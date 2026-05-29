import { Router, Request, Response } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

const DEFAULT_RESOLUTION_STEPS = JSON.stringify([
  { actor: 'Support Agent', action: '', expected_outcome: '' },
  { actor: 'Customer', action: '', expected_outcome: '' },
  { actor: 'Field Technician', action: '', expected_outcome: '' },
  { actor: 'Escalation', action: '', expected_outcome: '' },
]);

// GET /api/answers/:faultClassId
router.get('/:faultClassId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { faultClassId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM fault_class_answers WHERE fault_class_id = $1',
      [faultClassId]
    );

    if (result.rows.length === 0) {
      // Return empty answers with defaults
      res.json({
        fault_class_id: parseInt(faultClassId),
        s2a_description: '',
        s2a_commonality: '',
        s2a_intermittent: '',
        s2a_appears_with: '',
        s2b_clearest_signal: '',
        s2b_signal_combination: '',
        s2b_lifecycle_point: '',
        s2b_not_this_fault: '',
        s2b_confused_with: '',
        s2c_diagnostics: [],
        s2c_thresholds: '',
        s2c_additional_sources: '',
        s2d_resolution_steps: JSON.parse(DEFAULT_RESOLUTION_STEPS),
        s2d_resolution_time: '',
        s2d_escalation_required: '',
        s2e_correct_response: '',
        s2e_example_case: '',
        s2e_edge_cases: '',
        s4_existing_docs: false,
        s4_needs_creating: '',
        s4_priority: '',
        s4_definition_chunk: false,
        s4_diagnostic_chunk: false,
        s4_resolution_chunk: false,
        s4_example_cases: false,
      });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get answers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/answers/:faultClassId
router.put('/:faultClassId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { faultClassId } = req.params;
  const {
    s2a_description,
    s2a_commonality,
    s2a_intermittent,
    s2a_appears_with,
    s2b_clearest_signal,
    s2b_signal_combination,
    s2b_lifecycle_point,
    s2b_not_this_fault,
    s2b_confused_with,
    s2c_diagnostics,
    s2c_thresholds,
    s2c_additional_sources,
    s2d_resolution_steps,
    s2d_resolution_time,
    s2d_escalation_required,
    s2e_correct_response,
    s2e_example_case,
    s2e_edge_cases,
    s4_existing_docs,
    s4_needs_creating,
    s4_priority,
    s4_definition_chunk,
    s4_diagnostic_chunk,
    s4_resolution_chunk,
    s4_example_cases,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO fault_class_answers (
        fault_class_id,
        s2a_description, s2a_commonality, s2a_intermittent, s2a_appears_with,
        s2b_clearest_signal, s2b_signal_combination, s2b_lifecycle_point, s2b_not_this_fault, s2b_confused_with,
        s2c_diagnostics, s2c_thresholds, s2c_additional_sources,
        s2d_resolution_steps, s2d_resolution_time, s2d_escalation_required,
        s2e_correct_response, s2e_example_case, s2e_edge_cases,
        s4_existing_docs, s4_needs_creating, s4_priority,
        s4_definition_chunk, s4_diagnostic_chunk, s4_resolution_chunk, s4_example_cases,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26, NOW()
      )
      ON CONFLICT (fault_class_id) DO UPDATE SET
        s2a_description = EXCLUDED.s2a_description,
        s2a_commonality = EXCLUDED.s2a_commonality,
        s2a_intermittent = EXCLUDED.s2a_intermittent,
        s2a_appears_with = EXCLUDED.s2a_appears_with,
        s2b_clearest_signal = EXCLUDED.s2b_clearest_signal,
        s2b_signal_combination = EXCLUDED.s2b_signal_combination,
        s2b_lifecycle_point = EXCLUDED.s2b_lifecycle_point,
        s2b_not_this_fault = EXCLUDED.s2b_not_this_fault,
        s2b_confused_with = EXCLUDED.s2b_confused_with,
        s2c_diagnostics = EXCLUDED.s2c_diagnostics,
        s2c_thresholds = EXCLUDED.s2c_thresholds,
        s2c_additional_sources = EXCLUDED.s2c_additional_sources,
        s2d_resolution_steps = EXCLUDED.s2d_resolution_steps,
        s2d_resolution_time = EXCLUDED.s2d_resolution_time,
        s2d_escalation_required = EXCLUDED.s2d_escalation_required,
        s2e_correct_response = EXCLUDED.s2e_correct_response,
        s2e_example_case = EXCLUDED.s2e_example_case,
        s2e_edge_cases = EXCLUDED.s2e_edge_cases,
        s4_existing_docs = EXCLUDED.s4_existing_docs,
        s4_needs_creating = EXCLUDED.s4_needs_creating,
        s4_priority = EXCLUDED.s4_priority,
        s4_definition_chunk = EXCLUDED.s4_definition_chunk,
        s4_diagnostic_chunk = EXCLUDED.s4_diagnostic_chunk,
        s4_resolution_chunk = EXCLUDED.s4_resolution_chunk,
        s4_example_cases = EXCLUDED.s4_example_cases,
        updated_at = NOW()
      RETURNING *`,
      [
        faultClassId,
        s2a_description || null,
        s2a_commonality || null,
        s2a_intermittent || null,
        s2a_appears_with || null,
        s2b_clearest_signal || null,
        s2b_signal_combination || null,
        s2b_lifecycle_point || null,
        s2b_not_this_fault || null,
        s2b_confused_with || null,
        JSON.stringify(s2c_diagnostics || []),
        s2c_thresholds || null,
        s2c_additional_sources || null,
        JSON.stringify(s2d_resolution_steps || JSON.parse(DEFAULT_RESOLUTION_STEPS)),
        s2d_resolution_time || null,
        s2d_escalation_required || null,
        s2e_correct_response || null,
        s2e_example_case || null,
        s2e_edge_cases || null,
        s4_existing_docs || false,
        s4_needs_creating || null,
        s4_priority || null,
        s4_definition_chunk || false,
        s4_diagnostic_chunk || false,
        s4_resolution_chunk || false,
        s4_example_cases || false,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Save answers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
