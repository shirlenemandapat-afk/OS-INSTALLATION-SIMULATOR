import React, { useState, useEffect } from 'react';
import { StudentInfo, OSType, TaskRequirement } from '../types';
import { getTaskForStudent, DEFAULT_RUBRICS } from '../data/tasks';
import { Monitor, User, Layers, FileText, ArrowRight, ShieldCheck, Cpu, HardDrive, CheckCircle2, History, AlertCircle } from 'lucide-react';

interface StudentPortalProps {
  onStartSimulator: (student: StudentInfo, os: OSType, task: TaskRequirement) => void;
  onOpenInstructorLogs: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ onStartSimulator, onOpenInstructorLogs }) => {
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [selectedOS, setSelectedOS] = useState<OSType>('win10');
  const [currentTask, setCurrentTask] = useState<TaskRequirement>(() => getTaskForStudent('', '', 'win10'));
  const [errorMsg, setErrorMsg] = useState('');

  // Re-calculate generated task when student updates name/section/OS
  useEffect(() => {
    const task = getTaskForStudent(name, section, selectedOS);
    setCurrentTask(task);
  }, [name, section, selectedOS]);

  const handleStart = (os: OSType) => {
    if (!name.trim()) {
      setErrorMsg('Please enter your Student Full Name before starting.');
      return;
    }
    if (!section.trim()) {
      setErrorMsg('Please enter your Section / Class Code before starting.');
      return;
    }
    setErrorMsg('');
    const task = getTaskForStudent(name, section, os);
    onStartSimulator({ name: name.trim(), section: section.trim() }, os, task);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Banner Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg text-white">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
              OS Installation & BIOS Simulator
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v2.5 Lab Edition
              </span>
            </h1>
            <p className="text-xs text-slate-400">Interactive BIOS configuration, disk partitioning & OS setup trainer</p>
          </div>
        </div>

        <button
          onClick={onOpenInstructorLogs}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 shadow-sm flex items-center gap-2 transition-all"
        >
          <History className="w-4 h-4 text-indigo-400" />
          <span>Instructor Records & Gradebook</span>
        </button>
      </header>

      {/* Main Form Container */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Student Details & OS Selector */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Student Information */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-semibold text-slate-100 text-base">
                <User className="w-5 h-5 text-blue-400" />
                <span>1. Student Identity</span>
              </div>
              <span className="text-xs text-slate-400">Step 1 of 3</span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Student Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrorMsg(''); }}
                  placeholder="e.g. Juan Dela Cruz"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Section / Year & Block <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => { setSection(e.target.value); setErrorMsg(''); }}
                  placeholder="e.g. BSIT 2-A"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </section>

          {/* Step 2: Assigned Student Task Card */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-semibold text-slate-100 text-base">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>2. Assigned Student Task Instructions</span>
              </div>
              <span className="text-xs text-amber-400 font-medium bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Unique Student Task
              </span>
            </div>

            <div className="p-4 bg-gradient-to-r from-slate-950 to-indigo-950/30 border border-indigo-900/40 rounded-xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{currentTask.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{currentTask.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Required BIOS/UEFI Settings
                  </span>
                  <p className="font-semibold text-slate-200">
                    Boot: <span className="text-amber-400">USB 1st</span> | Mode: <span className="uppercase text-blue-400">{currentTask.biosReq.bootMode}</span> | SATA: <span className="uppercase text-slate-200">{currentTask.biosReq.sataMode}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Secure Boot: <strong className={currentTask.biosReq.secureBoot ? 'text-emerald-400' : 'text-slate-400'}>{currentTask.biosReq.secureBoot ? 'ON' : 'OFF'}</strong> | TPM: <strong className={currentTask.biosReq.tpmEnabled ? 'text-emerald-400' : 'text-slate-400'}>{currentTask.biosReq.tpmEnabled ? 'ON' : 'OFF'}</strong>
                  </p>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800/80 space-y-1">
                  <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> Disk Partitioning Rule
                  </span>
                  <p className="font-semibold text-slate-200">
                    Drive 0 Size: <span className="text-emerald-400">{currentTask.diskSizeGB} GB</span>
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Primary Partition: <strong className="text-emerald-400">{currentTask.partitionReq.primarySizeGB} GB</strong> ({currentTask.partitionReq.primarySizeGB * 1024} MB)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3: Operating System Selector & Start Button */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-semibold text-slate-100 text-base">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>3. Select Operating System Simulator</span>
              </div>
              <span className="text-xs text-slate-400">Click OS to Launch Desktop</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Windows 7 Button */}
              <button
                type="button"
                onClick={() => { setSelectedOS('win7'); handleStart('win7'); }}
                className={`p-4 rounded-xl border text-left transition-all relative group overflow-hidden ${
                  selectedOS === 'win7'
                    ? 'bg-blue-950/60 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wide">Legacy Era</span>
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                </div>
                <h4 className="font-bold text-base text-slate-100">Windows 7</h4>
                <p className="text-[11px] text-slate-400 mt-1">Classic AMI BIOS & Legacy Disk Partitioning</p>
                <div className="mt-3 flex items-center text-xs text-sky-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Start Win 7</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </button>

              {/* Windows 10 Button */}
              <button
                type="button"
                onClick={() => { setSelectedOS('win10'); handleStart('win10'); }}
                className={`p-4 rounded-xl border text-left transition-all relative group overflow-hidden ${
                  selectedOS === 'win10'
                    ? 'bg-blue-950/60 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">UEFI Mode</span>
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <h4 className="font-bold text-base text-slate-100">Windows 10</h4>
                <p className="text-[11px] text-slate-400 mt-1">Aptio UEFI Setup & MBR/GPT Setup</p>
                <div className="mt-3 flex items-center text-xs text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Start Win 10</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </button>

              {/* Windows 11 Button */}
              <button
                type="button"
                onClick={() => { setSelectedOS('win11'); handleStart('win11'); }}
                className={`p-4 rounded-xl border text-left transition-all relative group overflow-hidden ${
                  selectedOS === 'win11'
                    ? 'bg-blue-950/60 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Next-Gen</span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                </div>
                <h4 className="font-bold text-base text-slate-100">Windows 11</h4>
                <p className="text-[11px] text-slate-400 mt-1">Secure Boot, TPM 2.0 & GPT Volume Manager</p>
                <div className="mt-3 flex items-center text-xs text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Start Win 11</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Grading Rubrics Overview */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-semibold text-slate-100 text-base">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Assessment Rubrics (100 Pts)</span>
              </div>
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Passing: 70%
              </span>
            </div>

            <div className="space-y-3">
              {DEFAULT_RUBRICS.map((rubric) => (
                <div key={rubric.id} className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      {rubric.category}
                    </span>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {rubric.maxPoints} pts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5 leading-snug">{rubric.description}</p>
                </div>
              ))}
            </div>

            {/* Quick Simulation Steps summary */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <h4 className="font-semibold text-slate-200">How to Complete the Simulation:</h4>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 leading-relaxed">
                <li>Click selected OS to direct to simulated computer desktop.</li>
                <li>Restart simulator computer (Start Menu or Power button).</li>
                <li>Press <kbd className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded text-[10px] border border-slate-700">DEL</kbd> or <kbd className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded text-[10px] border border-slate-700">F2</kbd> during reboot to enter BIOS.</li>
                <li>Configure Boot Device, SATA, Mode, Secure Boot as required.</li>
                <li>Save BIOS (<kbd className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded text-[10px] border border-slate-700">F10</kbd>) & boot Windows Setup.</li>
                <li>Partition Drive 0 in MB, format OS partition & complete installation.</li>
              </ol>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        Operating System Installation & BIOS Setup Simulator &bull; Educational Training Tool &bull; Instant Feedback & CSV Export
      </footer>
    </div>
  );
};
