import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getFaultClasses, getAnswers, saveAnswers, updateFaultClass } from '../api';
import type { FaultClass, FaultClassAnswers, DiagnosticRow, ResolutionRow } from '../types';

const DEFAULT_RESOLUTION_STEPS: ResolutionRow[] = [
  { actor: 'Support Agent', action: '', expected_outcome: '' },
  { actor: 'Customer', action: '', expected_outcome: '' },
  { actor: 'Field Technician', action: '', expected_outcome: '' },
  { actor: 'Escalation', action: '', expected_outcome: '' },
];

const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

const SECTIONS = [
  { id: 's2a', label: '2a — Description' },
  { id: 's2b', label: '2b — Identification' },
  { id: 's2c', label: '2c — Diagnostics' },
  { id: 's2d', label: '2d — Resolution' },
  { id: 's2e', label: '2e — Validation' },
  { id: 's4', label: 'S4 — Documentation' },
];

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent resize-y min-h-[72px]"
      />
    </div>
  );
}

export default function FaultClassDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [faultClass, setFaultClass] = useState<FaultClass | null>(null);
  const [answers, setAnswers] = useState<FaultClassAnswers | null>(null);
  const [activeSection, setActiveSection] = useState('s2a');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [classes, ans] = await Promise.all([
        getFaultClasses(),
        getAnswers(parseInt(id)),
      ]);
      const fc = classes.find((f) => f.id === parseInt(id));
      if (!fc) {
        navigate('/');
        return;
      }
      setFaultClass(fc);

      // Ensure resolution steps have 4 default rows if empty
      const resolSteps =
        ans.s2d_resolution_steps && ans.s2d_resolution_steps.length > 0
          ? ans.s2d_resolution_steps
          : DEFAULT_RESOLUTION_STEPS;

      setAnswers({
        ...ans,
        s2a_description: ans.s2a_description || '',
        s2a_commonality: ans.s2a_commonality || '',
        s2a_intermittent: ans.s2a_intermittent || '',
        s2a_appears_with: ans.s2a_appears_with || '',
        s2b_clearest_signal: ans.s2b_clearest_signal || '',
        s2b_signal_combination: ans.s2b_signal_combination || '',
        s2b_lifecycle_point: ans.s2b_lifecycle_point || '',
        s2b_not_this_fault: ans.s2b_not_this_fault || '',
        s2b_confused_with: ans.s2b_confused_with || '',
        s2c_diagnostics: ans.s2c_diagnostics || [],
        s2c_thresholds: ans.s2c_thresholds || '',
        s2c_additional_sources: ans.s2c_additional_sources || '',
        s2d_resolution_steps: resolSteps,
        s2d_resolution_time: ans.s2d_resolution_time || '',
        s2d_escalation_required: ans.s2d_escalation_required || '',
        s2e_correct_response: ans.s2e_correct_response || '',
        s2e_example_case: ans.s2e_example_case || '',
        s2e_edge_cases: ans.s2e_edge_cases || '',
        s4_existing_docs: ans.s4_existing_docs || false,
        s4_needs_creating: ans.s4_needs_creating || '',
        s4_priority: ans.s4_priority || '',
        s4_definition_chunk: ans.s4_definition_chunk || false,
        s4_diagnostic_chunk: ans.s4_diagnostic_chunk || false,
        s4_resolution_chunk: ans.s4_resolution_chunk || false,
        s4_example_cases: ans.s4_example_cases || false,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!faultClass || !answers) return;
    setSaving(true);
    setSaveMessage('');
    try {
      await Promise.all([
        updateFaultClass(faultClass.id, {
          engineer_validated: faultClass.engineer_validated,
          priority_to_improve: faultClass.priority_to_improve,
        }),
        saveAnswers(faultClass.id, answers),
      ]);
      setSaveMessage('Saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveMessage('Error saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Diagnostic table helpers
  const addDiagRow = () => {
    if (!answers) return;
    setAnswers({
      ...answers,
      s2c_diagnostics: [
        ...answers.s2c_diagnostics,
        { diagnostic: '', key_fields: '', what_to_look_for: '' },
      ],
    });
  };

  const removeDiagRow = (idx: number) => {
    if (!answers) return;
    setAnswers({
      ...answers,
      s2c_diagnostics: answers.s2c_diagnostics.filter((_, i) => i !== idx),
    });
  };

  const updateDiagRow = (idx: number, field: keyof DiagnosticRow, value: string) => {
    if (!answers) return;
    const updated = answers.s2c_diagnostics.map((row, i) =>
      i === idx ? { ...row, [field]: value } : row
    );
    setAnswers({ ...answers, s2c_diagnostics: updated });
  };

  // Resolution table helpers
  const updateResolRow = (idx: number, field: keyof ResolutionRow, value: string) => {
    if (!answers) return;
    const updated = answers.s2d_resolution_steps.map((row, i) =>
      i === idx ? { ...row, [field]: value } : row
    );
    setAnswers({ ...answers, s2d_resolution_steps: updated });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-16 text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!faultClass || !answers) return null;

  const categoryColors: Record<string, string> = {
    FNO: 'bg-blue-100 text-blue-700',
    SOFTWARE: 'bg-purple-100 text-purple-700',
    INFRASTRUCTURE: 'bg-orange-100 text-orange-700',
    Physical: 'bg-green-100 text-green-700',
    Uncategorised: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/')}
              className="mt-1 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Back to dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-400 text-sm font-mono">#{faultClass.number}</span>
                <h1 className="text-xl font-bold text-gray-900">{faultClass.name}</h1>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    categoryColors[faultClass.category] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {faultClass.category}
                </span>
              </div>
              {faultClass.failure_reason && (
                <p className="text-gray-500 text-sm mt-1">{faultClass.failure_reason}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {saveMessage && (
              <span
                className={`text-sm ${
                  saveMessage.includes('Error') ? 'text-red-500' : 'text-green-600'
                }`}
              >
                {saveMessage}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Section 1 — Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
            Section 1 — Status
          </h2>
          <div className="flex flex-wrap gap-6 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={faultClass.engineer_validated}
                onChange={(e) =>
                  setFaultClass({ ...faultClass, engineer_validated: e.target.checked })
                }
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Engineer Validated</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Priority to Improve:</label>
              <select
                value={faultClass.priority_to_improve || ''}
                onChange={(e) =>
                  setFaultClass({ ...faultClass, priority_to_improve: e.target.value || null })
                }
                className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                <option value="">—</option>
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 mb-4 flex-wrap">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeSection === s.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-indigo-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Section 2a */}
          {activeSection === 's2a' && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide">
                2a — Fault Description
              </h2>
              <TextArea
                label="What does this fault class mean? Describe it in plain language."
                value={answers.s2a_description}
                onChange={(v) => setAnswers({ ...answers, s2a_description: v })}
                placeholder="Describe what this fault class means..."
              />
              <TextArea
                label="How common is this fault? Approximate frequency or volume."
                value={answers.s2a_commonality}
                onChange={(v) => setAnswers({ ...answers, s2a_commonality: v })}
                placeholder="e.g. Very common — ~15% of all provisioning failures..."
              />
              <TextArea
                label="Is this fault intermittent or consistent? Does it self-resolve?"
                value={answers.s2a_intermittent}
                onChange={(v) => setAnswers({ ...answers, s2a_intermittent: v })}
                placeholder="e.g. Consistent until resolved. Does not self-resolve..."
              />
              <TextArea
                label="Does this fault appear alongside other fault classes?"
                value={answers.s2a_appears_with}
                onChange={(v) => setAnswers({ ...answers, s2a_appears_with: v })}
                placeholder="e.g. Sometimes co-occurs with ONT Offline..."
              />
            </div>
          )}

          {/* Section 2b */}
          {activeSection === 's2b' && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide">
                2b — Identification Signals
              </h2>
              <TextArea
                label="What is the single clearest signal that this fault is occurring?"
                value={answers.s2b_clearest_signal}
                onChange={(v) => setAnswers({ ...answers, s2b_clearest_signal: v })}
                placeholder="The clearest indicator..."
              />
              <TextArea
                label="What combination of signals confirms this fault?"
                value={answers.s2b_signal_combination}
                onChange={(v) => setAnswers({ ...answers, s2b_signal_combination: v })}
                placeholder="List the combination of signals..."
              />
              <TextArea
                label="At what point in the provisioning lifecycle does this fault appear?"
                value={answers.s2b_lifecycle_point}
                onChange={(v) => setAnswers({ ...answers, s2b_lifecycle_point: v })}
                placeholder="e.g. During OLT registration, after CPE connected..."
              />
              <TextArea
                label="What signals tell you this is NOT this fault class?"
                value={answers.s2b_not_this_fault}
                onChange={(v) => setAnswers({ ...answers, s2b_not_this_fault: v })}
                placeholder="Exclusion criteria..."
              />
              <TextArea
                label="Which other fault classes could this be confused with, and how do you tell them apart?"
                value={answers.s2b_confused_with}
                onChange={(v) => setAnswers({ ...answers, s2b_confused_with: v })}
                placeholder="e.g. Could be confused with ONT Conflict because..."
              />
            </div>
          )}

          {/* Section 2c */}
          {activeSection === 's2c' && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide">
                2c — Diagnostic Data
              </h2>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Diagnostic Sources Table
                  </label>
                  <button
                    onClick={addDiagRow}
                    className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg transition-colors"
                  >
                    + Add Row
                  </button>
                </div>

                {answers.s2c_diagnostics.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
                    No diagnostic rows yet. Click "+ Add Row" to add one.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-gray-50 text-xs text-gray-600">
                          <th className="px-3 py-2 text-left font-semibold border-b border-gray-200 w-1/3">
                            Diagnostic / Data Source
                          </th>
                          <th className="px-3 py-2 text-left font-semibold border-b border-gray-200 w-1/3">
                            Key Fields / Attributes
                          </th>
                          <th className="px-3 py-2 text-left font-semibold border-b border-gray-200 w-1/3">
                            What to Look For
                          </th>
                          <th className="px-3 py-2 border-b border-gray-200 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {answers.s2c_diagnostics.map((row, idx) => (
                          <tr key={idx} className="border-b border-gray-100 last:border-0">
                            <td className="px-2 py-1">
                              <textarea
                                value={row.diagnostic}
                                onChange={(e) => updateDiagRow(idx, 'diagnostic', e.target.value)}
                                rows={2}
                                className="w-full text-xs border-0 focus:outline-none focus:ring-1 focus:ring-indigo-300 rounded p-1 resize-y min-h-[48px]"
                                placeholder="e.g. AEx Portal logs"
                              />
                            </td>
                            <td className="px-2 py-1">
                              <textarea
                                value={row.key_fields}
                                onChange={(e) => updateDiagRow(idx, 'key_fields', e.target.value)}
                                rows={2}
                                className="w-full text-xs border-0 focus:outline-none focus:ring-1 focus:ring-indigo-300 rounded p-1 resize-y min-h-[48px]"
                                placeholder="e.g. status, error_code"
                              />
                            </td>
                            <td className="px-2 py-1">
                              <textarea
                                value={row.what_to_look_for}
                                onChange={(e) =>
                                  updateDiagRow(idx, 'what_to_look_for', e.target.value)
                                }
                                rows={2}
                                className="w-full text-xs border-0 focus:outline-none focus:ring-1 focus:ring-indigo-300 rounded p-1 resize-y min-h-[48px]"
                                placeholder="e.g. status = 'FAILED'"
                              />
                            </td>
                            <td className="px-2 py-1 text-center">
                              <button
                                onClick={() => removeDiagRow(idx)}
                                className="text-red-400 hover:text-red-600 transition-colors"
                                title="Remove row"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <TextArea
                label="Are there known thresholds or values that indicate this fault?"
                value={answers.s2c_thresholds}
                onChange={(v) => setAnswers({ ...answers, s2c_thresholds: v })}
                placeholder="e.g. Optical Rx power below -28 dBm indicates physical fault..."
              />
              <TextArea
                label="What additional data sources could help diagnose this?"
                value={answers.s2c_additional_sources}
                onChange={(v) => setAnswers({ ...answers, s2c_additional_sources: v })}
                placeholder="e.g. OLT CLI, NMS platform, field technician visit..."
              />
            </div>
          )}

          {/* Section 2d */}
          {activeSection === 's2d' && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide">
                2d — Resolution Steps
              </h2>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Resolution Steps by Actor
                </label>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-50 text-xs text-gray-600">
                        <th className="px-3 py-2 text-left font-semibold border-b border-gray-200 w-36">
                          Actor
                        </th>
                        <th className="px-3 py-2 text-left font-semibold border-b border-gray-200">
                          Action
                        </th>
                        <th className="px-3 py-2 text-left font-semibold border-b border-gray-200">
                          Expected Outcome
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {answers.s2d_resolution_steps.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-0">
                          <td className="px-3 py-2">
                            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                              {row.actor}
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            <textarea
                              value={row.action}
                              onChange={(e) => updateResolRow(idx, 'action', e.target.value)}
                              rows={2}
                              className="w-full text-xs border-0 focus:outline-none focus:ring-1 focus:ring-indigo-300 rounded p-1 resize-y min-h-[48px]"
                              placeholder="What should this actor do?"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <textarea
                              value={row.expected_outcome}
                              onChange={(e) =>
                                updateResolRow(idx, 'expected_outcome', e.target.value)
                              }
                              rows={2}
                              className="w-full text-xs border-0 focus:outline-none focus:ring-1 focus:ring-indigo-300 rounded p-1 resize-y min-h-[48px]"
                              placeholder="Expected result..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <TextArea
                label="What is the typical resolution time for this fault?"
                value={answers.s2d_resolution_time}
                onChange={(v) => setAnswers({ ...answers, s2d_resolution_time: v })}
                placeholder="e.g. Typically resolved within 30 minutes by support agent..."
              />
              <TextArea
                label="Is escalation required? Under what conditions?"
                value={answers.s2d_escalation_required}
                onChange={(v) => setAnswers({ ...answers, s2d_escalation_required: v })}
                placeholder="e.g. Escalate if not resolved within 2 hours..."
              />
            </div>
          )}

          {/* Section 2e */}
          {activeSection === 's2e' && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide">
                2e — Validation
              </h2>
              <TextArea
                label="What is the correct system response / expected behaviour after resolution?"
                value={answers.s2e_correct_response}
                onChange={(v) => setAnswers({ ...answers, s2e_correct_response: v })}
                placeholder="e.g. Provisioning status changes to SUCCESS, ONT goes online..."
              />
              <TextArea
                label="Can you describe a real example case of this fault and resolution?"
                value={answers.s2e_example_case}
                onChange={(v) => setAnswers({ ...answers, s2e_example_case: v })}
                placeholder="Describe a real or representative example..."
              />
              <TextArea
                label="What are the edge cases or unusual scenarios for this fault?"
                value={answers.s2e_edge_cases}
                onChange={(v) => setAnswers({ ...answers, s2e_edge_cases: v })}
                placeholder="e.g. If the fault persists after FSAN is set, check for ONT conflict..."
              />
            </div>
          )}

          {/* Section 4 */}
          {activeSection === 's4' && (
            <div className="space-y-5">
              <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide">
                Section 4 — Documentation Readiness
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={answers.s4_existing_docs}
                    onChange={(e) => setAnswers({ ...answers, s4_existing_docs: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Existing documentation?</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={answers.s4_definition_chunk}
                    onChange={(e) =>
                      setAnswers({ ...answers, s4_definition_chunk: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Definition chunk ready?</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={answers.s4_diagnostic_chunk}
                    onChange={(e) =>
                      setAnswers({ ...answers, s4_diagnostic_chunk: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Diagnostic chunk ready?</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={answers.s4_resolution_chunk}
                    onChange={(e) =>
                      setAnswers({ ...answers, s4_resolution_chunk: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Resolution chunk ready?</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={answers.s4_example_cases}
                    onChange={(e) =>
                      setAnswers({ ...answers, s4_example_cases: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Example cases ready?</span>
                </label>
              </div>

              <TextArea
                label="What documentation needs creating?"
                value={answers.s4_needs_creating}
                onChange={(v) => setAnswers({ ...answers, s4_needs_creating: v })}
                placeholder="Describe what documentation still needs to be created..."
              />

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Documentation Priority
                </label>
                <select
                  value={answers.s4_priority || ''}
                  onChange={(e) => setAnswers({ ...answers, s4_priority: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <option value="">— Select Priority —</option>
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Save Bar */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>
    </div>
  );
}
