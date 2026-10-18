import React, { useState, useEffect, useMemo } from 'react';
import { TeacherAccount, EvaluationResult } from '../types';
import { fetchStudentScoresFromSupabase } from '../lib/supabase';
import {
  Briefcase,
  Users,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  LogOut,
  Monitor,
  ExternalLink,
  ChevronRight,
  Shield,
  FileSpreadsheet,
  Cpu,
  HardDrive,
  Check,
  AlertCircle,
  HelpCircle,
  School,
  IdCard,
  X,
  FolderArchive,
  Trash2,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

interface TeacherDashboardProps {
  teacher: TeacherAccount;
  onLogout: () => void;
  onLaunchSimulator: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  onLogout,
  onLaunchSimulator
}) => {
  const [logs, setLogs] = useState<EvaluationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewScope, setViewScope] = useState<'my_students' | 'all'>('my_students');
  const [archiveFilter, setArchiveFilter] = useState<'active' | 'archived'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');
  const [selectedOS, setSelectedOS] = useState<'ALL' | 'win7' | 'win10' | 'win11'>('ALL');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<EvaluationResult | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<EvaluationResult | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await fetchStudentScoresFromSupabase();

      // Read archived and deleted keys from local storage
      let archivedKeys: string[] = [];
      let deletedKeys: string[] = [];
      try {
        const storedArchived = localStorage.getItem('depedqc_archived_record_ids');
        if (storedArchived) archivedKeys = JSON.parse(storedArchived);
        const storedDeleted = localStorage.getItem('depedqc_deleted_record_ids');
        if (storedDeleted) deletedKeys = JSON.parse(storedDeleted);
      } catch (e) {
        console.warn(e);
      }

      // Filter deleted records and tag archived ones
      const processed = records
        .filter((r) => {
          const key = r.id || `${r.student.name}_${r.student.studentId || 'st'}_${r.timestamp}`;
          return !deletedKeys.includes(key);
        })
        .map((r) => {
          const key = r.id || `${r.student.name}_${r.student.studentId || 'st'}_${r.timestamp}`;
          return {
            ...r,
            archived: archivedKeys.includes(key) || Boolean(r.archived)
          };
        });

      setLogs(processed);
    } catch (e) {
      console.warn('Failed to load student scores:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleToggleArchive = (record: EvaluationResult, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const recordKey = record.id || `${record.student.name}_${record.student.studentId || 'st'}_${record.timestamp}`;
    const isCurrentlyArchived = Boolean(record.archived);

    let archivedKeys: string[] = [];
    try {
      const stored = localStorage.getItem('depedqc_archived_record_ids');
      if (stored) archivedKeys = JSON.parse(stored);
    } catch (err) {
      console.warn(err);
    }

    let updatedArchivedKeys: string[];
    if (isCurrentlyArchived) {
      updatedArchivedKeys = archivedKeys.filter((k) => k !== recordKey);
    } else {
      updatedArchivedKeys = [...archivedKeys, recordKey];
    }

    try {
      localStorage.setItem('depedqc_archived_record_ids', JSON.stringify(updatedArchivedKeys));
    } catch (err) {
      console.warn(err);
    }

    setLogs((prev) =>
      prev.map((item) => {
        const itemKey = item.id || `${item.student.name}_${item.student.studentId || 'st'}_${item.timestamp}`;
        if (itemKey === recordKey) {
          return { ...item, archived: !isCurrentlyArchived };
        }
        return item;
      })
    );

    if (selectedStudentDetail) {
      const selKey = selectedStudentDetail.id || `${selectedStudentDetail.student.name}_${selectedStudentDetail.student.studentId || 'st'}_${selectedStudentDetail.timestamp}`;
      if (selKey === recordKey) {
        setSelectedStudentDetail({ ...selectedStudentDetail, archived: !isCurrentlyArchived });
      }
    }

    showToast(
      !isCurrentlyArchived
        ? `Archived student record for ${record.student.name}.`
        : `Restored ${record.student.name} to active student list.`
    );
  };

  const handleConfirmDelete = () => {
    if (!recordToDelete) return;

    const recordKey = recordToDelete.id || `${recordToDelete.student.name}_${recordToDelete.student.studentId || 'st'}_${recordToDelete.timestamp}`;
    const studentLrn = (recordToDelete.student.studentId || recordToDelete.student.lrn || '').trim();

    let deletedKeys: string[] = [];
    try {
      const stored = localStorage.getItem('depedqc_deleted_record_ids');
      if (stored) deletedKeys = JSON.parse(stored);
      if (!deletedKeys.includes(recordKey)) {
        deletedKeys.push(recordKey);
        localStorage.setItem('depedqc_deleted_record_ids', JSON.stringify(deletedKeys));
      }
    } catch (err) {
      console.warn(err);
    }

    try {
      const storedLogs = localStorage.getItem('os_simulator_student_logs');
      if (storedLogs) {
        const parsedLogs: EvaluationResult[] = JSON.parse(storedLogs);
        const filtered = parsedLogs.filter((item) => {
          const itemKey = item.id || `${item.student.name}_${item.student.studentId || 'st'}_${item.timestamp}`;
          return itemKey !== recordKey;
        });
        localStorage.setItem('os_simulator_student_logs', JSON.stringify(filtered));
      }
    } catch (err) {
      console.warn(err);
    }

    if (studentLrn) {
      try {
        const storedStudents = localStorage.getItem('depedqc_registered_students');
        if (storedStudents) {
          const parsedStudents = JSON.parse(storedStudents);
          const filteredStudents = parsedStudents.filter((s: any) => s.lrn.toLowerCase() !== studentLrn.toLowerCase());
          localStorage.setItem('depedqc_registered_students', JSON.stringify(filteredStudents));
        }
      } catch (err) {
        console.warn(err);
      }
    }

    setLogs((prev) =>
      prev.filter((item) => {
        const itemKey = item.id || `${item.student.name}_${item.student.studentId || 'st'}_${item.timestamp}`;
        return itemKey !== recordKey;
      })
    );

    if (selectedStudentDetail) {
      const selKey = selectedStudentDetail.id || `${selectedStudentDetail.student.name}_${selectedStudentDetail.student.studentId || 'st'}_${selectedStudentDetail.timestamp}`;
      if (selKey === recordKey) {
        setSelectedStudentDetail(null);
      }
    }

    const name = recordToDelete.student.name;
    setRecordToDelete(null);
    showToast(`Permanently deleted student record for ${name}.`);
  };

  // Add demo assessment under this teacher for immediate verification
  const handleSeedSampleSubmission = () => {
    const sampleRecord: EvaluationResult = {
      student: {
        studentId: '2024-10492',
        firstName: 'Juan',
        middleInitial: 'P.',
        lastName: 'Dela Cruz',
        name: 'Juan P. Dela Cruz',
        section: 'Grade 11 - TVL ICT 1',
        teacherId: teacher.id,
        teacherName: teacher.fullName,
        teacherEmail: teacher.email
      },
      task: {
        id: 'task_sample',
        title: 'Windows 10 UEFI & Custom 150GB Partitioning',
        os: 'win10',
        diskSizeGB: 500,
        biosReq: {
          bootOrder: 'usb_first',
          bootMode: 'uefi',
          sataMode: 'ahci',
          secureBoot: true,
          tpmEnabled: false
        },
        partitionReq: {
          primarySizeGB: 150,
          primaryToleranceGB: 5,
          secondPartitionRequired: true,
          secondPartitionSizeGB: 300,
          formatTargetPartition: true,
          targetPartitionIndex: 1
        },
        description: 'Configure UEFI Boot Mode with Secure Boot ENABLED and SATA AHCI mode. Set UEFI USB as 1st Boot Device. Create a 150 GB System Partition for Windows 10 Pro and a 300 GB Data Partition.'
      },
      selectedOS: 'win10',
      scoreDetails: [
        { category: 'BIOS/UEFI Configuration', item: 'Boot Order Priority (USB 1st)', earned: 10, max: 10, passed: true, feedback: 'Correctly configured USB as the 1st boot device.' },
        { category: 'BIOS/UEFI Configuration', item: 'Boot Mode (UEFI/Legacy)', earned: 10, max: 10, passed: true, feedback: 'UEFI mode correctly set for Windows 10.' },
        { category: 'BIOS/UEFI Configuration', item: 'SATA Controller Mode', earned: 5, max: 5, passed: true, feedback: 'AHCI mode enabled for SATA SSD/HDD.' },
        { category: 'BIOS/UEFI Configuration', item: 'Secure Boot Security', earned: 5, max: 5, passed: true, feedback: 'Secure Boot properly enabled.' },
        { category: 'Disk Partitioning Accuracy', item: 'Target Partition Size (150 GB)', earned: 25, max: 25, passed: true, feedback: 'Exact 153,600 MB (150 GB) created.' },
        { category: 'Disk Partitioning Accuracy', item: 'Secondary Data Partition (300 GB)', earned: 10, max: 10, passed: true, feedback: 'Secondary 300 GB volume created for data.' },
        { category: 'Disk Partitioning Accuracy', item: 'Target Partition Formatted', earned: 5, max: 5, passed: true, feedback: 'Partition formatted successfully before OS setup.' },
        { category: 'OS Selection & Setup', item: 'Windows Version Selection', earned: 10, max: 10, passed: true, feedback: 'Windows 10 Pro edition selected.' },
        { category: 'OS Selection & Setup', item: 'Installation Type', earned: 10, max: 10, passed: true, feedback: 'Clean Custom installation performed.' },
        { category: 'System Workflow & Reboot', item: 'Reboot & Settings Saved', earned: 10, max: 10, passed: true, feedback: 'Saved BIOS configuration with F10.' }
      ],
      totalEarned: 100,
      totalMax: 100,
      percentage: 100,
      grade: 'A',
      passed: true,
      completionTimeSeconds: 245,
      timestamp: new Date().toLocaleString()
    };

    try {
      const existingStr = localStorage.getItem('os_simulator_student_logs');
      const existing: EvaluationResult[] = existingStr ? JSON.parse(existingStr) : [];
      existing.unshift(sampleRecord);
      localStorage.setItem('os_simulator_student_logs', JSON.stringify(existing));
    } catch (e) {
      console.warn(e);
    }

    setLogs((prev) => [sampleRecord, ...prev]);
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((record) => {
      // 0. Archive Status Filter
      const isArchived = Boolean(record.archived);
      if (archiveFilter === 'active' && isArchived) return false;
      if (archiveFilter === 'archived' && !isArchived) return false;

      // 1. Teacher Scope
      if (viewScope === 'my_students') {
        const studentTeacherEmail = (record.student.teacherEmail || '').toLowerCase();
        const studentTeacherName = (record.student.teacherName || '').toLowerCase();
        const myEmail = teacher.email.toLowerCase();
        const myName = teacher.fullName.toLowerCase();

        const isMatch =
          studentTeacherEmail === myEmail ||
          record.student.teacherId === teacher.id ||
          studentTeacherName.includes(myName) ||
          myName.includes(studentTeacherName);

        if (!isMatch) return false;
      }

      // 2. Search Term (Student ID, Name, Section)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesId = (record.student.studentId || '').toLowerCase().includes(term);
        const matchesName = record.student.name.toLowerCase().includes(term);
        const matchesSection = record.student.section.toLowerCase().includes(term);
        if (!matchesId && !matchesName && !matchesSection) return false;
      }

      // 3. Section Filter
      if (selectedSection !== 'ALL') {
        if (record.student.section !== selectedSection) return false;
      }

      // 4. Status Filter
      if (selectedStatus === 'PASS' && !record.passed) return false;
      if (selectedStatus === 'FAIL' && record.passed) return false;

      // 5. OS Filter
      if (selectedOS !== 'ALL' && record.selectedOS !== selectedOS) return false;

      return true;
    });
  }, [logs, viewScope, teacher, searchTerm, selectedSection, selectedStatus, selectedOS]);

  // Unique sections list for filtering
  const uniqueSections = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.student.section) set.add(l.student.section);
    });
    return Array.from(set);
  }, [logs]);

  const activeLogsCount = useMemo(() => {
    return logs.filter((l) => !l.archived).length;
  }, [logs]);

  const archivedLogsCount = useMemo(() => {
    return logs.filter((l) => Boolean(l.archived)).length;
  }, [logs]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredLogs.length;
    if (total === 0) {
      return { total: 0, passed: 0, passRate: 0, avgScore: 0, honors: 0 };
    }
    const passed = filteredLogs.filter((r) => r.passed).length;
    const honors = filteredLogs.filter((r) => r.percentage >= 90).length;
    const totalScore = filteredLogs.reduce((acc, r) => acc + r.percentage, 0);
    const avgScore = Math.round(totalScore / total);
    const passRate = Math.round((passed / total) * 100);

    return { total, passed, passRate, avgScore, honors };
  }, [filteredLogs]);

  // Export to DepEd Formatted CSV
  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = [
      'Student ID',
      'Student Full Name',
      'Year & Section',
      'Assigned Teacher',
      'OS Evaluated',
      'Task Title',
      'Score Earned',
      'Total Max',
      'Percentage (%)',
      'Letter Grade',
      'Assessment Status',
      'Completion Time (Seconds)',
      'Date & Time Completed',
      'Record Status'
    ];

    const rows = filteredLogs.map((r) => [
      `"${r.student.studentId || 'N/A'}"`,
      `"${r.student.name}"`,
      `"${r.student.section}"`,
      `"${r.student.teacherName || teacher.fullName}"`,
      `"${(r.selectedOS || 'win10').toUpperCase()}"`,
      `"${r.task?.title || 'OS Installation Task'}"`,
      r.totalEarned,
      r.totalMax,
      `${r.percentage}%`,
      r.grade,
      r.passed ? 'PASSED' : 'NEEDS IMPROVEMENT',
      r.completionTimeSeconds || 60,
      `"${r.timestamp}"`,
      r.archived ? 'ARCHIVED' : 'ACTIVE'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `DepEdQC_Student_OS_Scores_${teacher.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 text-white font-black text-sm">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                Teacher Dashboard
              </span>
              <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                DepEd QC SDO • TVL Track
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{teacher.fullName}</span>
              <span className="text-xs font-normal text-slate-400">({teacher.email})</span>
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLaunchSimulator}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            title="Launch the OS & BIOS Simulator for classroom demonstration"
          >
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Launch Lab Simulator</span>
          </button>

          <button
            onClick={exportToCSV}
            disabled={filteredLogs.length === 0}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            title="Export grades to CSV / Excel spreadsheet"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-2 bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 text-xs font-semibold rounded-xl border border-slate-700 hover:border-rose-800/60 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Log out of teacher account"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1 space-y-6">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>{archiveFilter === 'active' ? 'Students Evaluated' : 'Archived Records'}</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{stats.total}</p>
            <p className="text-[10px] text-slate-500 font-medium">
              {viewScope === 'my_students' ? 'Assigned to your account' : 'All student records'}
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Class Pass Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className={`text-2xl sm:text-3xl font-black ${stats.passRate >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {stats.passRate}%
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              {stats.passed} of {stats.total} passed (75% passing mark)
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Average Score</span>
              <Award className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {stats.avgScore}%
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Class mean percentage
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>High Honors (90%+)</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-400">
              {stats.honors}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              Excellence mastery level
            </p>
          </div>
        </div>

        {/* Filter & Controls Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* 1. Active vs Archived Records Tab Toggle */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setArchiveFilter('active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    archiveFilter === 'active'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Active Gradebook ({activeLogsCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setArchiveFilter('archived')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    archiveFilter === 'archived'
                      ? 'bg-amber-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FolderArchive className="w-3.5 h-3.5 text-amber-300" />
                  <span>Archived Students ({archivedLogsCount})</span>
                </button>
              </div>

              {/* 2. Scope Toggle: My Students vs All */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewScope('my_students')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewScope === 'my_students'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  My Assigned
                </button>
                <button
                  type="button"
                  onClick={() => setViewScope('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewScope === 'all'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All Records ({logs.length})
                </button>
              </div>
            </div>

            {/* Search Input & Refresh */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search student LRN, name, section..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={loadData}
                disabled={isLoading}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Refresh database records"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Secondary Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filters:
            </span>

            {/* Section Filter */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Sections</option>
              {uniqueSections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PASS">Passed (75% and above)</option>
              <option value="FAIL">Needs Review (Below 75%)</option>
            </select>

            {/* OS Filter */}
            <select
              value={selectedOS}
              onChange={(e) => setSelectedOS(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All OS Targets</option>
              <option value="win10">Windows 10</option>
              <option value="win11">Windows 11</option>
              <option value="win7">Windows 7</option>
            </select>

            <span className="ml-auto text-[11px] text-slate-400">
              Showing <strong>{filteredLogs.length}</strong> of {logs.length} results ({archiveFilter.toUpperCase()})
            </span>
          </div>
        </div>

        {/* Student Results Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 font-bold">LRN Number</th>
                  <th className="py-3.5 px-4 font-bold">Student Full Name</th>
                  <th className="py-3.5 px-4 font-bold">Year & Section</th>
                  <th className="py-3.5 px-4 font-bold">Assigned OS & Task</th>
                  <th className="py-3.5 px-4 font-bold text-center">Score</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold">Date & Time</th>
                  <th className="py-3.5 px-4 font-bold text-right">Teacher Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 px-4 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                          {archiveFilter === 'archived' ? <FolderArchive className="w-6 h-6 text-amber-400" /> : <Users className="w-6 h-6" />}
                        </div>
                        <p className="text-sm font-bold text-white">
                          {archiveFilter === 'archived'
                            ? 'No archived student records found'
                            : `No student results found for ${teacher.fullName}`}
                        </p>
                        <p className="text-xs text-slate-400">
                          {archiveFilter === 'archived'
                            ? 'Archived student records will appear here when you click the Archive action on active students.'
                            : `Students taking the simulation should select "${teacher.fullName}" from the teacher dropdown.`}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((record, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStudentDetail(record)}
                    >
                      {/* LRN Number */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                        <span className="px-2 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[11px] inline-block">
                          {record.student.studentId || `LRN-${idx + 1}`}
                        </span>
                      </td>

                      {/* Student Name */}
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span>{record.student.name}</span>
                          {record.archived && (
                            <span className="text-[9px] bg-amber-950/80 text-amber-400 border border-amber-800/60 px-1.5 py-0.2 rounded uppercase font-bold">
                              ARCHIVED
                            </span>
                          )}
                          {record.percentage === 100 && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded font-mono">
                              ★ 100%
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Year & Section */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {record.student.section || 'General'}
                      </td>

                      {/* Assigned OS & Task */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-sky-400 uppercase text-[10px] px-1.5 py-0.5 bg-sky-950/60 rounded border border-sky-800/60 inline-block">
                            {record.selectedOS}
                          </span>
                          <p className="text-[11px] text-slate-300 line-clamp-1 max-w-xs">
                            {record.task?.title || 'Custom Partitioning'}
                          </p>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-block">
                          <span className={`text-sm font-black ${record.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {record.percentage}%
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {record.totalEarned}/{record.totalMax} pts
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {record.passed ? (
                          <span className="px-2.5 py-1 bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>PASSED</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-rose-950/70 text-rose-400 border border-rose-800/60 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>FAILED</span>
                          </span>
                        )}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {record.timestamp}
                      </td>

                      {/* Teacher Actions (Scorecard, Archive, Delete) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedStudentDetail(record)}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                            title="View Detailed Scorecard"
                          >
                            <span>Scorecard</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {record.archived ? (
                            <button
                              type="button"
                              onClick={(e) => handleToggleArchive(record, e)}
                              className="p-1.5 bg-slate-800 hover:bg-amber-600 text-amber-400 hover:text-white rounded-lg transition-all cursor-pointer border border-amber-500/20"
                              title="Restore to Active Student List"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => handleToggleArchive(record, e)}
                              className="p-1.5 bg-slate-800 hover:bg-amber-600 text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer"
                              title="Archive Student Record"
                            >
                              <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRecordToDelete(record);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition-all cursor-pointer"
                            title="Permanently Delete Student Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* DETAILED STUDENT SCORECARD MODAL */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  DepEd QC Student Evaluation Scorecard
                </span>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>{selectedStudentDetail.student.name}</span>
                  {selectedStudentDetail.archived && (
                    <span className="text-[9px] bg-amber-950/80 text-amber-400 border border-amber-800 px-1.5 py-0.2 rounded font-bold">
                      ARCHIVED
                    </span>
                  )}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="p-1.5 hover:bg-rose-500 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Student Summary Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">LRN Number</span>
                  <p className="font-mono font-bold text-slate-200">
                    {selectedStudentDetail.student.studentId || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Year & Section</span>
                  <p className="font-bold text-slate-200">
                    {selectedStudentDetail.student.section || 'General'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Assigned Teacher</span>
                  <p className="font-bold text-slate-200 truncate">
                    {selectedStudentDetail.student.teacherName || teacher.fullName}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase">Overall Grade</span>
                  <p className={`font-black text-sm ${selectedStudentDetail.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {selectedStudentDetail.percentage}% ({selectedStudentDetail.grade})
                  </p>
                </div>
              </div>

              {/* Task Details */}
              <div className="p-3 bg-indigo-950/30 border border-indigo-900/50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-indigo-300">
                  Assigned Operating System Task:
                </span>
                <p className="font-semibold text-slate-200">{selectedStudentDetail.task?.title}</p>
                <p className="text-[11px] text-slate-400">{selectedStudentDetail.task?.description}</p>
              </div>

              {/* Detailed Rubric Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Criterion-by-Criterion Evaluation (100 Points Total)
                </span>

                <div className="space-y-2">
                  {selectedStudentDetail.scoreDetails && selectedStudentDetail.scoreDetails.length > 0 ? (
                    selectedStudentDetail.scoreDetails.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-start justify-between gap-3 ${
                          item.passed
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                            : 'bg-rose-950/20 border-rose-800/40 text-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 font-bold text-xs">
                            {item.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                            <span className="text-white">{item.item}</span>
                            <span className="text-[10px] text-slate-400">({item.category})</span>
                          </div>
                          <p className="text-[11px] text-slate-400 pl-5">{item.feedback}</p>
                        </div>
                        <span className={`font-bold font-mono shrink-0 ${item.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.earned}/{item.max} pts
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs italic">
                      No itemized rubric breakdown recorded for this submission.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer with Archive & Delete Actions */}
            <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                Submitted: {selectedStudentDetail.timestamp}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleArchive(selectedStudentDetail)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-amber-600 text-amber-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {selectedStudentDetail.archived ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore to Active</span>
                    </>
                  ) : (
                    <>
                      <FolderArchive className="w-3.5 h-3.5" />
                      <span>Archive Record</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const sel = selectedStudentDetail;
                    setSelectedStudentDetail(null);
                    setRecordToDelete(sel);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStudentDetail(null)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-rose-800/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Delete Student Record</h3>
                <p className="text-xs text-rose-300 font-medium">Permanent Action Warning</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Student Name:</span>
                <span className="font-bold text-white">{recordToDelete.student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">LRN Number:</span>
                <span className="font-mono text-slate-200">{recordToDelete.student.studentId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Year & Section:</span>
                <span className="text-slate-300">{recordToDelete.student.section || 'General'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Evaluation Grade:</span>
                <span className={`font-bold ${recordToDelete.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {recordToDelete.percentage}% ({recordToDelete.passed ? 'Passed' : 'Needs Work'})
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete this student's assessment record and registration from your gradebook? This action cannot be undone.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRecordToDelete(null)}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <p>DepEd Quezon City • Senior High School TVL Track • Assessment Records</p>
      </footer>
    </div>
  );
};
