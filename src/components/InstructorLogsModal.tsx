import React, { useState, useEffect } from 'react';
import { EvaluationResult } from '../types';
import { X, Download, Trash2, Award, Search, Users, CheckCircle, AlertTriangle } from 'lucide-react';

interface InstructorLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructorLogsModal: React.FC<InstructorLogsModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<EvaluationResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  const loadLogs = () => {
    try {
      const stored = localStorage.getItem('os_simulator_student_logs');
      if (stored) {
        setLogs(JSON.parse(stored));
      } else {
        setLogs([]);
      }
    } catch {
      setLogs([]);
    }
  };

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all student records? This action cannot be undone.')) {
      localStorage.removeItem('os_simulator_student_logs');
      setLogs([]);
    }
  };

  const sections = Array.from(new Set(logs.map(l => l.student.section).filter(Boolean)));

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.student.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = selectedSection === 'ALL' || log.student.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  const exportBatchCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = [
      'Student Name',
      'Section',
      'Target OS',
      'Task Title',
      'Final Score (%)',
      'Grade',
      'Status',
      'Time Taken (s)',
      'Date Completed'
    ];

    const rows = filteredLogs.map(l => [
      `"${l.student.name}"`,
      `"${l.student.section}"`,
      `"${l.selectedOS.toUpperCase()}"`,
      `"${l.task.title.replace(/"/g, '""')}"`,
      `"${l.percentage}%"`,
      `"${l.grade}"`,
      `"${l.passed ? 'PASS' : 'FAIL'}"`,
      `"${l.completionTimeSeconds}"`,
      `"${l.timestamp}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Batch_Student_OS_Installation_Results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-100">Instructor Evaluation Logs & Gradebook</h3>
              <p className="text-xs text-slate-400">Review student performance records & export CSV reports</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student name, task..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Sections</option>
              {sections.map(sec => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportBatchCSV}
              disabled={filteredLogs.length === 0}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV ({filteredLogs.length})</span>
            </button>
            <button
              onClick={clearLogs}
              disabled={logs.length === 0}
              className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 disabled:opacity-40 rounded-lg text-xs font-medium border border-rose-800/50 flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Award className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-400">No student assessment records found.</p>
              <p className="text-xs text-slate-500">Student completed evaluations will automatically be saved here.</p>
            </div>
          ) : (
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Section</th>
                    <th className="px-4 py-3">Target OS</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-100">{log.student.name}</td>
                      <td className="px-4 py-3 text-slate-300">{log.student.section}</td>
                      <td className="px-4 py-3">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {log.selectedOS}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-400">{log.percentage}%</td>
                      <td className="px-4 py-3 text-slate-200">{log.grade}</td>
                      <td className="px-4 py-3">
                        {log.passed ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" /> FAIL
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Total Records Saved: <strong className="text-slate-200">{logs.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
