export interface FaultClass {
  id: number;
  number: number;
  name: string;
  category: string;
  failure_reason: string | null;
  engineer_validated: boolean;
  priority_to_improve: string | null;
}

export interface DiagnosticRow {
  diagnostic: string;
  key_fields: string;
  what_to_look_for: string;
}

export interface ResolutionRow {
  actor: string;
  action: string;
  expected_outcome: string;
}

export interface FaultClassAnswers {
  fault_class_id: number;
  s2a_description: string;
  s2a_commonality: string;
  s2a_intermittent: string;
  s2a_appears_with: string;
  s2b_clearest_signal: string;
  s2b_signal_combination: string;
  s2b_lifecycle_point: string;
  s2b_not_this_fault: string;
  s2b_confused_with: string;
  s2c_diagnostics: DiagnosticRow[];
  s2c_thresholds: string;
  s2c_additional_sources: string;
  s2d_resolution_steps: ResolutionRow[];
  s2d_resolution_time: string;
  s2d_escalation_required: string;
  s2e_correct_response: string;
  s2e_example_case: string;
  s2e_edge_cases: string;
  s4_existing_docs: boolean;
  s4_needs_creating: string;
  s4_priority: string;
  s4_definition_chunk: boolean;
  s4_diagnostic_chunk: boolean;
  s4_resolution_chunk: boolean;
  s4_example_cases: boolean;
}

export interface GlobalAnswers {
  s1_new_fault_classes: string;
  s1_disputed_fault_classes: string;
  s1_rare_obsolete: string;
  s3_highest_impact: string;
  s3_hardest_to_diagnose: string;
  s3_most_misdiagnosed: string;
  s3_first_to_improve: string;
  s3_unlisted_faults: string;
  s3_additional_endpoints: string;
  s3_data_quality_issues: string;
  s3_historical_cases: string;
  s3_real_scenarios: string;
  s3_wrong_recommendation: string;
}
