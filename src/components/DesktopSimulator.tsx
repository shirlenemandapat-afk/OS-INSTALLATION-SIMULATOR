import React, { useState, useEffect } from 'react';
import { OSType, StudentInfo, TaskRequirement, SimulationState, EvaluationResult } from '../types';
import { evaluateStudentConfig, exportToCSV } from '../data/tasks';
import { saveStudentScoreToSupabase } from '../lib/supabase';
import { 
  RotateCcw, Power, Terminal, Folder, Globe, Monitor, HelpCircle, 
  ArrowLeft, Award, Download, CheckCircle2, AlertTriangle, HardDrive, 
  Database, ShieldCheck, X, Minimize2, Cpu, Key, Shield, Settings,
  Search, Mail, Calendar, Wifi, Play, Layers, ExternalLink, Check
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
  const [activeWindow, setActiveWindow] = useState<'none' | 'this_pc' | 'cmd' | 'sysinfo' | 'rubric' | 'kms' | 'settings'>('none');
  const [settingsTab, setSettingsTab] = useState<'about' | 'activation' | 'network'>('about');

  // Terminal & KMS state
  const [cmdInput, setCmdInput] = useState('');
  const [isKmsActivated, setIsKmsActivated] = useState(true);
  const [kmsHost, setKmsHost] = useState('kms.illinois.edu:1688');

  // OS Specific Generic KMS Client Keys (from Microsoft / Illinois WebStore documentation)
  const defaultKmsKey = os === 'win7'
    ? 'FJ82H-XT6CR-J8D7P-XQJJ2-GPDD4' // Win 7 Pro
    : os === 'win10'
    ? 'W269N-WFGWX-YVC9B-4J6C9-T83GX' // Win 10 Pro
    : 'W269N-WFGWX-YVC9B-4J6C9-T83GX'; // Win 11 Pro

  const [installedProductKey, setInstalledProductKey] = useState(defaultKmsKey);

  const [cmdLogs, setCmdLogs] = useState<string[]>([
    `Microsoft Windows [Version ${os === 'win7' ? '6.1.7601' : os === 'win10' ? '10.0.19045.3803' : '10.0.22631.2861'}]`,
    `(c) Microsoft Corporation. All rights reserved.`,
    ``,
    `Type 'help', 'slmgr.vbs /ato', 'slmgr.vbs /dli', 'diskpart', or 'systeminfo' to verify installation.`
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
      newLogs.push('  diskpart          - View disk partitions & volume details');
      newLogs.push('  systeminfo        - View OS build, BIOS boot mode, and RAM');
      newLogs.push('  ver               - Display Windows version');
      newLogs.push('  ipconfig          - Display virtual network configuration');
      newLogs.push('  slmgr.vbs /ipk <key>   - Install KMS Client Setup Key');
      newLogs.push('  slmgr.vbs /skms <host> - Set KMS Server Host (e.g. kms.illinois.edu:1688)');
      newLogs.push('  slmgr.vbs /ato         - Activate Windows with KMS server');
      newLogs.push('  slmgr.vbs /dli         - Display KMS License Information');
      newLogs.push('  slmgr.vbs /dlv         - Display Detailed KMS License Information');
      newLogs.push('  cls                    - Clear screen');
    } else if (cmd.includes('/ipk')) {
      const parts = cmdInput.split(/\/ipk/i);
      const key = parts[1]?.trim() || defaultKmsKey;
      setInstalledProductKey(key.toUpperCase());
      newLogs.push(`Installed product key ${key.toUpperCase()} successfully.`);
    } else if (cmd.includes('slmgr.vbs /skms') || cmd.includes('slmgr /skms')) {
      const parts = cmd.split('/skms');
      const targetHost = parts[1]?.trim() || 'kms.illinois.edu:1688';
      setKmsHost(targetHost);
      newLogs.push(`Key Management Service machine name set to ${targetHost} successfully.`);
    } else if (cmd.includes('slmgr.vbs /ato') || cmd.includes('slmgr /ato')) {
      setIsKmsActivated(true);
      newLogs.push(`Activating Windows(R), ${os === 'win7' ? '7 Professional' : '10 Pro'} edition...`);
      newLogs.push(`Product activated successfully via KMS (${kmsHost}).`);
    } else if (cmd.includes('slmgr.vbs /dli') || cmd.includes('slmgr /dli') || cmd.includes('slmgr.vbs /dlv') || cmd.includes('slmgr /dlv')) {
      newLogs.push(`Name: Windows(R), ${os === 'win7' ? '7 Professional' : '10 Pro'} edition`);
      newLogs.push(`Description: Windows Operating System - VOLUME_KMSCLIENT channel`);
      newLogs.push(`Partial Product Key: ${installedProductKey.slice(-5)}`);
      newLogs.push(`License Status: ${isKmsActivated ? 'Licensed (Grace period: 180 days)' : 'Notification'}`);
      newLogs.push(`Key Management Service client information:`);
      newLogs.push(`  Registered KMS machine name: ${kmsHost}`);
      newLogs.push(`  KMS host caching: Enabled`);
    } else if (cmd === 'diskpart') {
      newLogs.push(`Microsoft DiskPart version ${os === 'win7' ? '6.1.7601' : '10.0.19045'} (${os === 'win7' ? 'Windows 7' : 'Windows 10'})`);
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
      newLogs.push(`OS Name:             Microsoft Windows ${os === 'win7' ? '7 Professional' : os === 'win10' ? '10 Pro (22H2)' : '11 Pro'}`);
      newLogs.push(`OS Version:          ${os === 'win7' ? '6.1.7601 Service Pack 1 Build 7601' : os === 'win10' ? '10.0.19045 N/A Build 19045' : '10.0.22631 Build 22631'}`);
      newLogs.push(`Student Name:        ${student.name || 'Anonymous'}`);
      newLogs.push(`Section:             ${student.section || 'N/A'}`);
      newLogs.push(`System Type:         x64-based PC`);
      newLogs.push(`BIOS Boot Mode:      ${simulationState?.biosConfig.bootMode.toUpperCase() || 'UEFI'}`);
      newLogs.push(`SATA Controller:     ${simulationState?.biosConfig.sataMode.toUpperCase() || 'AHCI'}`);
      newLogs.push(`KMS License Status:  ${isKmsActivated ? 'Activated (kms.illinois.edu)' : 'Pending'}`);
      newLogs.push(`Boot Priority USB:   ${simulationState?.biosConfig.bootOrder[0] === 'usb' ? 'OK (1st)' : 'Incorrect'}`);
    } else if (cmd === 'ver') {
      newLogs.push(`Microsoft Windows [Version ${os === 'win7' ? '6.1.7601' : os === 'win10' ? '10.0.19045.3803' : '10.0.22631.2861'}]`);
    } else if (cmd === 'ipconfig') {
      newLogs.push('Windows IP Configuration');
      newLogs.push('');
      newLogs.push('Ethernet adapter Ethernet 1:');
      newLogs.push('   Connection-specific DNS Suffix  . : campus.internal');
      newLogs.push('   IPv4 Address. . . . . . . . . . . : 192.168.1.145');
      newLogs.push('   Subnet Mask . . . . . . . . . . . : 255.255.255.0');
      newLogs.push('   Default Gateway . . . . . . . . . : 192.168.1.1');
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
          wallpaperText: 'Windows 7 Professional',
          taskbarBg: 'bg-slate-900/85 backdrop-blur-md border-t border-sky-400/40 shadow-2xl',
          startBtn: 'bg-gradient-to-b from-sky-400 to-blue-700 rounded-full p-2 border border-sky-200 shadow-md hover:brightness-110',
          accentColor: 'text-sky-300'
        };
      case 'win10':
        return {
          bgClass: 'bg-gradient-to-tr from-sky-950 via-slate-900 to-blue-900',
          wallpaperText: 'Windows 10 Pro',
          taskbarBg: 'bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 shadow-2xl',
          startBtn: 'p-2.5 hover:bg-slate-800/80 rounded transition-colors text-sky-400',
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
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
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
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow flex items-center gap-1.5 text-xs transition-all cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Score: {evaluationResult.percentage}% ({evaluationResult.grade})</span>
            </button>
          )}

          <button
            onClick={onRestartComputer}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Simulator (Re-boot Setup)</span>
          </button>
        </div>
      </div>

      {/* Main Desktop Canvas */}
      <div className="flex-1 relative p-8">
        {/* Desktop Icons */}
        <div className="absolute top-8 left-8 flex flex-col gap-5 text-slate-100 text-xs text-center font-medium z-10">
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
            onClick={() => setActiveWindow('kms')}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-20 transition-all group"
            title="University KMS Activation Tool"
          >
            <Key className="w-9 h-9 text-sky-400 group-hover:scale-110 transition-transform drop-shadow-md" />
            <span className="text-shadow">KMS Tool</span>
          </div>

          {os === 'win10' && (
            <div 
              onClick={() => { setActiveWindow('settings'); setSettingsTab('about'); }}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 cursor-pointer w-20 transition-all group"
              title="Windows Settings"
            >
              <Settings className="w-9 h-9 text-slate-300 group-hover:scale-110 transition-transform drop-shadow-md" />
              <span className="text-shadow">Settings</span>
            </div>
          )}

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
              <button onClick={() => setActiveWindow('none')} className="p-1 hover:bg-rose-500 rounded text-slate-400 hover:text-white cursor-pointer">
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
                <span>Command Prompt - Administrator</span>
              </div>
              <button onClick={() => setActiveWindow('none')} className="p-1 hover:bg-rose-500 rounded text-slate-400 hover:text-white cursor-pointer">
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
              <button onClick={() => setActiveWindow('none')} className="p-1 hover:bg-rose-500 rounded text-slate-400 hover:text-white cursor-pointer">
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
                  <p className="font-bold text-amber-400 uppercase">{os === 'win7' ? 'Windows 7 (Build 7601 SP1)' : 'Windows 10 Pro (22H2 Build 19045)'}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] font-semibold">BIOS Boot Mode</span>
                  <p className="font-bold text-blue-400 uppercase">{simulationState?.biosConfig.bootMode || 'UEFI'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WINDOW 3.5: KMS ACTIVATION MANAGER (ILLINOIS WEBSTORE REFERENCE) */}
        {activeWindow === 'kms' && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-slate-100 z-30 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs font-bold">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-sky-400" />
                <span>{os === 'win7' ? 'Windows 7' : 'Windows 10'} KMS Activation Tool (Illinois Reference)</span>
              </div>
              <button onClick={() => setActiveWindow('none')} className="p-1 hover:bg-rose-500 rounded text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-sky-950/40 border border-sky-800/60 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100 text-sm">Campus Key Management Service (KMS)</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Based on the University of Illinois WebStore KMS guide, university volume license editions ({os === 'win7' ? 'Windows 7 Professional' : 'Windows 10 Pro'}) activate against the campus KMS server automatically.
                  </p>
                </div>
              </div>

              <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Registered KMS Server:</span>
                  <span className="text-sky-300 font-bold">{kmsHost}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Product Edition:</span>
                  <span className="text-slate-200">{os === 'win7' ? 'Windows 7 Professional' : 'Windows 10 Pro'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Volume Client Key:</span>
                  <span className="text-amber-300 font-mono">{installedProductKey}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Activation Status:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Activated (Genuine)
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Evaluation Period:</span>
                  <span className="text-slate-300">180 Days (Auto-renewing)</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                <span className="font-semibold text-slate-300 block font-sans text-xs">KMS Script Commands:</span>
                <code className="block bg-black/60 p-2 rounded text-emerald-400 text-[10px] select-all">
                  cscript slmgr.vbs /ipk {installedProductKey}<br />
                  cscript slmgr.vbs /skms {kmsHost}<br />
                  cscript slmgr.vbs /ato
                </code>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsKmsActivated(true);
                    alert(`KMS Host Verification Complete!\n\nSuccessfully connected to ${kmsHost}.\n${os === 'win7' ? 'Windows 7' : 'Windows 10'} license has been activated.`);
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow text-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Verify / Re-run KMS Activation</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WINDOW 3.6: WINDOWS 10 SETTINGS APP */}
        {activeWindow === 'settings' && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-[#1f1f1f] border border-neutral-700 rounded-xl shadow-2xl text-slate-100 z-30 overflow-hidden animate-in fade-in zoom-in-95 font-sans">
            <div className="bg-[#181818] px-4 py-2.5 flex items-center justify-between border-b border-neutral-800 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-sky-400" />
                <span>Windows Settings</span>
              </div>
              <button onClick={() => setActiveWindow('none')} className="p-1 hover:bg-rose-600 rounded text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex h-96">
              {/* Settings Sidebar */}
              <div className="w-48 bg-[#181818] border-r border-neutral-800 p-3 space-y-1 text-xs">
                <button
                  onClick={() => setSettingsTab('about')}
                  className={`w-full text-left p-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${settingsTab === 'about' ? 'bg-[#0078d7] text-white font-semibold' : 'hover:bg-neutral-800 text-slate-300'}`}
                >
                  <Cpu className="w-4 h-4" />
                  <span>About PC</span>
                </button>
                <button
                  onClick={() => setSettingsTab('activation')}
                  className={`w-full text-left p-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${settingsTab === 'activation' ? 'bg-[#0078d7] text-white font-semibold' : 'hover:bg-neutral-800 text-slate-300'}`}
                >
                  <Key className="w-4 h-4" />
                  <span>Activation</span>
                </button>
                <button
                  onClick={() => setSettingsTab('network')}
                  className={`w-full text-left p-2 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${settingsTab === 'network' ? 'bg-[#0078d7] text-white font-semibold' : 'hover:bg-neutral-800 text-slate-300'}`}
                >
                  <Wifi className="w-4 h-4" />
                  <span>Network Status</span>
                </button>
              </div>

              {/* Settings Content */}
              <div className="flex-1 p-6 overflow-y-auto text-xs space-y-4">
                {settingsTab === 'about' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-light text-white">About your PC</h3>
                    
                    <div className="space-y-2 bg-[#282828] p-4 rounded-xl border border-neutral-700">
                      <h4 className="font-semibold text-sky-400">Device specifications</h4>
                      <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                        <div>Device name: <strong className="text-white">WIN10-LABPC</strong></div>
                        <div>Processor: <strong className="text-white">Intel(R) Core(TM) i7-12700K</strong></div>
                        <div>Installed RAM: <strong className="text-white">16.0 GB (15.8 GB usable)</strong></div>
                        <div>System type: <strong className="text-white">64-bit operating system, x64-based processor</strong></div>
                      </div>
                    </div>

                    <div className="space-y-2 bg-[#282828] p-4 rounded-xl border border-neutral-700">
                      <h4 className="font-semibold text-sky-400">Windows specifications</h4>
                      <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                        <div>Edition: <strong className="text-white">Windows 10 Pro</strong></div>
                        <div>Version: <strong className="text-white">22H2</strong></div>
                        <div>OS build: <strong className="text-white">19045.3803</strong></div>
                        <div>Experience: <strong className="text-white">Windows Feature Experience Pack</strong></div>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'activation' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-light text-white">Activation</h3>
                    <div className="p-4 bg-[#282828] rounded-xl border border-neutral-700 space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                        <div>
                          <h4 className="font-semibold text-white">Windows is activated</h4>
                          <p className="text-slate-400 text-[11px]">Windows is activated using your organization's activation service (KMS).</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-neutral-700 space-y-1 font-mono text-[11px] text-slate-300">
                        <div>KMS Server: <strong className="text-sky-400">{kmsHost}</strong></div>
                        <div>Channel: <strong className="text-slate-100">VOLUME_KMSCLIENT</strong></div>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'network' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-light text-white">Network Status</h3>
                    <div className="p-4 bg-[#282828] rounded-xl border border-neutral-700 flex items-center gap-3">
                      <Wifi className="w-6 h-6 text-sky-400" />
                      <div>
                        <h4 className="font-semibold text-white">Campus-Lab-Ethernet</h4>
                        <p className="text-slate-400 text-[11px]">You're connected to the internet.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WINDOW 4: RUBRIC GRADE REPORT */}
        {activeWindow === 'rubric' && evaluationResult && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-slate-100 z-30 overflow-hidden">
            <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs font-bold">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Student Evaluation & Score Card</span>
              </div>
              <button onClick={() => setActiveWindow('none')} className="p-1 hover:bg-rose-500 rounded text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[480px] overflow-y-auto text-xs">
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-lg font-extrabold text-white">{student.name || 'Anonymous Student'}</h3>
                  <p className="text-slate-400 text-xs">{student.section || 'Lab Section'}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400">{evaluationResult.percentage}%</span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Grade: {evaluationResult.grade}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-200">Rubric Breakdown:</h4>
                {evaluationResult.items.map((item) => (
                  <div key={item.key} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        {item.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-200">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-5">{item.details}</p>
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
          <div className={`absolute bottom-14 ${os === 'win11' ? 'left-1/2 -translate-x-1/2' : 'left-2'} ${os === 'win10' ? 'w-[520px]' : 'w-80'} bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl p-4 text-slate-100 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2`}>
            {os === 'win10' ? (
              /* WINDOWS 10 START MENU WITH LIVE TILES */
              <div className="flex gap-4">
                {/* Left App List */}
                <div className="w-48 space-y-2 text-xs border-r border-slate-800 pr-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-[#0078d7] flex items-center justify-center font-bold text-xs text-white">
                      {student.name ? student.name.charAt(0) : 'S'}
                    </div>
                    <span className="font-semibold text-xs truncate">{student.name || 'Student'}</span>
                  </div>

                  <div className="space-y-1">
                    <div 
                      onClick={() => { setActiveWindow('this_pc'); setStartMenuOpen(false); }}
                      className="p-1.5 hover:bg-slate-800 rounded flex items-center gap-2 cursor-pointer text-slate-300"
                    >
                      <Monitor className="w-4 h-4 text-sky-400" /> File Explorer
                    </div>
                    <div 
                      onClick={() => { setActiveWindow('cmd'); setStartMenuOpen(false); }}
                      className="p-1.5 hover:bg-slate-800 rounded flex items-center gap-2 cursor-pointer text-slate-300"
                    >
                      <Terminal className="w-4 h-4 text-emerald-400" /> Command Prompt
                    </div>
                    <div 
                      onClick={() => { setActiveWindow('settings'); setSettingsTab('about'); setStartMenuOpen(false); }}
                      className="p-1.5 hover:bg-slate-800 rounded flex items-center gap-2 cursor-pointer text-slate-300"
                    >
                      <Settings className="w-4 h-4 text-slate-300" /> Settings
                    </div>
                    <div 
                      onClick={() => { setActiveWindow('kms'); setStartMenuOpen(false); }}
                      className="p-1.5 hover:bg-slate-800 rounded flex items-center gap-2 cursor-pointer text-slate-300"
                    >
                      <Key className="w-4 h-4 text-sky-400" /> KMS Manager
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center gap-1.5">
                    <button
                      onClick={onShutdownComputer}
                      className="p-1.5 hover:bg-rose-950 rounded text-rose-400 cursor-pointer"
                      title="Shut Down"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onRestartComputer}
                      className="p-1.5 hover:bg-amber-950 rounded text-amber-400 cursor-pointer"
                      title="Restart"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Right Live Tiles Grid */}
                <div className="flex-1 space-y-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Productivity</span>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div 
                        onClick={() => { setActiveWindow('this_pc'); setStartMenuOpen(false); }}
                        className="bg-[#0078d7] p-3 rounded h-20 flex flex-col justify-between hover:brightness-110 cursor-pointer transition-all"
                      >
                        <Folder className="w-5 h-5 text-white" />
                        <span className="text-xs font-semibold">Explorer</span>
                      </div>
                      <div 
                        onClick={() => { setActiveWindow('cmd'); setStartMenuOpen(false); }}
                        className="bg-[#107c41] p-3 rounded h-20 flex flex-col justify-between hover:brightness-110 cursor-pointer transition-all"
                      >
                        <Terminal className="w-5 h-5 text-white" />
                        <span className="text-xs font-semibold">Terminal</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Explore</span>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div 
                        onClick={() => { setActiveWindow('kms'); setStartMenuOpen(false); }}
                        className="bg-[#d83b01] p-3 rounded h-20 flex flex-col justify-between hover:brightness-110 cursor-pointer transition-all"
                      >
                        <Key className="w-5 h-5 text-white" />
                        <span className="text-xs font-semibold">KMS Activation</span>
                      </div>
                      <div 
                        onClick={() => { setActiveWindow('rubric'); setStartMenuOpen(false); }}
                        className="bg-[#5c2d91] p-3 rounded h-20 flex flex-col justify-between hover:brightness-110 cursor-pointer transition-all"
                      >
                        <Award className="w-5 h-5 text-white" />
                        <span className="text-xs font-semibold">Rubric Grade</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* WINDOWS 7 / 11 CLASSIC START MENU */
              <>
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
                    onClick={() => { setActiveWindow('kms'); setStartMenuOpen(false); }}
                    className="p-2 hover:bg-slate-800 rounded-lg flex items-center gap-2.5 cursor-pointer text-slate-300"
                  >
                    <Key className="w-4 h-4 text-sky-400" /> KMS Activation Tool
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
                      className="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-700/60 text-rose-200 rounded-lg font-semibold text-xs flex items-center gap-1 transition-all shadow cursor-pointer"
                    >
                      <Power className="w-3.5 h-3.5 text-rose-400" /> Shut Down
                    </button>
                    <button
                      onClick={onRestartComputer}
                      className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1 transition-all shadow cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restart
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Taskbar */}
      <div className={`h-12 ${styles.taskbarBg} px-3 flex items-center justify-between relative z-40`}>
        <div className={`flex items-center gap-2 ${os === 'win11' ? 'mx-auto' : ''}`}>
          <button
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            className={`${styles.startBtn} cursor-pointer`}
            title="Start Menu"
          >
            {os === 'win10' ? (
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                <div className="bg-sky-400" />
                <div className="bg-sky-400" />
                <div className="bg-sky-400" />
                <div className="bg-sky-400" />
              </div>
            ) : (
              <Monitor className="w-5 h-5" />
            )}
          </button>

          {/* Windows 10 Cortana Search Box */}
          {os === 'win10' && (
            <div 
              onClick={() => setActiveWindow('cmd')}
              className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-xs text-slate-400 hover:border-slate-500 cursor-pointer w-48 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Type here to search</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-slate-300">
            <div onClick={() => setActiveWindow('this_pc')} className="p-2 hover:bg-white/10 rounded cursor-pointer" title="File Explorer">
              <Folder className="w-4 h-4 text-amber-300" />
            </div>
            <div onClick={() => setActiveWindow('cmd')} className="p-2 hover:bg-white/10 rounded cursor-pointer" title="Command Prompt">
              <Terminal className="w-4 h-4 text-emerald-400" />
            </div>
            {os === 'win10' && (
              <div onClick={() => { setActiveWindow('settings'); setSettingsTab('about'); }} className="p-2 hover:bg-white/10 rounded cursor-pointer" title="Settings">
                <Settings className="w-4 h-4 text-slate-300" />
              </div>
            )}
            <div onClick={() => setActiveWindow('kms')} className="p-2 hover:bg-white/10 rounded cursor-pointer" title="KMS Activation Tool">
              <Key className="w-4 h-4 text-sky-400" />
            </div>
          </div>
        </div>

        {os !== 'win11' && (
          <div className="flex items-center gap-3 text-xs text-slate-300 font-medium">
            <Wifi className="w-4 h-4 text-slate-400" />
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
            <span className="pl-2 border-l border-slate-700 font-mono text-[11px]">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
