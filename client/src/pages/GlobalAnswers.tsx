import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getGlobalAnswers, saveGlobalAnswers } from '../api';
import type { GlobalAnswers as GlobalAnswersType } from '../types';

const EMPTY: GlobalAnswersType = {
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
};

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

export default function GlobalAnswers() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<GlobalAnswersType>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const loadData = useCallback(async () => {
    try {
      const data = await getGlobalAnswers();
      setAnswers({
        s1_new_fault_classes: data.s1_new_fault_classes || '',
        s1_disputed_fault_classes: data.s1_disputed_fault_classes || '',
        s1_rare_obsolete: data.s1_rare_obsolete || '',
        s3_highest_impact: data.s3_highest_impact || '',
        s3_hardest_to_diagnose: data.s3_hardest_to_diagnose || '',
        s3_most_misdiagnosed: data.s3_most_misdiagnosed || '',
        s3_first_to_improve: data.s3_first_to_improve || '',
        s3_unlisted_faults: data.s3_unlisted_faults || '',
        s3_additional_endpoints: data.s3_additional_endpoints || '',
        s3_data_quality_issues: data.s3_data_quality_issues || '',
        s3_historical_cases: data.s3_historical_cases || '',
        s3_real_scenarios: data.s3_real_scenarios || '',
        s3_wrong_recommendation: data.s3_wrong_recommendation || '',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      await saveGlobalAnswers(answers);
      setSaveMessage('Saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveMessage('Error saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof GlobalAnswersType) => (value: string) =>
    setAnswers((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-16 text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-xl font-bold text-gray-900">Section 3 &amp; Global Notes</h1>
              <p className="text-gray-500 text-sm mt-1">
                Session-wide observations and cross-cutting insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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

        {/* Section 1 — Session Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide mb-5">
            Section 1 — Session Notes
          </h2>
          <div className="space-y-5">
            <TextArea
              label="Are there fault classes missing from the current list of 19? What should be added?"
              value={answers.s1_new_fault_classes}
              onChange={set('s1_new_fault_classes')}
              placeholder="Describe any fault classes that should be added..."
            />
            <TextArea
              label="Are any of the 19 fault classes incorrectly defined, named, or categorised?"
              value={answers.s1_disputed_fault_classes}
              onChange={set('s1_disputed_fault_classes')}
              placeholder="Note any disputed or incorrectly defined fault classes..."
            />
            <TextArea
              label="Are there fault classes that are so rare or obsolete they should be removed or flagged?"
              value={answers.s1_rare_obsolete}
              onChange={set('s1_rare_obsolete')}
              placeholder="Note any rare or obsolete fault classes..."
            />
          </div>
        </div>

        {/* Section 3 — Prioritisation & Cross-Cutting */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-indigo-700 uppercase tracking-wide mb-5">
            Section 3 — Prioritisation &amp; Cross-Cutting Insights
          </h2>
          <div className="space-y-5">
            <TextArea
              label="Which fault classes have the highest operational impact (frequency × resolution time)?"
              value={answers.s3_highest_impact}
              onChange={set('s3_highest_impact')}
              placeholder="List the highest impact fault classes..."
            />
            <TextArea
              label="Which fault classes are hardest to diagnose and why?"
              value={answers.s3_hardest_to_diagnose}
              onChange={set('s3_hardest_to_diagnose')}
              placeholder="Describe the most difficult to diagnose fault classes..."
            />
            <TextArea
              label="Which fault classes are most frequently misdiagnosed by support agents?"
              value={answers.s3_most_misdiagnosed}
              onChange={set('s3_most_misdiagnosed')}
              placeholder="Which fault classes get misdiagnosed most often?"
            />
            <TextArea
              label="If AEx could only improve guidance for 3 fault classes first, which should they be?"
              value={answers.s3_first_to_improve}
              onChange={set('s3_first_to_improve')}
              placeholder="Top 3 priority fault classes to improve..."
            />
            <TextArea
              label="Are there fault patterns or sub-types not captured in the 19 fault classes?"
              value={answers.s3_unlisted_faults}
              onChange={set('s3_unlisted_faults')}
              placeholder="Describe any unlisted fault patterns..."
            />
            <TextArea
              label="Are there additional API endpoints or system sources that would improve diagnostics?"
              value={answers.s3_additional_endpoints}
              onChange={set('s3_additional_endpoints')}
              placeholder="Describe additional endpoints or data sources..."
            />
            <TextArea
              label="Are there known data quality issues that make diagnosis harder?"
              value={answers.s3_data_quality_issues}
              onChange={set('s3_data_quality_issues')}
              placeholder="Describe any data quality issues..."
            />
            <TextArea
              label="Are there historical case examples that would be valuable training data?"
              value={answers.s3_historical_cases}
              onChange={set('s3_historical_cases')}
              placeholder="Describe valuable historical cases..."
            />
            <TextArea
              label="What real-world scenarios should be used to validate AEx recommendations?"
              value={answers.s3_real_scenarios}
              onChange={set('s3_real_scenarios')}
              placeholder="Describe real-world test scenarios..."
            />
            <TextArea
              label="Have you seen cases where AEx gave a wrong recommendation? What happened?"
              value={answers.s3_wrong_recommendation}
              onChange={set('s3_wrong_recommendation')}
              placeholder="Describe any cases of wrong recommendations..."
            />
          </div>
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
