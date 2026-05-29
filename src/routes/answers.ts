import { Router, Request, Response } from 'express';
import { getStorage } from '../storage';
import { requireAuth } from '../middleware/auth';

const router = Router();

const DEFAULT_RESOLUTION_STEPS = [
  { actor: 'Support Agent', action: '', expected_outcome: '' },
  { actor: 'Customer', action: '', expected_outcome: '' },
  { actor: 'Field Technician', action: '', expected_outcome: '' },
  { actor: 'Escalation', action: '', expected_outcome: '' },
];

// GET /api/answers/:faultClassId
router.get('/:faultClassId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { faultClassId } = req.params;

  try {
    const answers = await getStorage().getAnswers(parseInt(faultClassId));

    if (!answers) {
      res.json({
        fault_class_id: parseInt(faultClassId),
        s2a_description: '', s2a_commonality: '', s2a_intermittent: '', s2a_appears_with: '',
        s2b_clearest_signal: '', s2b_signal_combination: '', s2b_lifecycle_point: '',
        s2b_not_this_fault: '', s2b_confused_with: '',
        s2c_diagnostics: [], s2c_thresholds: '', s2c_additional_sources: '',
        s2d_resolution_steps: DEFAULT_RESOLUTION_STEPS,
        s2d_resolution_time: '', s2d_escalation_required: '',
        s2e_correct_response: '', s2e_example_case: '', s2e_edge_cases: '',
        s4_existing_docs: false, s4_needs_creating: '', s4_priority: '',
        s4_definition_chunk: false, s4_diagnostic_chunk: false,
        s4_resolution_chunk: false, s4_example_cases: false,
      });
      return;
    }

    res.json(answers);
  } catch (err) {
    console.error('Get answers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/answers/:faultClassId
router.put('/:faultClassId', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { faultClassId } = req.params;

  try {
    const saved = await getStorage().upsertAnswers(parseInt(faultClassId), req.body);
    res.json(saved);
  } catch (err) {
    console.error('Save answers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
