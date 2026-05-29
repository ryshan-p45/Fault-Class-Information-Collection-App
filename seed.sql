-- Seed data for AEx Fault Classes

-- Admin user
INSERT INTO users (username, password_hash) VALUES
  ('admin', '$2a$10$pKGsaauzDCNhhi.3.bpOouJCfozN0eqWf8jiZRce10daycYz7Gez6')
ON CONFLICT (username) DO NOTHING;

-- 19 Fault Classes
INSERT INTO fault_classes (number, name, category, failure_reason) VALUES
  (1,  'FSAN not set',                        'FNO',              'FNO: FSAN not set'),
  (2,  'ONT not discovered',                  'FNO',              'FNO: ONT has not discovered on AEx'),
  (3,  'Device on another service',           'FNO',              'FNO: FSAN Configured on Another Service'),
  (4,  'ONT offline',                         'FNO',              'FNO: ONT Offline'),
  (5,  'Service conflict',                    'FNO',              'FNO: Service Conflict'),
  (6,  'ONT conflict',                        'FNO',              'FNO: ONT Conflict'),
  (7,  'Layer 3 device unavailable',          'FNO',              'FNO: Layer 3 Device Not Available to Provision'),
  (8,  'Missing VLAN',                        'SOFTWARE',         'SOFTWARE: Missing VLAN'),
  (9,  'Product config missing',              'SOFTWARE',         'SOFTWARE: Product configuration missing'),
  (10, 'GEM port failure',                    'SOFTWARE',         'SOFTWARE: GEM Port Failure'),
  (11, 'eero ownership transfer failure',     'SOFTWARE',         'SOFTWARE: eero ownership transfer failure'),
  (12, 'Timeout',                             'SOFTWARE',         'SOFTWARE: Timeout'),
  (13, 'Serial number already exists',        'SOFTWARE',         'SOFTWARE: Serial number already exists'),
  (14, 'No ports available on OLT',           'INFRASTRUCTURE',   'INFRASTRUCTURE: Unable to Access OLT for Provisioning'),
  (15, 'VLAN/VPLS readiness failure',         'INFRASTRUCTURE',   'INFRASTRUCTURE: VLAN / VPLS readiness failure'),
  (16, 'OLT not available',                   'INFRASTRUCTURE',   'INFRASTRUCTURE: OLT Not available'),
  (17, 'APC configure failure',               'INFRASTRUCTURE',   'INFRASTRUCTURE: APC configure operation failed'),
  (18, 'Optical / physical fault',            'Physical',         NULL),
  (19, 'PPPoE / RADIUS auth failure',         'Uncategorised',    NULL)
ON CONFLICT DO NOTHING;

-- Empty answer rows for all 19 fault classes
INSERT INTO fault_class_answers (fault_class_id, s2c_diagnostics, s2d_resolution_steps)
SELECT
  fc.id,
  '[]'::jsonb,
  '[{"actor":"Support Agent","action":"","expected_outcome":""},{"actor":"Customer","action":"","expected_outcome":""},{"actor":"Field Technician","action":"","expected_outcome":""},{"actor":"Escalation","action":"","expected_outcome":""}]'::jsonb
FROM fault_classes fc
WHERE fc.number BETWEEN 1 AND 19
ON CONFLICT (fault_class_id) DO NOTHING;

-- Single global answers row
INSERT INTO global_answers (
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
  s3_wrong_recommendation
) VALUES (
  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
);
