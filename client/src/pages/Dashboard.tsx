import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getFaultClasses, updateFaultClass, exportCsv, getAnswers } from '../api';
import type { FaultClass } from '../types';

const PRIORITY_OPTIONS = ['', 'High', 'Medium', 'Low'];

const CATEGORY_COLORS: Record<string, string> = {
  FNO: 'bg-blue-100 text-blue-700',
  SOFTWARE: 'bg-purple-100 text-purple-700',
  INFRASTRUCTURE: 'bg-orange-100 text-orange-700',
  Physical: 'bg-green-100 text-green-700',
  Uncategorised: 'bg-gray-100 text-gray-600',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [faultClasses, setFaultClasses] = useState<FaultClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const data = await getFaultClasses();
      setFaultClasses(data);

      // Check how many have non-empty answers
      const counts = await Promise.all(
        data.map(async (fc) => {
          try {
            const ans = await getAnswers(fc.id);
            const hasContent =
              (ans.s2a_description && ans.s2a_description.trim()) ||
              (ans.s2b_clearest_signal && ans.s2b_clearest_signal.trim()) ||
              (ans.s2c_diagnostics && ans.s2c_diagnostics.length > 0) ||
              (ans.s2d_resolution_steps && ans.s2d_resolution_steps.some((r) => r.action.trim()));
            return hasContent ? 1 : 0;
          } catch {
            return 0;
          }
        })
      );
      setAnsweredCount(counts.reduce<number>((a, b) => a + b, 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleValidatedChange = async (fc: FaultClass, checked: boolean) => {
    try {
      const updated = await updateFaultClass(fc.id, {
        engineer_validated: checked,
        priority_to_improve: fc.priority_to_improve,
      });
      setFaultClasses((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePriorityChange = async (fc: FaultClass, value: string) => {
    try {
      const updated = await updateFaultClass(fc.id, {
        engineer_validated: fc.engineer_validated,
        priority_to_improve: value || null,
      });
      setFaultClasses((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportCsv();
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AEx Fault Class Rubric</h1>
            <p className="text-gray-500 text-sm mt-1">
              Review and document the 19 network fault classes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/global-answers"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              Section 3 &amp; Global Notes
            </Link>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg transition-colors"
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">Progress</span>
              <span className="text-gray-500">{answeredCount} / 19 fault classes with answers</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${(answeredCount / 19) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 w-10">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Fault Class Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden lg:table-cell">
                    Failure Reason
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-600 w-32">
                    Eng. Validated
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 w-36">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {faultClasses.map((fc) => (
                  <tr
                    key={fc.id}
                    className="hover:bg-indigo-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/fault-class/${fc.id}`)}
                  >
                    <td className="px-4 py-3 text-gray-400 font-mono">{fc.number}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{fc.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          CATEGORY_COLORS[fc.category] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {fc.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell truncate max-w-xs">
                      {fc.failure_reason || <span className="italic text-gray-300">—</span>}
                    </td>
                    <td
                      className="px-4 py-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={fc.engineer_validated}
                        onChange={(e) => handleValidatedChange(fc, e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </td>
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={fc.priority_to_improve || ''}
                        onChange={(e) => handlePriorityChange(fc, e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      >
                        <option value="">—</option>
                        {PRIORITY_OPTIONS.filter(Boolean).map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
