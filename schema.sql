-- AEx Fault Classes Schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fault_classes (
  id SERIAL PRIMARY KEY,
  number INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  failure_reason TEXT,
  engineer_validated BOOLEAN DEFAULT FALSE,
  priority_to_improve VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fault_class_answers (
  id SERIAL PRIMARY KEY,
  fault_class_id INT UNIQUE REFERENCES fault_classes(id) ON DELETE CASCADE,
  s2a_description TEXT,
  s2a_commonality TEXT,
  s2a_intermittent TEXT,
  s2a_appears_with TEXT,
  s2b_clearest_signal TEXT,
  s2b_signal_combination TEXT,
  s2b_lifecycle_point TEXT,
  s2b_not_this_fault TEXT,
  s2b_confused_with TEXT,
  s2c_diagnostics JSONB DEFAULT '[]'::jsonb,
  s2c_thresholds TEXT,
  s2c_additional_sources TEXT,
  s2d_resolution_steps JSONB DEFAULT '[]'::jsonb,
  s2d_resolution_time TEXT,
  s2d_escalation_required TEXT,
  s2e_correct_response TEXT,
  s2e_example_case TEXT,
  s2e_edge_cases TEXT,
  s4_existing_docs BOOLEAN DEFAULT FALSE,
  s4_needs_creating TEXT,
  s4_priority VARCHAR(100),
  s4_definition_chunk BOOLEAN DEFAULT FALSE,
  s4_diagnostic_chunk BOOLEAN DEFAULT FALSE,
  s4_resolution_chunk BOOLEAN DEFAULT FALSE,
  s4_example_cases BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS global_answers (
  id SERIAL PRIMARY KEY,
  s1_new_fault_classes TEXT,
  s1_disputed_fault_classes TEXT,
  s1_rare_obsolete TEXT,
  s3_highest_impact TEXT,
  s3_hardest_to_diagnose TEXT,
  s3_most_misdiagnosed TEXT,
  s3_first_to_improve TEXT,
  s3_unlisted_faults TEXT,
  s3_additional_endpoints TEXT,
  s3_data_quality_issues TEXT,
  s3_historical_cases TEXT,
  s3_real_scenarios TEXT,
  s3_wrong_recommendation TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
