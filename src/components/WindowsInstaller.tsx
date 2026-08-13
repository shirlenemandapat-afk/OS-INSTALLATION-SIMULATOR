import React, { useState, useEffect } from 'react';
import { OSType, SimulationState, PartitionItem, TaskRequirement } from '../types';
import { PartitionManager } from './PartitionManager';
import { HelpRubricModal } from './HelpRubricModal';
import { Monitor, ArrowRight, Check, CheckCircle2, Shield, Loader2 } from 'lucide-react';

interface WindowsInstallerProps {
  os: OSType;
  task: TaskRequirement;
  state: SimulationState;
  onUpdateState: (updates: Partial<SimulationState>) => void;
  onCompleteInstallation: () => void;
}

export const WindowsInstaller: React.FC<WindowsInstallerProps> = ({
  os,
  task,
  state,
  onUpdateState,
  onCompleteInstallation
}) => {
  const [agreedToEula, setAgreedToEula] = useState(false);
  const [copyProgress, setCopyProgress] = useState(0);

  // Installer styling per OS
  const getInstallerTheme = () => {
    switch (os) {
      case 'win7':
        return {
          bgClass: 'bg-gradient-to-b from-blue-900 via-sky-900 to-blue-950',
          windowBg: 'bg-slate-200 text-slate-900 border-2 border-slate-400 shadow-2xl',
          headerBg: 'bg-gradient-to-r from-blue-800 to-sky-700 text-white font-bold px-4 py-2 flex justify-between items-center',
          btnPrimary: 'bg-gradient-to-b from-sky-500 to-blue-700 hover:brightness-110 text-white font-bold px-6 py-2 rounded shadow-md border border-sky-300 text-xs',
          title: 'Windows 7 Setup'
        };
      case 'win10':
        return {
          bgClass: 'bg-gradient-to-tr from-sky-950 via-slate-900 to-blue-950',
          windowBg: 'bg-slate-900 text-slate-100 border border-slate-800 shadow-2xl',
          headerBg: 'bg-slate-950 border-b border-slate-800 text-blue-400 font-bold px-6 py-3 flex justify-between items-center',
          btnPrimary: 'bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg text-xs transition-all',
          title: 'Windows 10 Setup'
        };
      case 'win11':
        return {
          bgClass: 'bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950',
          windowBg: 'bg-slate-900/90 backdrop-blur-xl border border-indigo-900/40 shadow-2xl rounded-2xl',
          headerBg: 'bg-slate-950/80 border-b border-slate-800 text-indigo-400 font-bold px-6 py-3 flex justify-between items-center rounded-t-2xl',
          btnPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 rounded-xl shadow-lg text-xs transition-all',
          title: 'Windows 11 Setup'
        };
    }
  };

  const theme = getInstallerTheme();

  // Progress animation for installer copying step
  useEffect(() => {
    if (state.step === 'installer_copying') {
      const interval = setInterval(() => {
        setCopyProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              onCompleteInstallation();
            }, 1200);
            return 100;
          }
          return prev + 5;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [state.step]);

  return (
    <div className={`fixed inset-0 select-none ${theme.bgClass} flex items-center justify-center p-4 z-50`}>
      <HelpRubricModal task={task} selectedOS={os} />

      <div className={`w-full max-w-3xl overflow-hidden ${theme.windowBg}`}>
        {/* Title Bar */}
        <div className={theme.headerBg}>
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            <span className="text-sm font-bold">{theme.title}</span>
          </div>
          <span className="text-xs opacity-75 font-mono">Assigned OS: {os.toUpperCase()}</span>
        </div>

        {/* Installer Body */}
        <div className="p-8 min-h-[440px] flex flex-col justify-between">
          {/* STEP 1: Language & Region */}
          {state.step === 'installer_language' && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Language and preferences to install</h2>
                <div className="space-y-3 text-xs max-w-md">
                  <div>
                    <label className="block text-slate-400 mb-1">Language to install:</label>
                    <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200">
                      <option>English (United States)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Time and currency format:</label>
                    <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200">
                      <option>English (United States)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Keyboard or input method:</label>
                    <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200">
                      <option>US Keyboard</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-800/80 pt-4">
                <button
                  onClick={() => onUpdateState({ step: 'installer_key' })}
                  className={theme.btnPrimary}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Product Key */}
          {state.step === 'installer_key' && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Activate Windows</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your 25-character product key to activate Windows, or select "I don't have a product key" for trial/lab installation.
                </p>
                <div className="max-w-md">
                  <input
                    type="text"
                    placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono tracking-wider uppercase"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-4">
                <button
                  onClick={() => onUpdateState({ step: 'installer_edition' })}
                  className="text-xs text-blue-400 hover:underline"
                >
                  I don't have a product key
                </button>
                <button
                  onClick={() => onUpdateState({ step: 'installer_edition' })}
                  className={theme.btnPrimary}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Select Edition & EULA */}
          {state.step === 'installer_edition' && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Select Operating System Edition</h2>
                <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-950 text-xs">
                  <div className="p-3 border-b border-slate-800 bg-slate-900 font-semibold text-slate-200">
                    Operating System
                  </div>
                  <div className="p-3 bg-blue-600/30 font-semibold text-blue-300 flex justify-between items-center border-l-4 border-l-blue-500">
                    <span>{os === 'win7' ? 'Windows 7 Ultimate x64' : os === 'win10' ? 'Windows 10 Pro x64' : 'Windows 11 Pro x64'}</span>
                    <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded">Selected</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 text-xs">
                  <input
                    type="checkbox"
                    id="eula"
                    checked={agreedToEula}
                    onChange={(e) => setAgreedToEula(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="eula" className="text-slate-300 cursor-pointer">
                    I accept the Microsoft Software License Terms.
                  </label>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-800/80 pt-4">
                <button
                  onClick={() => agreedToEula && onUpdateState({ step: 'installer_type' })}
                  disabled={!agreedToEula}
                  className={`${theme.btnPrimary} disabled:opacity-40`}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Installation Type (Custom) */}
          {state.step === 'installer_type' && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-lg font-bold">Which type of installation do you want?</h2>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 opacity-60">
                    <h4 className="font-bold text-xs">Upgrade: Install Windows and keep files, settings, and applications</h4>
                    <p className="text-[11px] mt-1">Not available when booting from installation media.</p>
                  </div>

                  <button
                    onClick={() => onUpdateState({ step: 'installer_partition' })}
                    className="w-full text-left p-4 bg-slate-950 hover:bg-blue-950/40 border border-slate-700 hover:border-blue-500 rounded-xl transition-all group"
                  >
                    <h4 className="font-bold text-xs text-blue-400 group-hover:text-blue-300 flex items-center justify-between">
                      <span>Custom: Install Windows only (advanced)</span>
                      <ArrowRight className="w-4 h-4" />
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      The files, settings, and applications aren't moved to Windows. You can modify partitions and drives manually.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Drive Partitioning Tool */}
          {state.step === 'installer_partition' && (
            <PartitionManager
              os={os}
              task={task}
              partitions={state.partitions}
              selectedPartitionId={state.selectedPartitionId}
              onUpdatePartitions={(newPartitions, selectedId) => {
                onUpdateState({
                  partitions: newPartitions,
                  selectedPartitionId: selectedId
                });
              }}
              onNextStep={() => {
                onUpdateState({
                  installedPartitionId: state.selectedPartitionId,
                  step: 'installer_copying'
                });
              }}
            />
          )}

          {/* STEP 6: Copying Windows Files Animation */}
          {state.step === 'installer_copying' && (
            <div className="space-y-6 flex-1 flex flex-col justify-center max-w-md mx-auto text-center py-8">
              <h2 className="text-lg font-bold text-slate-100 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                Installing Windows...
              </h2>
              <p className="text-xs text-slate-400">
                Your computer will restart several times. This might take a few moments.
              </p>

              <div className="space-y-3 text-xs text-left bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Copying Windows files</span>
                  <span>100%</span>
                </div>
                <div className={`flex items-center justify-between font-semibold ${copyProgress >= 20 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  <span className="flex items-center gap-2">
                    {copyProgress >= 20 ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
                    Getting files ready for installation
                  </span>
                  <span>{copyProgress}%</span>
                </div>
                <div className={`flex items-center justify-between ${copyProgress >= 80 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                  <span>Installing features</span>
                  <span>{copyProgress >= 80 ? 'Done' : 'Pending'}</span>
                </div>
                <div className={`flex items-center justify-between ${copyProgress >= 95 ? 'text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                  <span>Installing updates</span>
                  <span>{copyProgress >= 95 ? 'Done' : 'Pending'}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${copyProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
