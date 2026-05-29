import { Router, Request, Response } from 'express';
import { Parser } from '@json2csv/plainjs';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/export/csv
router.get('/csv', requireAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT
        fc.number,
        fc.name,
        fc.category,
        fc.failure_reason,
        fc.engineer_validated,
        fc.priority_to_improve,
        fca.s2a_description,
        fca.s2a_commonality,
        fca.s2a_intermittent,
        fca.s2a_appears_with,
        fca.s2b_clearest_signal,
        fca.s2b_signal_combination,
        fca.s2b_lifecycle_point,
        fca.s2b_not_this_fault,
        fca.s2b_confused_with,
        fca.s2c_diagnostics,
        fca.s2c_thresholds,
        fca.s2c_additional_sources,
        fca.s2d_resolution_steps,
        fca.s2d_resolution_time,
        fca.s2d_escalation_required,
        fca.s2e_correct_response,
        fca.s2e_example_case,
        fca.s2e_edge_cases,
        fca.s4_existing_docs,
        fca.s4_needs_creating,
        fca.s4_priority,
        fca.s4_definition_chunk,
        fca.s4_diagnostic_chunk,
        fca.s4_resolution_chunk,
        fca.s4_example_cases
      FROM fault_classes fc
      LEFT JOIN fault_class_answers fca ON fca.fault_class_id = fc.id
      ORDER BY fc.number ASC
    `);

    const rows = result.rows.map((row) => ({
      number: row.number,
      name: row.name,
      category: row.category,
      failure_reason: row.failure_reason || '',
      engineer_validated: row.engineer_validated ? 'Yes' : 'No',
      priority_to_improve: row.priority_to_improve || '',
      s2a_description: row.s2a_description || '',
      s2a_commonality: row.s2a_commonality || '',
      s2a_intermittent: row.s2a_intermittent || '',
      s2a_appears_with: row.s2a_appears_with || '',
      s2b_clearest_signal: row.s2b_clearest_signal || '',
      s2b_signal_combination: row.s2b_signal_combination || '',
      s2b_lifecycle_point: row.s2b_lifecycle_point || '',
      s2b_not_this_fault: row.s2b_not_this_fault || '',
      s2b_confused_with: row.s2b_confused_with || '',
      s2c_diagnostics: row.s2c_diagnostics ? JSON.stringify(row.s2c_diagnostics) : '',
      s2c_thresholds: row.s2c_thresholds || '',
      s2c_additional_sources: row.s2c_additional_sources || '',
      s2d_resolution_steps: row.s2d_resolution_steps ? JSON.stringify(row.s2d_resolution_steps) : '',
      s2d_resolution_time: row.s2d_resolution_time || '',
      s2d_escalation_required: row.s2d_escalation_required || '',
      s2e_correct_response: row.s2e_correct_response || '',
      s2e_example_case: row.s2e_example_case || '',
      s2e_edge_cases: row.s2e_edge_cases || '',
      s4_existing_docs: row.s4_existing_docs ? 'Yes' : 'No',
      s4_needs_creating: row.s4_needs_creating || '',
      s4_priority: row.s4_priority || '',
      s4_definition_chunk: row.s4_definition_chunk ? 'Yes' : 'No',
      s4_diagnostic_chunk: row.s4_diagnostic_chunk ? 'Yes' : 'No',
      s4_resolution_chunk: row.s4_resolution_chunk ? 'Yes' : 'No',
      s4_example_cases: row.s4_example_cases ? 'Yes' : 'No',
    }));

    const fields = [
      { value: 'number', label: 'Fault Class #' },
      { value: 'name', label: 'Name' },
      { value: 'category', label: 'Category' },
      { value: 'failure_reason', label: 'Failure Reason' },
      { value: 'engineer_validated', label: 'Engineer Validated' },
      { value: 'priority_to_improve', label: 'Priority to Improve' },
      { value: 's2a_description', label: 'S2a: Description' },
      { value: 's2a_commonality', label: 'S2a: Commonality' },
      { value: 's2a_intermittent', label: 'S2a: Intermittent' },
      { value: 's2a_appears_with', label: 'S2a: Appears With' },
      { value: 's2b_clearest_signal', label: 'S2b: Clearest Signal' },
      { value: 's2b_signal_combination', label: 'S2b: Signal Combination' },
      { value: 's2b_lifecycle_point', label: 'S2b: Lifecycle Point' },
      { value: 's2b_not_this_fault', label: 'S2b: Not This Fault' },
      { value: 's2b_confused_with', label: 'S2b: Confused With' },
      { value: 's2c_diagnostics', label: 'S2c: Diagnostics (JSON)' },
      { value: 's2c_thresholds', label: 'S2c: Thresholds' },
      { value: 's2c_additional_sources', label: 'S2c: Additional Sources' },
      { value: 's2d_resolution_steps', label: 'S2d: Resolution Steps (JSON)' },
      { value: 's2d_resolution_time', label: 'S2d: Resolution Time' },
      { value: 's2d_escalation_required', label: 'S2d: Escalation Required' },
      { value: 's2e_correct_response', label: 'S2e: Correct Response' },
      { value: 's2e_example_case', label: 'S2e: Example Case' },
      { value: 's2e_edge_cases', label: 'S2e: Edge Cases' },
      { value: 's4_existing_docs', label: 'S4: Existing Docs' },
      { value: 's4_needs_creating', label: 'S4: Needs Creating' },
      { value: 's4_priority', label: 'S4: Priority' },
      { value: 's4_definition_chunk', label: 'S4: Definition Chunk' },
      { value: 's4_diagnostic_chunk', label: 'S4: Diagnostic Chunk' },
      { value: 's4_resolution_chunk', label: 'S4: Resolution Chunk' },
      { value: 's4_example_cases', label: 'S4: Example Cases' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fault_classes_rubric.csv"');
    res.send(csv);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
