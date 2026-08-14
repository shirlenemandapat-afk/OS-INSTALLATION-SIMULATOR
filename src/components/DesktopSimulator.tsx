import React, { useState, useEffect } from 'react';
import { OSType, StudentInfo, TaskRequirement, SimulationState, EvaluationResult } from '../types';
import { evaluateStudentConfig, exportToCSV } from '../data/tasks';
import { saveStudentScoreToSupabase } from '../lib/supabase';
import { 
  RotateCcw, Power, Terminal, Folder, Globe, Monitor, HelpCircle, 
  ArrowLeft, Award, Download, CheckCircle2, AlertTriangle, HardDrive, 
  Database, ShieldCheck, X, Minimize2, Cpu
} from 'lucide-react';

interface DesktopSimulatorProps {
  os: OSType;
  student: StudentInfo;
  task: TaskRequirement;
  simulationState?: SimulationState;
  onRestartComputer: () => void;
  onShutdownComputer: () => void;
  onBackToPortal: () => void;
}

export const DesktopSimulator: React.FC<DesktopSimulatorProps> = ({
  os,
  student,
  task,
  simulationState,
  onRestartComputer,
  onShutdownComputer,
  onBackToPortal
}) => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [activeWindow, setActiveWindow] = useState<'none' | 'this_pc' | 'cmd' | 'sysinfo' | 'rubric'>('none');

  // Terminal state
  const [cmdInput, setCmdInput] = useState('');
  const [cmdLogs, setCmdLogs] = useState<string[]>([
    `Microsoft Windows [Version ${os === 'win7' ? '6.1.7601' : os === 'win10' ? '10.0.19045' : '10.0.22631'}]`,
    `(c) Microsoft Corporation. All rights reserved.`,
    ``,
    `Type 'help' or 'diskpart' or 'systeminfo' to verify installation.`
  ]);

  // Supabase sync status
  const [syncStatus, setSyncStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Compute evaluation result if simulationState exists
  const evaluationResult: EvaluationResult | null = simulationState 
    ? evaluateStudentConfig(simulationState)
    : null;

  // Auto-sync result to Supabase when entering desktop with complete state
  useEffect(() => {
    if (evaluationResult && syncStatus === 'idle') {
      setSyncStatus('saving');
      saveStudentScoreToSupabase(evaluationResult).then((res) => {
        if (res.success) {
          setSyncStatus('saved');
        } else {
          setSyncStatus('error');
        }
      });
    }
  }, [evaluationResult, syncStatus]);

  // Handle Command Prompt input
  const handleCmdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim()) return;

    const cmd = cmdInput.trim().toLowerCase();
    const newLogs = [...cmdLogs, `C:\\Users\\${student.name || 'Student'}> ${cmdInput}`];

    if (cmd === 'cls' || cmd === 'clear') {
      setCmdLogs([]);
      setCmdInput('');
      return;
    } else if (cmd === 'help') {
      newLogs.push('Available commands:');
      newLogs.push('  diskpart   - View disk partitions & volume details');
      newLogs.push('  systeminfo - View OS build, BIOS boot mode, and RAM');
      newLogs.push('  ver        - Display Windows version');
      newLogs.push('  ipconfig   - Display virtual network configuration');
      newLogs.push('  cls        - Clear screen');
    } else if (cmd === 'diskpart') {
      newLogs.push('Microsoft DiskPart version 10.0.19041.1');
      newLogs.push('Disk 0 Online: ' + task.diskSizeGB + ' GB');
      if (simulationState?.partitions && simulationState.partitions.length > 0) {
        simulationState.partitions.forEach((p) => {
          newLogs.push(`  Volume ${p.partitionNumber || 0}   ${p.name}   ${(p.sizeMB / 1024).toFixed(1)} GB   ${p.formatted ? 'NTFS' : 'RAW'}`);
        });
      } else {
        newLogs.push('  No partitions defined. Disk is unallocated.');
      }
    } else if (cmd === 'systeminfo') {
      newLogs.push(`Host Name:           WIN-${os.toUpperCase()}-LABPC`);
      newLogs.push(`OS Name:             Microsoft Windows ${os === 'win7' ? '7 Ultimate' : os === 'win10' ? '10 Pro' : '11 Pro'}`);
      newLogs.push(`Student Name:        ${student.name || 'Anonymous'}`);
      newLogs.push(`Section:             ${student.section || 'N/A'}`);
      newLogs.push(`BIOS Boot Mode:      ${simulationState?.biosConfig.bootMode.toUpperCase() || 'LEGACY'}`);
      newLogs.push(`SATA Mode:           ${simulationState?.biosConfig.sataMode.toUpperCase() || 'AHCI'}`);
      newLogs.push(`Boot Priority USB:   ${simulationState?.biosConfig.bootOrder[0] === 'usb' ? 'OK (1st)' : 'Incorrect'}`);
    } else if (cmd === 'ver') {
      newLogs.push(`Microsoft Windows [Version ${os === 'win7' ? '6.1.7601' : os === 'win10' ? '10.0.19045' : '10.0.22631'}]`);
    } else {
      newLogs.push(`'${cmd}' is not recognized as an internal or external command.`);
    }

    setCmdLogs(newLogs);
    setCmdInput('');
  };

  // Background and UI styles per OS
  const getOsStyles = () => {
    switch (os) {
      case 'win7':
        return {
          bgClass: 'bg-gradient-to-br from-blue-700 via-sky-600 to-indigo-900',
          wallpaperText: 'Windows 7 Ultimate',
          taskbarBg: 'bg-slate-900/85 backdrop-blur-md border-t border-sky-400/40 shadow-2xl',
          startBtn: 'bg-gradient-to-b from-sky-400 to-blue-700 rounded-full p-2 border border-sky-200 shadow-md hover:brightness-110',
          accentColor: 'text-sky-300'
        };
      case 'win10':
        return {
          bgClass: 'bg-gradient-to-tr from-sky-950 via-slate-900 to-blue-900',
          wallpaperText: 'Windows 10 Pro',
          taskbarBg: 'bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 shadow-2xl',
          startBtn: 'p-2 hover:bg-slate-800/80 rounded transition-colors text-sky-400',
          accentColor: 'text-blue-400'
        };
      case 'win11':
        return {
          bgClass: 'bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950',
          wallpaperText: 'Windows 11 Pro',
          taskbarBg: 'bg-slate-900/70 backdrop-blur-2xl border-t border-slate-800/60 shadow-2xl',
          startBtn: 'p-2 hover:bg-slate-800/60 rounded-xl transition-all text-blue-400',
          accentColor: 'text-indigo-400'
        };
    }
  };

  const styles = getOsStyles();

  return (
    <div className={`fixed inset-0 select-none flex flex-col justify-between ${styles.bgClass} text-slate-100 overflow-hidden`}>
      {/* Top Navigation & Status Header */}
      <div className="z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToPortal}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Portal</span>
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <span className="font-semibold text-slate-200">
            Student: <strong className="text-blue-400">{student.name || 'Anonymous'}</strong> ({student.section || 'N/A'})
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">
            OS: <strong className="uppercase text-amber-400">{os}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Supabase status badge */}
          {syncStatus === 'saved' && (
            <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium flex items-center gap-1">
              <Database className="w-3 h-3" /> Score Saved to Supabase
            </span>
          )}

          {evaluationResult && (
            <button
              onClick={() => setActiveWindow('rubric')}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow flex items-center gap-1.5 text-xs transition-all"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Score: {evaluationResult.percentage}% ({evaluationResult.grade})</span>
            </button>
          )}

          <button
            onClick={onRestartComputer}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Simulator (Re-boot Setup)</span>
          </button>
        </div>
      </div>

      {/* Main Desktop Canvas */}
      <div className="flex-1 relative p-8">
        {/* Desktop Icons */}
        <div className="absolute top-8 left-8 flex flex-col gap-6 text-slate-100 text-xs text-center font-medium z-10">
          <div 
            onClick={() => setActiveWindow('this_pc')}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-20 transition-all group"
          >
            <Monitor className="w-9 h-9 text-sky-300 group-hover:scale-110 transition-transform drop-shadow-md" />
            <span className="text-shadow">This PC</span>
          </div>

          <div 
            onClick={() => setActiveWindow('cmd')}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-20 transition-all group"
          >
            <Terminal className="w-9 h-9 text-emerald-400 group-hover:scale-110 transition-transform drop-shadow-md" />
            <span className="text-shadow">Command Prompt</span>
          </div>

          <div 
            onClick={() => setActiveWindow('sysinfo')}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-20 transition-all group"
          >
            <Cpu className="w-9 h-9 text-indigo-400 group-hover:scale-110 transition-transform drop-shadow-md" />
            <span className="text-shadow">System Info</span>
          </div>

          <div 
            onClick={() => setActiveWindow('rubric')}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-20 transition-all group"
          >
            <Award className="w-9 h-9 text-amber-400 group-hover:scale-110 transition-transform drop-shadow-md" />
            <span className="text-shadow">Grade Report</span>
          </div>
        </div>

        {/* Center OS Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="text-center space-y-2">
            <Monitor className="w-24 h-24 mx-auto text-white" />
            <h1 className="text-4xl font-extrabold tracking-widest text-white uppercase">{styles.wallpaperText}</h1>
          </div>
        </div>

        {/* WINDOW 1: THIS PC (FILE EXPLORER) */}
        {activeWindow === 'this_pc' && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-slate-100 z-30 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs font-bold">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-sky-400" />
                <span>This PC - Drive Volume Manager</span>
              </div>
              <button onClick={() => setActiveWindow('none')} className="p-1 hover:bg-rose-500 rounded text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-200 border-b border-slate-800 pb-2">Devices and Drives</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {simulationState?.partitions && simulationState.partitions.filter(p => p.type === 'primary').map((p, idx) => (
                  <div key={p.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3">
                    <HardDrive className="w-8 h-8 text-sky-400 shrink-0" />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100">Local Disk ({idx === 0 ? 'C:' : 'D:'})</span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {p.formatted ? 'NTFS' : 'RAW'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {(p.sizeMB / 1024).toFixed(1)} GB Total Volume
                      </p>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-full w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}

                {(!simulationState?.partitions || simulationState.partitions.filter(p => p.type === 'primary').length === 0) && (
                  <div className="col-span-2 p-6 bg-rose-950/20 border border-rose-900/50 rounded-xl text-center text-rose-300">
                    <p className="font-bold">No Formatted System Volumes Found</p>
                    <p className="text-xs mt-1 text-slate-400">Restart simulator and complete Disk Partitioning in Windows Setup.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WINDOW 2: COMMAND PROMPT */}
        {activeWindow === 'cmd' && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-black border border-slate-800 rounded-xl shadow-2xl text-emerald-400 z-30 font-mono text-xs overflow-hidden">
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800 text-slate-300 font-sans font-bold">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Command Prompt - Windows Terminal</span>
              </div>
              <button onClick={() => setActiveWindow('none')} className="p-1 hover:bg-rose-500 rounded text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 h-64 overflow-y-auto space-y-1">
              {cmdLogs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap">{log}</div>
              ))}
              <form onSubmit={handleCmdSubmit} className="flex items-center gap-2 pt-2">
                <span>C:\Users\{student.name || 'Student'}&gt;</span>
                <input
                  type="text"
                  value={cmdInput}
                  onChange={(e) => setCmdInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-emerald-300 font-mono"
                  autoFocus
                />
              </form>
            </div>
          </div>
        )}

        {/* WINDOW 3: SYSTEM INFORMATION */}
        {activeWindow === 'sysinfo' && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-slate-100 z-30 overflow-hidden">
            <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs font-bold">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>System Information Summary</span>
              </div>
              <button onClick={() => setActiveWindow('none')} className="p-1 hover:bg-rose-500 rounded text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] font-semibold">Student Name</span>
                  <p className="font-bold text-slate-100">{student.name || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] font-semibold">Section</span>
                  <p className="font-bold text-slate-100">{student.section || 'N/A'}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] font-semibold">OS Build</span>
                  <p className="font-bold text-amber-400 uppercase">{os}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] font-semibold">BIOS Boot Mode</span>
                  <p className="font-bold text-blue-400 uppercase">{simulationState?.biosConfig.bootMode || 'Legacy'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WINDOW 4: RUBRIC GRADE REPORT */}
        {activeWindow === 'rubric' && evaluationResult && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl text-slate-100 z-40 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-slate-950 px-6 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-100">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Student Rubric Assessment Report</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportToCSV(evaluationResult)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button onClick={() => setActiveWindow('none')} className="p-1 hover:bg-rose-500 rounded text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-white">{evaluationResult.percentage}% Overall Score</h3>
                  <p className="text-slate-400">Grade: <strong className="text-amber-400">{evaluationResult.grade}</strong></p>
                </div>
                <span className={`px-4 py-1.5 rounded-full font-bold text-xs ${
                  evaluationResult.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {evaluationResult.passed ? 'PASSED' : 'NEEDS REVISION'}
                </span>
              </div>

              <div className="space-y-2">
                {evaluationResult.scoreDetails.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-200">{item.item}</h4>
                      <p className="text-slate-400 text-[11px] mt-0.5">{item.feedback}</p>
                    </div>
                    <span className="font-bold text-amber-400 shrink-0 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {item.earned}/{item.max} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Start Menu Popup */}
        {startMenuOpen && (
          <div className={`absolute bottom-16 ${os === 'win11' ? 'left-1/2 -translate-x-1/2' : 'left-4'} w-80 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-100 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white">
                  {student.name ? student.name.charAt(0) : 'S'}
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-100">{student.name || 'Student'}</h4>
                  <p className="text-[10px] text-slate-400">{student.section || 'Lab Section'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div 
                onClick={() => { setActiveWindow('this_pc'); setStartMenuOpen(false); }}
                className="p-2 hover:bg-slate-800 rounded-lg flex items-center gap-2.5 cursor-pointer text-slate-300"
              >
                <Monitor className="w-4 h-4 text-sky-400" /> This PC
              </div>
              <div 
                onClick={() => { setActiveWindow('cmd'); setStartMenuOpen(false); }}
                className="p-2 hover:bg-slate-800 rounded-lg flex items-center gap-2.5 cursor-pointer text-slate-300"
              >
                <Terminal className="w-4 h-4 text-emerald-400" /> Command Prompt
              </div>
              <div 
                onClick={() => { setActiveWindow('sysinfo'); setStartMenuOpen(false); }}
                className="p-2 hover:bg-slate-800 rounded-lg flex items-center gap-2.5 cursor-pointer text-slate-300"
              >
                <Cpu className="w-4 h-4 text-indigo-400" /> System Information
              </div>
              <div 
                onClick={() => { setActiveWindow('rubric'); setStartMenuOpen(false); }}
                className="p-2 hover:bg-slate-800 rounded-lg flex items-center gap-2.5 cursor-pointer text-slate-300"
              >
                <Award className="w-4 h-4 text-amber-400" /> Rubric Grade Report
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">Power:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onShutdownComputer}
                  className="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-700/60 text-rose-200 rounded-lg font-semibold text-xs flex items-center gap-1 transition-all shadow"
                >
                  <Power className="w-3.5 h-3.5 text-rose-400" /> Shut Down
                </button>
                <button
                  onClick={onRestartComputer}
                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1 transition-all shadow"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Taskbar */}
      <div className={`h-12 ${styles.taskbarBg} px-4 flex items-center justify-between relative z-40`}>
        <div className={`flex items-center gap-2 ${os === 'win11' ? 'mx-auto' : ''}`}>
          <button
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            className={styles.startBtn}
            title="Start Menu"
          >
            <Monitor className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1 text-slate-300">
            <div onClick={() => setActiveWindow('this_pc')} className="p-2 hover:bg-white/10 rounded-lg cursor-pointer">
              <Folder className="w-4 h-4 text-amber-300" />
            </div>
            <div onClick={() => setActiveWindow('cmd')} className="p-2 hover:bg-white/10 rounded-lg cursor-pointer">
              <Terminal className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {os !== 'win11' && (
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <button
              onClick={onShutdownComputer}
              className="p-1.5 hover:bg-rose-950/80 text-rose-400 rounded-lg flex items-center gap-1 cursor-pointer"
              title="Shut Down Computer"
            >
              <Power className="w-4 h-4" />
            </button>
            <button
              onClick={onRestartComputer}
              className="p-1.5 hover:bg-amber-950/80 text-amber-400 rounded-lg flex items-center gap-1 cursor-pointer"
              title="Restart Computer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="pl-2 border-l border-slate-700">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}
      </div>
    </div>
  );
};
