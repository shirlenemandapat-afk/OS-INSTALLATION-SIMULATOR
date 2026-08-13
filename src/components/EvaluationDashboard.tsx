import React, { useEffect } from 'react';
import { EvaluationResult } from '../types';
import { exportToCSV } from '../data/tasks';
import { Award, Download, CheckCircle2, AlertTriangle, RotateCcw, User, FileText, Clock, Users } from 'lucide-react';

interface EvaluationDashboardProps {
  result: EvaluationResult;
  onRestartTask: () => void;
  onOpenInstructorLogs: () => void;
}

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({
  result,
  onRestartTask,
  onOpenInstructorLogs
}) => {
  // Automatically save result to localStorage for instructor review
  useEffect(() => {
    try {
      const stored = localStorage.getItem('os_simulator_student_logs');
      const logs: EvaluationResult[] = stored ? JSON.parse(stored) : [];
      logs.unshift(result);
      localStorage.setItem('os_simulator_student_logs', JSON.stringify(logs.slice(0, 100))); // keep latest 100
    } catch (e) {
      console.error('Failed to save student evaluation log:', e);
    }
  }, [result]);

  const handleExport = () => {
    exportToCSV(result);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white p-6">
      {/* Top Banner Header */}
      <header className="max-w-5xl mx-auto w-full flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-blue-400">Assessment Report</span>
          <h1 className="text-xl font-extrabold text-slate-100">Student Configuration & Installation Results</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 text-xs transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            <span>Export Results to CSV</span>
          </button>
          <button
            onClick={onOpenInstructorLogs}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 shadow flex items-center gap-2 transition-all"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Gradebook</span>
          </button>
        </div>
      </header>

      {/* Content Body */}
      <main className="max-w-5xl mx-auto w-full my-6 space-y-6 flex-1">
        {/* Score & Student Summary Hero Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Left: Overall Score Badge */}
          <div className="md:col-span-5 text-center p-6 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2">
            <Award className={`w-12 h-12 mx-auto ${result.passed ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div className="text-4xl font-extrabold tracking-tight text-white">
              {result.percentage}%
            </div>
            <div className={`text-sm font-bold uppercase tracking-wider ${result.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
              Grade: {result.grade}
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              result.passed
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {result.passed ? 'PASSED ASSESSMENT' : 'NEEDS REVISION'}
            </span>
          </div>

          {/* Right: Student Info & Task Metadata */}
          <div className="md:col-span-7 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-blue-400" /> Student Identity
                </span>
                <p className="font-bold text-slate-100 text-sm">{result.student.name}</p>
                <p className="text-slate-400">Section: {result.student.section}</p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> Assessment Time
                </span>
                <p className="font-bold text-slate-100 text-sm">{result.completionTimeSeconds} seconds</p>
                <p className="text-slate-400">{result.timestamp}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5 text-emerald-400" /> Assigned Task
              </span>
              <p className="font-semibold text-slate-100">{result.task.title}</p>
              <p className="text-slate-300 text-[11px] leading-relaxed">{result.task.description}</p>
            </div>
          </div>
        </div>

        {/* Instant Feedback Criteria Breakdown */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-slate-100">Itemized Configuration Accuracy & Instant Feedback</h3>
            <span className="text-xs text-slate-400 font-semibold">
              Score: <strong className="text-amber-400">{result.totalEarned}</strong> / {result.totalMax} pts
            </span>
          </div>

          <div className="space-y-3">
            {result.scoreDetails.map((detail, index) => (
              <div
                key={index}
                className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${
                  detail.passed
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-rose-950/30 border-rose-800/60'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {detail.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  )}
                </div>

                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm">{detail.item}</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      detail.passed
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {detail.earned} / {detail.max} pts
                    </span>
                  </div>
                  <p className="text-slate-300 font-medium">{detail.feedback}</p>
                  <span className="text-[10px] text-slate-500 block">Category: {detail.category}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer Navigation */}
      <footer className="max-w-5xl mx-auto w-full border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <span className="text-slate-500">
          Result exported automatically to localStorage gradebook.
        </span>

        <div className="flex items-center gap-3">
          <button
            onClick={onRestartTask}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Another Task / Re-take</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
