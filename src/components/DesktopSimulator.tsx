import React, { useState } from 'react';
import { OSType, StudentInfo, TaskRequirement } from '../types';
import { RotateCcw, Power, Terminal, Folder, Globe, Monitor, HelpCircle, ArrowLeft } from 'lucide-react';

interface DesktopSimulatorProps {
  os: OSType;
  student: StudentInfo;
  task: TaskRequirement;
  onRestartComputer: () => void;
  onBackToPortal: () => void;
}

export const DesktopSimulator: React.FC<DesktopSimulatorProps> = ({
  os,
  student,
  task,
  onRestartComputer,
  onBackToPortal
}) => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  // Background and UI styles per OS
  const getOsStyles = () => {
    switch (os) {
      case 'win7':
        return {
          bgClass: 'bg-gradient-to-br from-blue-700 via-sky-600 to-indigo-900',
          wallpaperText: 'Windows 7 Ultimate',
          taskbarBg: 'bg-slate-900/80 backdrop-blur-md border-t border-sky-400/30',
          startBtn: 'bg-gradient-to-b from-sky-400 to-blue-700 rounded-full p-2 border border-sky-200 shadow-md hover:brightness-110',
          accentColor: 'text-sky-300'
        };
      case 'win10':
        return {
          bgClass: 'bg-gradient-to-tr from-sky-950 via-slate-900 to-blue-900',
          wallpaperText: 'Windows 10 Pro',
          taskbarBg: 'bg-slate-950/90 backdrop-blur-lg border-t border-slate-800',
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
      {/* Top Floating Instruction Bar */}
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
            Student: <strong className="text-blue-400">{student.name}</strong> ({student.section})
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">
            Current Simulated OS: <strong className="uppercase text-amber-400">{os}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/50 px-3 py-1 rounded-lg text-indigo-300 text-[11px]">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Task: Partition Drive 0 ({task.partitionReq.primarySizeGB}GB C: Drive), Boot USB 1st</span>
          </div>

          <button
            onClick={onRestartComputer}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 animate-pulse"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Simulator (Begin Setup)</span>
          </button>
        </div>
      </div>

      {/* Desktop Wallpaper Area */}
      <div className="flex-1 relative flex items-center justify-center p-8">
        {/* Desktop Icons */}
        <div className="absolute top-12 left-8 flex flex-col gap-6 text-slate-100 text-xs text-center font-medium">
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 cursor-pointer w-20">
            <Monitor className="w-8 h-8 text-sky-300 drop-shadow-md" />
            <span className="text-shadow">This PC</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 cursor-pointer w-20">
            <Folder className="w-8 h-8 text-amber-300 drop-shadow-md" />
            <span className="text-shadow">Documents</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 cursor-pointer w-20">
            <Globe className="w-8 h-8 text-blue-400 drop-shadow-md" />
            <span className="text-shadow">Browser</span>
          </div>
        </div>

        {/* Center OS Brand Graphic */}
        <div className="text-center space-y-4 opacity-75 pointer-events-none">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl">
            <Monitor className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-wider drop-shadow-lg uppercase">
            {styles.wallpaperText}
          </h2>
          <p className="text-sm font-medium text-slate-200/90 max-w-md mx-auto">
            System running active state. To re-install or re-configure BIOS & Disk Partitions, restart the system.
          </p>
        </div>

        {/* Start Menu Popup */}
        {startMenuOpen && (
          <div className={`absolute bottom-16 ${os === 'win11' ? 'left-1/2 -translate-x-1/2' : 'left-4'} w-80 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-100 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm text-white">
                  {student.name.charAt(0) || 'S'}
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-slate-100">{student.name}</h4>
                  <p className="text-[10px] text-slate-400">{student.section}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="p-2 hover:bg-slate-800 rounded-lg flex items-center gap-2.5 cursor-pointer text-slate-300">
                <Monitor className="w-4 h-4 text-blue-400" /> System Information
              </div>
              <div className="p-2 hover:bg-slate-800 rounded-lg flex items-center gap-2.5 cursor-pointer text-slate-300">
                <Terminal className="w-4 h-4 text-emerald-400" /> Command Prompt
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Power Options:</span>
              <button
                onClick={onRestartComputer}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all shadow"
              >
                <Power className="w-3.5 h-3.5" /> Restart Simulator
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Taskbar */}
      <div className={`h-12 ${styles.taskbarBg} px-4 flex items-center justify-between relative z-40`}>
        {/* Left or Centered Start Controls depending on OS */}
        <div className={`flex items-center gap-2 ${os === 'win11' ? 'mx-auto' : ''}`}>
          <button
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            className={styles.startBtn}
            title="Start Menu"
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* Quick taskbar icons */}
          <div className="flex items-center gap-1 text-slate-300">
            <div className="p-2 hover:bg-white/10 rounded-lg cursor-pointer">
              <Folder className="w-4 h-4 text-amber-300" />
            </div>
            <div className="p-2 hover:bg-white/10 rounded-lg cursor-pointer">
              <Globe className="w-4 h-4 text-blue-400" />
            </div>
          </div>
        </div>

        {/* System Tray (Clock, Power) */}
        {os !== 'win11' && (
          <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
            <button
              onClick={onRestartComputer}
              className="p-1.5 hover:bg-white/10 text-rose-400 rounded-lg flex items-center gap-1"
              title="Restart Computer"
            >
              <Power className="w-4 h-4" />
            </button>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}
      </div>
    </div>
  );
};
