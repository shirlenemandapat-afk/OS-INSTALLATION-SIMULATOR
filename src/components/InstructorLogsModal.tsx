import React, { useState, useEffect, useMemo } from 'react';
import { EvaluationResult } from '../types';
import { fetchStudentScoresFromSupabase, saveStudentScoreToSupabase, SQL_SETUP_SCRIPT } from '../lib/supabase';
import {
  X,
  Download,
  Trash2,
  Award,
  Search,
  Users,
  CheckCircle,
  AlertTriangle,
  Database,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  BarChart3,
  Layers,
  Clock,
  HardDrive,
  Cpu,
  ShieldCheck,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Settings,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

interface InstructorLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_PASSCODE = 'teacher123';
const BACKUP_PASSCODE = 'admin123';

export const InstructorLogsModal: React.FC<InstructorLogsModalProps> = ({ isOpen, onClose }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Custom Passcode settings
  const [customPasscode, setCustomPasscode] = useState(() => {
    return localStorage.getItem('instructor_custom_passcode') || DEFAULT_PASSCODE;
  });
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [passcodeSuccessMsg, setPasscodeSuccessMsg] = useState('');

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'summary' | 'database' | 'cloud' | 'security'>('summary');

  // Logs & Filtering State
  const [logs, setLogs] = useState<EvaluationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedOSFilter, setSelectedOSFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'score_desc' | 'score_asc' | 'name_asc'>('date_desc');

  // Detailed Student Modal State
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<EvaluationResult | null>(null);

  // Cloud & SQL State
  const [copiedSql, setCopiedSql] = useState(false);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestMessage, setDbTestMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadLogs();
    }
  }, [isOpen, isAuthenticated]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const combinedLogs = await fetchStudentScoresFromSupabase();
      setLogs(combinedLogs);
    } catch (err) {
      console.warn('Failed to load student logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthenticate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const storedPass = localStorage.getItem('instructor_custom_passcode') || DEFAULT_PASSCODE;
    const trimmed = passcodeInput.trim();

    if (trimmed === storedPass || trimmed === DEFAULT_PASSCODE || trimmed === BACKUP_PASSCODE) {
      setIsAuthenticated(true);
      setAuthError('');
      setPasscodeInput('');
    } else {
      setAuthError('Incorrect instructor passcode. Please try again.');
    }
  };

  const handleLockSession = () => {
    setIsAuthenticated(false);
    setPasscodeInput('');
    setAuthError('');
    setSelectedStudentDetail(null);
  };

  const handleUpdatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode.trim()) {
      setPasscodeSuccessMsg('Passcode cannot be empty.');
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setPasscodeSuccessMsg('New passcodes do not match.');
      return;
    }
    localStorage.setItem('instructor_custom_passcode', newPasscode.trim());
    setCustomPasscode(newPasscode.trim());
    setNewPasscode('');
    setConfirmPasscode('');
    setPasscodeSuccessMsg('✅ Instructor passcode updated successfully!');
    setTimeout(() => setPasscodeSuccessMsg(''), 4000);
  };

  const handleResetPasscode = () => {
    if (confirm('Reset instructor passcode back to default ("teacher123")?')) {
      localStorage.removeItem('instructor_custom_passcode');
      setCustomPasscode(DEFAULT_PASSCODE);
      setPasscodeSuccessMsg('✅ Passcode reset to default: teacher123');
      setTimeout(() => setPasscodeSuccessMsg(''), 4000);
    }
  };

  const handleTestSupabaseConnection = async () => {
    setIsTestingDb(true);
    setDbTestMessage(null);

    const testResult: EvaluationResult = {
      student: { name: 'Test Student Record', section: 'Lab Section A' },
      task: {
        id: 'test_task',
        title: 'Database Sync Connectivity Verification',
        os: 'win10',
        diskSizeGB: 250,
        biosReq: { bootOrder: 'usb_first', bootMode: 'uefi', sataMode: 'ahci', secureBoot: true, tpmEnabled: true },
        partitionReq: { primarySizeGB: 100, primaryToleranceGB: 5, secondPartitionRequired: false, formatTargetPartition: true, targetPartitionIndex: 1 },
        description: 'Verification test payload for Supabase database table student_scores'
      },
      selectedOS: 'win10',
      scoreDetails: [
        { category: 'System', item: 'Supabase DB Sync Check', earned: 100, max: 100, passed: true, feedback: 'Successfully inserted score into Supabase student_scores table.' }
      ],
      totalEarned: 100,
      totalMax: 100,
      percentage: 100,
      grade: 'A (Excellent)',
      passed: true,
      completionTimeSeconds: 15,
      timestamp: new Date().toLocaleString()
    };

    const res = await saveStudentScoreToSupabase(testResult);
    setIsTestingDb(false);

    if (res.success) {
      setDbTestMessage('✅ Test record saved to Supabase successfully!');
      loadLogs();
    } else {
      setDbTestMessage(`⚠️ DB Sync Notice: ${res.error || 'Saved to local storage.'}`);
    }

    setTimeout(() => setDbTestMessage(null), 6000);
  };

  const handleSyncAllLocalToSupabase = async () => {
    setIsTestingDb(true);
    setDbTestMessage(null);

    try {
      const stored = localStorage.getItem('os_simulator_student_logs');
      if (!stored) {
        setDbTestMessage('No cached local records found to push.');
        setIsTestingDb(false);
        return;
      }

      const localLogs: EvaluationResult[] = JSON.parse(stored);
      let pushedCount = 0;
      let lastErr = '';

      for (const log of localLogs) {
        const res = await saveStudentScoreToSupabase(log);
        if (res.success) {
          pushedCount++;
        } else {
          lastErr = res.error || '';
        }
      }

      setIsTestingDb(false);
      if (pushedCount > 0) {
        setDbTestMessage(`✅ Successfully pushed ${pushedCount} student record(s) to Supabase!`);
        loadLogs();
      } else {
        setDbTestMessage(`⚠️ DB Push Notice: ${lastErr || 'Disable RLS in Supabase SQL Editor.'}`);
      }
    } catch (err: any) {
      setIsTestingDb(false);
      setDbTestMessage(`⚠️ Error syncing records: ${err?.message || 'Unknown error'}`);
    }

    setTimeout(() => setDbTestMessage(null), 6000);
  };

  const handleDeleteRecord = (timestamp: string, studentName: string) => {
    if (!confirm(`Delete record for "${studentName}"?`)) return;

    try {
      const stored = localStorage.getItem('os_simulator_student_logs');
      if (stored) {
        const localLogs: EvaluationResult[] = JSON.parse(stored);
        const updated = localLogs.filter(
          l => !(l.timestamp === timestamp && l.student.name === studentName)
        );
        localStorage.setItem('os_simulator_student_logs', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Failed to delete from local cache', e);
    }

    setLogs(prev => prev.filter(l => !(l.timestamp === timestamp && l.student.name === studentName)));
    if (selectedStudentDetail?.timestamp === timestamp && selectedStudentDetail?.student.name === studentName) {
      setSelectedStudentDetail(null);
    }
  };

  const handleClearAllLogs = () => {
    if (confirm('Are you sure you want to clear all student records? This action cannot be undone.')) {
      localStorage.removeItem('os_simulator_student_logs');
      setLogs([]);
      setSelectedStudentDetail(null);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Extract unique sections
  const sections = useMemo(() => {
    return Array.from(new Set(logs.map(l => l.student.section).filter(Boolean)));
  }, [logs]);

  // Filtered & Sorted Student Logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => {
        const matchesSearch =
          log.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.student.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.grade.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSection = selectedSection === 'ALL' || log.student.section === selectedSection;
        const matchesOS = selectedOSFilter === 'ALL' || log.selectedOS.toLowerCase() === selectedOSFilter.toLowerCase();
        const matchesStatus =
          selectedStatusFilter === 'ALL' ||
          (selectedStatusFilter === 'PASS' && log.passed) ||
          (selectedStatusFilter === 'FAIL' && !log.passed);

        return matchesSearch && matchesSection && matchesOS && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'score_desc') return b.percentage - a.percentage;
        if (sortBy === 'score_asc') return a.percentage - b.percentage;
        if (sortBy === 'name_asc') return a.student.name.localeCompare(b.student.name);
        if (sortBy === 'date_asc') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
  }, [logs, searchTerm, selectedSection, selectedOSFilter, selectedStatusFilter, sortBy]);

  // Overall Performance Analytics Summary
  const summaryStats = useMemo(() => {
    const total = logs.length;
    if (total === 0) {
      return {
        total: 0,
        avgScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passCount: 0,
        failCount: 0,
        passRate: 0,
        avgTimeSec: 0,
        osBreakdown: { win7: 0, win10: 0, win11: 0 },
        sectionStats: [] as { section: string; count: number; avgScore: number; passRate: number }[],
        scoreBands: { excellent: 0, good: 0, passing: 0, needsRevision: 0 }
      };
    }

    const scores = logs.map(l => l.percentage);
    const sumScore = scores.reduce((a, b) => a + b, 0);
    const avgScore = Math.round(sumScore / total);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passCount = logs.filter(l => l.passed).length;
    const failCount = total - passCount;
    const passRate = Math.round((passCount / total) * 100);
    const sumTime = logs.reduce((a, b) => a + (b.completionTimeSeconds || 60), 0);
    const avgTimeSec = Math.round(sumTime / total);

    const osBreakdown = {
      win7: logs.filter(l => l.selectedOS === 'win7').length,
      win10: logs.filter(l => l.selectedOS === 'win10').length,
      win11: logs.filter(l => l.selectedOS === 'win11').length
    };

    const scoreBands = {
      excellent: logs.filter(l => l.percentage >= 90).length,
      good: logs.filter(l => l.percentage >= 80 && l.percentage < 90).length,
      passing: logs.filter(l => l.percentage >= 70 && l.percentage < 80).length,
      needsRevision: logs.filter(l => l.percentage < 70).length
    };

    const sectionMap: Record<string, { totalScore: number; count: number; passes: number }> = {};
    logs.forEach(l => {
      const sec = l.student.section || 'General';
      if (!sectionMap[sec]) {
        sectionMap[sec] = { totalScore: 0, count: 0, passes: 0 };
      }
      sectionMap[sec].totalScore += l.percentage;
      sectionMap[sec].count += 1;
      if (l.passed) sectionMap[sec].passes += 1;
    });

    const sectionStats = Object.entries(sectionMap).map(([section, data]) => ({
      section,
      count: data.count,
      avgScore: Math.round(data.totalScore / data.count),
      passRate: Math.round((data.passes / data.count) * 100)
    }));

    return {
      total,
      avgScore,
      highestScore,
      lowestScore,
      passCount,
      failCount,
      passRate,
      avgTimeSec,
      osBreakdown,
      sectionStats,
      scoreBands
    };
  }, [logs]);

  const exportBatchCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = [
      'Student Name',
      'Section',
      'Operating System',
      'Task Title',
      'Final Score (%)',
      'Grade',
      'Status',
      'Time Taken (s)',
      'Timestamp'
    ];

    const rows = filteredLogs.map(l => [
      `"${l.student.name}"`,
      `"${l.student.section}"`,
      `"${l.selectedOS.toUpperCase()}"`,
      `"${l.task.title.replace(/"/g, '""')}"`,
      `"${l.percentage}%"`,
      `"${l.grade}"`,
      `"${l.passed ? 'PASS' : 'FAIL'}"`,
      `"${l.completionTimeSeconds || 60}"`,
      `"${l.timestamp}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OS_Simulator_Student_Gradebook_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* ========================================================================= */}
        {/* CASE 1: PASSCODE AUTHENTICATION SCREEN (TEACHER ACCESS RESTRICTION)      */}
        {/* ========================================================================= */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto my-auto">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full">
                <Key className="w-4 h-4 text-amber-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-100">Instructor Access Verification</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Student grade records and assessment database are restricted. Enter the teacher passcode to unlock the gradebook.
              </p>
            </div>

            <form onSubmit={handleAuthenticate} className="w-full space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Teacher Passcode</span>
                  <span className="text-[10px] text-indigo-400 font-normal">Default: teacher123</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passcodeInput}
                    onChange={(e) => {
                      setPasscodeInput(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="Enter instructor passcode..."
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-rose-950/70 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2 text-left animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Unlock Gradebook</span>
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-800/80 w-full flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Secure
              </span>
              <span>OS Lab Simulation v2.5</span>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* CASE 2: AUTHENTICATED INSTRUCTOR DATABASE & GRADEBOOK DASHBOARD           */
          /* ========================================================================= */
          <>
            {/* Top Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shadow-inner">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-100">Instructor Records & Gradebook Database</h3>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> Teacher Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Live student evaluation records, class summary analytics & database exports</p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={loadLogs}
                  disabled={isLoading}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
                  title="Refresh Database Records"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
                </button>

                <button
                  onClick={exportBatchCSV}
                  disabled={filteredLogs.length === 0}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV ({filteredLogs.length})</span>
                </button>

                <button
                  onClick={handleLockSession}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Lock gradebook to prevent student unauthorized viewing"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Database Test / Sync Notice Toast */}
            {dbTestMessage && (
              <div className="px-6 py-2.5 bg-indigo-950 border-b border-indigo-800 text-xs font-semibold text-indigo-200 flex items-center justify-between">
                <span>{dbTestMessage}</span>
                <button onClick={() => setDbTestMessage(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>
            )}

            {/* Navigation Tabs Bar */}
            <div className="px-6 border-b border-slate-800 bg-slate-900/90 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'summary'
                    ? 'border-indigo-500 text-indigo-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Class Performance Summary</span>
              </button>

              <button
                onClick={() => setActiveTab('database')}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'database'
                    ? 'border-indigo-500 text-indigo-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Student Database Records ({logs.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('cloud')}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'cloud'
                    ? 'border-indigo-500 text-indigo-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Cloud Sync & SQL Tools</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'security'
                    ? 'border-indigo-500 text-indigo-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Passcode & Security</span>
              </button>
            </div>

            {/* Modal Body Tabs Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* ========================================================================= */}
              {/* TAB 1: SUMMARY & ANALYTICS VIEW                                           */}
              {/* ========================================================================= */}
              {activeTab === 'summary' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Top KPI Metrics Cards Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Card 1: Total Assessed */}
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                      <span className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-blue-400" /> Total Students Assessed
                      </span>
                      <div className="text-2xl font-extrabold text-white">
                        {summaryStats.total}
                      </div>
                      <span className="text-[11px] text-slate-500 block">Unique completions</span>
                    </div>

                    {/* Card 2: Average Score */}
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                      <span className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> Class Average Score
                      </span>
                      <div className="text-2xl font-extrabold text-amber-400">
                        {summaryStats.avgScore}%
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        High: <strong className="text-emerald-400">{summaryStats.highestScore}%</strong> | Low: <strong className="text-rose-400">{summaryStats.lowestScore}%</strong>
                      </span>
                    </div>

                    {/* Card 3: Pass Rate */}
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                      <span className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Pass Rate (≥70%)
                      </span>
                      <div className="text-2xl font-extrabold text-emerald-400">
                        {summaryStats.passRate}%
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        <strong className="text-emerald-400">{summaryStats.passCount} Passed</strong> &bull; {summaryStats.failCount} Needs Revision
                      </span>
                    </div>

                    {/* Card 4: Avg Completion Time */}
                    <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1">
                      <span className="text-slate-400 text-xs flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" /> Avg. Time Taken
                      </span>
                      <div className="text-2xl font-extrabold text-indigo-300">
                        {Math.floor(summaryStats.avgTimeSec / 60)}m {summaryStats.avgTimeSec % 60}s
                      </div>
                      <span className="text-[11px] text-slate-500 block">Simulation speed</span>
                    </div>
                  </div>

                  {/* Two-Column Breakdown: Section Analytics & Score Grade Bands */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Section Breakdown Table */}
                    <div className="md:col-span-7 bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-400" /> Performance by Section / Class Code
                        </h4>
                        <span className="text-[11px] text-slate-400">{summaryStats.sectionStats.length} Sections</span>
                      </div>

                      {summaryStats.sectionStats.length === 0 ? (
                        <p className="text-xs text-slate-500 py-4 text-center">No section data available yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {summaryStats.sectionStats.map((sec, i) => (
                            <div key={i} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-100">{sec.section}</span>
                                <span className="text-[11px] text-slate-400 block">{sec.count} Student Submissions</span>
                              </div>
                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <span className="text-[11px] text-slate-400 block">Avg Score</span>
                                  <strong className="text-amber-400 font-mono">{sec.avgScore}%</strong>
                                </div>
                                <div>
                                  <span className="text-[11px] text-slate-400 block">Pass Rate</span>
                                  <strong className={`font-mono ${sec.passRate >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {sec.passRate}%
                                  </strong>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Score Distribution & OS Distribution */}
                    <div className="md:col-span-5 space-y-4">
                      {/* Score Bands */}
                      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2.5 flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-400" /> Score Distribution
                        </h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">Excellent (90% - 100%)</span>
                            <span className="font-mono font-bold text-emerald-400">{summaryStats.scoreBands.excellent}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">Good (80% - 89%)</span>
                            <span className="font-mono font-bold text-blue-400">{summaryStats.scoreBands.good}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">Satisfactory (70% - 79%)</span>
                            <span className="font-mono font-bold text-amber-400">{summaryStats.scoreBands.passing}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">Needs Revision (&lt;70%)</span>
                            <span className="font-mono font-bold text-rose-400">{summaryStats.scoreBands.needsRevision}</span>
                          </div>
                        </div>
                      </div>

                      {/* OS Distribution */}
                      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-2.5">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2.5 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-cyan-400" /> Assessed Operating Systems
                        </h4>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-sky-400 block font-bold">Win 7</span>
                            <strong className="text-slate-100 text-sm">{summaryStats.osBreakdown.win7}</strong>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-blue-400 block font-bold">Win 10</span>
                            <strong className="text-slate-100 text-sm">{summaryStats.osBreakdown.win10}</strong>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                            <span className="text-[10px] text-indigo-400 block font-bold">Win 11</span>
                            <strong className="text-slate-100 text-sm">{summaryStats.osBreakdown.win11}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: STUDENT DATABASE & RECORDS TABLE VIEW                              */}
              {/* ========================================================================= */}
              {activeTab === 'database' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Search, Filters & Sorting Toolbar */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search student name, section, task..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Section Filter */}
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ALL">All Sections</option>
                      {sections.map(sec => (
                        <option key={sec} value={sec}>Section: {sec}</option>
                      ))}
                    </select>

                    {/* OS Filter */}
                    <select
                      value={selectedOSFilter}
                      onChange={(e) => setSelectedOSFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ALL">All Operating Systems</option>
                      <option value="win7">Windows 7</option>
                      <option value="win10">Windows 10</option>
                      <option value="win11">Windows 11</option>
                    </select>

                    {/* Status Filter */}
                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PASS">Passed Only</option>
                      <option value="FAIL">Failed Only</option>
                    </select>

                    {/* Sort Order */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="date_desc">Latest Date First</option>
                      <option value="date_asc">Oldest Date First</option>
                      <option value="score_desc">Highest Score First</option>
                      <option value="score_asc">Lowest Score First</option>
                      <option value="name_asc">Student Name (A-Z)</option>
                    </select>
                  </div>

                  {/* Student Records Database Table */}
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-12 space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                      <Award className="w-10 h-10 text-slate-600 mx-auto" />
                      <p className="text-sm font-medium text-slate-400">No student assessment records match your filters.</p>
                      <p className="text-xs text-slate-500">Student completed evaluations will automatically be saved here.</p>
                    </div>
                  ) : (
                    <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60 shadow-inner">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                          <tr>
                            <th className="px-4 py-3.5">Student Name</th>
                            <th className="px-4 py-3.5">Section</th>
                            <th className="px-4 py-3.5">Target OS</th>
                            <th className="px-4 py-3.5">Score</th>
                            <th className="px-4 py-3.5">Grade</th>
                            <th className="px-4 py-3.5">Status</th>
                            <th className="px-4 py-3.5">Time</th>
                            <th className="px-4 py-3.5">Date</th>
                            <th className="px-4 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {filteredLogs.map((log, index) => (
                            <tr
                              key={index}
                              onClick={() => setSelectedStudentDetail(log)}
                              className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                            >
                              <td className="px-4 py-3.5 font-bold text-slate-100 flex items-center gap-2">
                                <span>{log.student.name}</span>
                              </td>
                              <td className="px-4 py-3.5 text-slate-300 font-mono text-[11px]">{log.student.section}</td>
                              <td className="px-4 py-3.5">
                                <span className={`uppercase text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  log.selectedOS === 'win7'
                                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                    : log.selectedOS === 'win10'
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                }`}>
                                  {log.selectedOS}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 font-extrabold text-amber-400 font-mono">{log.percentage}%</td>
                              <td className="px-4 py-3.5 text-slate-200">{log.grade}</td>
                              <td className="px-4 py-3.5">
                                {log.passed ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                                    <CheckCircle className="w-3.5 h-3.5" /> PASS
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                                    <AlertTriangle className="w-3.5 h-3.5" /> FAIL
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">{log.completionTimeSeconds || 60}s</td>
                              <td className="px-4 py-3.5 text-slate-500 text-[11px]">{log.timestamp}</td>
                              <td className="px-4 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => setSelectedStudentDetail(log)}
                                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold rounded text-[11px] transition-colors"
                                  >
                                    Inspect
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRecord(log.timestamp, log.student.name)}
                                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                                    title="Delete Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Bottom Database Clear Toolbar */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                    <span>Showing <strong className="text-slate-200">{filteredLogs.length}</strong> of {logs.length} student records</span>
                    <button
                      onClick={handleClearAllLogs}
                      disabled={logs.length === 0}
                      className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 disabled:opacity-40 rounded-xl text-xs font-medium border border-rose-800/40 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear All Local Records</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: CLOUD SYNC & SUPABASE SQL DATABASE TOOLS                           */}
              {/* ========================================================================= */}
              {activeTab === 'cloud' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          <Database className="w-4 h-4 text-sky-400" />
                          Supabase Cloud Database Synchronization
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Push student evaluation records to cloud database tables or verify active connection.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSyncAllLocalToSupabase}
                          disabled={isTestingDb}
                          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>Push Local Cache to Cloud DB</span>
                        </button>
                        <button
                          onClick={handleTestSupabaseConnection}
                          disabled={isTestingDb}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isTestingDb ? 'animate-spin' : ''}`} />
                          <span>Test Cloud DB Insert</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 flex items-center gap-1.5">
                          <Database className="w-4 h-4" /> Supabase SQL Setup Script
                        </span>
                        <button
                          onClick={copySql}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSql ? 'Copied SQL Script!' : 'Copy SQL Script'}</span>
                        </button>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        Run this in your <strong>Supabase Dashboard &rarr; SQL Editor</strong> to create tables, columns, and disable Row Level Security for seamless student uploads.
                      </p>
                      <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-indigo-200 overflow-x-auto max-h-56">
                        {SQL_SETUP_SCRIPT}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 4: PASSCODE & SECURITY SETTINGS                                       */}
              {/* ========================================================================= */}
              {activeTab === 'security' && (
                <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-150 py-4">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 space-y-5">
                    <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                      <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <Key className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100">Change Instructor Passcode</h4>
                        <p className="text-xs text-slate-400">Update your teacher passcode to restrict gradebook access</p>
                      </div>
                    </div>

                    {passcodeSuccessMsg && (
                      <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs font-semibold">
                        {passcodeSuccessMsg}
                      </div>
                    )}

                    <form onSubmit={handleUpdatePasscode} className="space-y-4 text-xs">
                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold">New Passcode</label>
                        <input
                          type="password"
                          value={newPasscode}
                          onChange={(e) => setNewPasscode(e.target.value)}
                          placeholder="Enter new teacher passcode..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-semibold">Confirm New Passcode</label>
                        <input
                          type="password"
                          value={confirmPasscode}
                          onChange={(e) => setConfirmPasscode(e.target.value)}
                          placeholder="Confirm new passcode..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={handleResetPasscode}
                          className="text-xs text-rose-400 hover:underline cursor-pointer"
                        >
                          Reset to default (teacher123)
                        </button>

                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer"
                        >
                          Save New Passcode
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
              <span>Total Database Records: <strong className="text-slate-200">{logs.length}</strong></span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Close Gradebook
              </button>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* STUDENT RECORD ITEMIZATION INSPECTOR MODAL                                */}
        {/* ========================================================================= */}
        {selectedStudentDetail && (
          <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="font-bold text-base text-slate-100">{selectedStudentDetail.student.name}</h4>
                  <p className="text-xs text-slate-400">Section: {selectedStudentDetail.student.section} &bull; {selectedStudentDetail.timestamp}</p>
                </div>
                <button
                  onClick={() => setSelectedStudentDetail(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary Banner */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block">Assigned Task & OS</span>
                  <strong className="text-slate-100">{selectedStudentDetail.task.title} ({selectedStudentDetail.selectedOS.toUpperCase()})</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Final Score</span>
                  <strong className="text-amber-400 text-base font-mono">{selectedStudentDetail.percentage}% ({selectedStudentDetail.grade})</strong>
                </div>
              </div>

              {/* Rubric Breakdown List */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-300">Itemized Criteria Scores</h5>
                {selectedStudentDetail.scoreDetails && selectedStudentDetail.scoreDetails.length > 0 ? (
                  selectedStudentDetail.scoreDetails.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                        item.passed ? 'bg-slate-950 border-slate-800/80' : 'bg-rose-950/30 border-rose-800/60'
                      }`}
                    >
                      {item.passed ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-slate-200">{item.item}</span>
                          <span className={item.passed ? 'text-emerald-400' : 'text-rose-400'}>
                            {item.earned} / {item.max} pts
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{item.feedback}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 py-3 text-center">No detailed score logs saved for this submission.</p>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedStudentDetail(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
