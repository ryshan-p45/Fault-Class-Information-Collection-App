export interface StoredUser {
  id: number;
  username: string;
  password_hash: string;
}

export interface StoredFaultClass {
  id: number;
  number: number;
  name: string;
  category: string;
  failure_reason: string | null;
  engineer_validated: boolean;
  priority_to_improve: string | null;
}

export interface StoredAnswers {
  fault_class_id: number;
  s2a_description: string | null;
  s2a_commonality: string | null;
  s2a_intermittent: string | null;
  s2a_appears_with: string | null;
  s2b_clearest_signal: string | null;
  s2b_signal_combination: string | null;
  s2b_lifecycle_point: string | null;
  s2b_not_this_fault: string | null;
  s2b_confused_with: string | null;
  s2c_diagnostics: object[];
  s2c_thresholds: string | null;
  s2c_additional_sources: string | null;
  s2d_resolution_steps: object[];
  s2d_resolution_time: string | null;
  s2d_escalation_required: string | null;
  s2e_correct_response: string | null;
  s2e_example_case: string | null;
  s2e_edge_cases: string | null;
  s4_existing_docs: boolean;
  s4_needs_creating: string | null;
  s4_priority: string | null;
  s4_definition_chunk: boolean;
  s4_diagnostic_chunk: boolean;
  s4_resolution_chunk: boolean;
  s4_example_cases: boolean;
}

export interface StoredGlobalAnswers {
  s1_new_fault_classes: string | null;
  s1_disputed_fault_classes: string | null;
  s1_rare_obsolete: string | null;
  s3_highest_impact: string | null;
  s3_hardest_to_diagnose: string | null;
  s3_most_misdiagnosed: string | null;
  s3_first_to_improve: string | null;
  s3_unlisted_faults: string | null;
  s3_additional_endpoints: string | null;
  s3_data_quality_issues: string | null;
  s3_historical_cases: string | null;
  s3_real_scenarios: string | null;
  s3_wrong_recommendation: string | null;
}

export interface IStorage {
  findUserByUsername(username: string): Promise<StoredUser | null>;
  getFaultClasses(): Promise<StoredFaultClass[]>;
  updateFaultClass(id: number, data: { engineer_validated: boolean; priority_to_improve: string | null }): Promise<StoredFaultClass>;
  getAnswers(faultClassId: number): Promise<StoredAnswers | null>;
  upsertAnswers(faultClassId: number, answers: Partial<StoredAnswers>): Promise<StoredAnswers>;
  getAllAnswersForExport(): Promise<StoredAnswers[]>;
  getGlobalAnswers(): Promise<StoredGlobalAnswers>;
  updateGlobalAnswers(answers: Partial<StoredGlobalAnswers>): Promise<StoredGlobalAnswers>;
}
