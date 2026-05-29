import pool from '../db';
import {
  IStorage,
  StoredUser,
  StoredFaultClass,
  StoredAnswers,
  StoredGlobalAnswers,
} from './types';

export class PostgresStorage implements IStorage {
  async findUserByUsername(username: string): Promise<StoredUser | null> {
    const result = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async getFaultClasses(): Promise<StoredFaultClass[]> {
    const result = await pool.query(
      'SELECT id, number, name, category, failure_reason, engineer_validated, priority_to_improve FROM fault_classes ORDER BY number ASC'
    );
    return result.rows;
  }

  async updateFaultClass(
    id: number,
    data: { engineer_validated: boolean; priority_to_improve: string | null }
  ): Promise<StoredFaultClass> {
    const result = await pool.query(
      `UPDATE fault_classes
       SET engineer_validated = $1,
           priority_to_improve = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, number, name, category, failure_reason, engineer_validated, priority_to_improve`,
      [data.engineer_validated, data.priority_to_improve, id]
    );
    if (result.rows.length === 0) {
      throw new Error(`Fault class with id ${id} not found`);
    }
    return result.rows[0];
  }

  async getAnswers(faultClassId: number): Promise<StoredAnswers | null> {
    const result = await pool.query(
      'SELECT * FROM fault_class_answers WHERE fault_class_id = $1',
      [faultClassId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async upsertAnswers(faultClassId: number, answers: Partial<StoredAnswers>): Promise<StoredAnswers> {
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
    } = answers;

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
        JSON.stringify(s2d_resolution_steps || []),
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
    return result.rows[0];
  }

  async getAllAnswersForExport(): Promise<StoredAnswers[]> {
    const result = await pool.query('SELECT * FROM fault_class_answers');
    return result.rows;
  }

  async getGlobalAnswers(): Promise<StoredGlobalAnswers> {
    const result = await pool.query('SELECT * FROM global_answers ORDER BY id ASC LIMIT 1');
    if (result.rows.length === 0) {
      return {
        s1_new_fault_classes: null,
        s1_disputed_fault_classes: null,
        s1_rare_obsolete: null,
        s3_highest_impact: null,
        s3_hardest_to_diagnose: null,
        s3_most_misdiagnosed: null,
        s3_first_to_improve: null,
        s3_unlisted_faults: null,
        s3_additional_endpoints: null,
        s3_data_quality_issues: null,
        s3_historical_cases: null,
        s3_real_scenarios: null,
        s3_wrong_recommendation: null,
      };
    }
    return result.rows[0];
  }

  async updateGlobalAnswers(answers: Partial<StoredGlobalAnswers>): Promise<StoredGlobalAnswers> {
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
    } = answers;

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
    return result.rows[0];
  }
}
