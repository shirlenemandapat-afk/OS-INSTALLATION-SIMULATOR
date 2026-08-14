import React, { useState, useEffect } from 'react';
import { OSType, SimulationState, TaskRequirement } from '../types';
import { PartitionManager } from './PartitionManager';
import { HelpRubricModal } from './HelpRubricModal';
import { Monitor, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

interface WindowsInstallerProps {
  os: OSType;
  task: TaskRequirement;
  state: SimulationState;
  onUpdateState: (updates: Partial<SimulationState>) => void;
  onCompleteInstallation: () => void;
  onRestartComputer?: () => void;
  onShutdownComputer?: () => void;
}

export const WindowsInstaller: React.FC<WindowsInstallerProps> = ({
  os,
  task,
  state,
  onUpdateState,
  onCompleteInstallation,
  onRestartComputer,
  onShutdownComputer
}) => {
  // Step state
  const [agreedToEula, setAgreedToEula] = useState(false);
  const [copyProgress, setCopyProgress] = useState(0);
  const [isStartingSetup, setIsStartingSetup] = useState(false);

  // Form selections (Mouse enabled!)
  const [langInstall, setLangInstall] = useState('English (United States)');
  const [timeFormat, setTimeFormat] = useState('English (United States)');
  const [keyMethod, setKeyMethod] = useState('US Keyboard');
  const [productKey, setProductKey] = useState('');

  // Options for dropdowns
  const langOptions = ['English (United States)', 'English (United Kingdom)', 'Spanish (International)', 'French (Standard)'];
  const timeOptions = ['English (United States)', 'English (Philippines)', 'English (United Kingdom)', 'Spanish (Mexico)'];
  const keyOptions = ['US Keyboard', 'UK Keyboard', 'Dvorak Keyboard', 'Spanish Keyboard'];

  const handleNextStep = () => {
    if (state.step === 'installer_language') {
      onUpdateState({ step: 'installer_welcome' });
    } else if (state.step === 'installer_key') {
      onUpdateState({ step: 'installer_edition' });
    } else if (state.step === 'installer_edition') {
      if (agreedToEula) {
        onUpdateState({ step: 'installer_type' });
      }
    } else if (state.step === 'installer_type') {
      onUpdateState({ step: 'installer_partition' });
    }
  };

  const handleInstallNowClick = () => {
    setIsStartingSetup(true);
    setTimeout(() => {
      setIsStartingSetup(false);
      onUpdateState({ step: 'installer_key' });
    }, 1500);
  };

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
  }, [state.step, onCompleteInstallation]);

  return (
    <div 
      className={`fixed inset-0 select-none flex flex-col items-center justify-between p-4 z-50 ${
        os === 'win7'
          ? 'bg-gradient-to-tr from-blue-800 via-sky-600 to-blue-950'
          : os === 'win10'
          ? 'bg-[#20095c]'
          : 'bg-gradient-to-br from-indigo-950 via-slate-950 to-blue-950'
      }`}
    >
      <HelpRubricModal task={task} selectedOS={os} />

      {/* Main Installer Window Container - Mouse Navigation Enabled */}
      <div 
        className={`w-full max-w-3xl overflow-hidden shadow-2xl my-auto transition-all ${
          os === 'win7'
            ? 'bg-slate-100 text-slate-900 border-2 border-slate-400 rounded-md'
            : os === 'win10'
            ? 'bg-[#2b0b6b] text-white border border-indigo-900/60 rounded-md'
            : 'bg-slate-900/90 backdrop-blur-xl border border-indigo-900/40 rounded-2xl text-slate-100'
        }`}
      >
        {/* Title Bar matching authentic Windows Setup Window */}
        <div 
          className={`px-4 py-2 flex items-center justify-between text-xs font-semibold ${
            os === 'win7'
              ? 'bg-gradient-to-r from-blue-700 via-sky-600 to-blue-800 text-white border-b border-sky-400/50'
              : os === 'win10'
              ? 'bg-[#20095c] text-white border-b border-indigo-900/80'
              : 'bg-slate-950 border-b border-slate-800 text-indigo-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-sky-300" />
            <span>{os === 'win7' ? 'Install Windows' : 'Windows Setup'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded border border-white/20 text-[10px]">
              {onShutdownComputer && (
                <button
                  type="button"
                  onClick={onShutdownComputer}
                  className="hover:text-rose-400 font-bold px-1 transition-colors cursor-pointer"
                  title="Shut Down Computer"
                >
                  Shut Down
                </button>
              )}
              <span className="text-white/30">|</span>
              {onRestartComputer && (
                <button
                  type="button"
                  onClick={onRestartComputer}
                  className="hover:text-amber-300 font-bold px-1 transition-colors cursor-pointer"
                  title="Restart Computer"
                >
                  Restart
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="w-3 h-3 rounded-full bg-slate-400/30 flex items-center justify-center text-[9px]">-</span>
              <span className="w-3 h-3 rounded-full bg-slate-400/30 flex items-center justify-center text-[9px]">□</span>
              <span className="w-3 h-3 rounded-full bg-rose-500/80 flex items-center justify-center text-[9px] text-white">✕</span>
            </div>
          </div>
        </div>

        {/* Windows Setup Inner Canvas */}
        <div className="p-8 min-h-[460px] flex flex-col justify-between relative">
          
          {/* Header OS Banner Graphic (Matching Reference Images!) */}
          <div className="flex items-center justify-between border-b border-slate-300/30 pb-4 mb-4">
            <div className="flex items-center gap-3">
              {os === 'win7' ? (
                <div className="flex items-center gap-3">
                  <div className="grid grid-cols-2 gap-0.5 w-8 h-8">
                    <div className="bg-red-500 rounded-tl-sm" />
                    <div className="bg-green-500 rounded-tr-sm" />
                    <div className="bg-blue-500 rounded-bl-sm" />
                    <div className="bg-yellow-400 rounded-br-sm" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-blue-900 drop-shadow">Windows 7</h1>
                </div>
              ) : os === 'win10' ? (
                <div className="flex items-center gap-3">
                  <div className="grid grid-cols-2 gap-0.5 w-7 h-7">
                    <div className="bg-sky-400" />
                    <div className="bg-sky-400" />
                    <div className="bg-sky-400" />
                    <div className="bg-sky-400" />
                  </div>
                  <h1 className="text-2xl font-light tracking-wide text-white">Windows</h1>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">11</div>
                  <h1 className="text-xl font-bold text-indigo-300">Windows 11 Setup</h1>
                </div>
              )}
            </div>
            <span className="text-[11px] font-mono opacity-60">Installer Mode (Mouse Enabled)</span>
          </div>

          {/* STEP 1: Language & Region Selection (Visual Exact Match to Uploaded Images) */}
          {state.step === 'installer_language' && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Select your language preferences and click "Next" to continue.
                </p>

                <div className="space-y-3 text-xs max-w-md mx-auto pt-2">
                  {/* Language to Install */}
                  <div className="p-1.5">
                    <label className="block text-slate-400 mb-1 font-semibold">Language to install:</label>
                    <select 
                      value={langInstall}
                      onChange={(e) => setLangInstall(e.target.value)}
                      className={`w-full border px-3 py-1.5 text-xs font-medium rounded cursor-pointer ${
                        os === 'win7' 
                          ? 'bg-white text-slate-900 border-slate-400 hover:border-blue-500' 
                          : 'bg-[#180646] text-white border-indigo-800 hover:border-indigo-500'
                      }`}
                    >
                      {langOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  {/* Time and currency format */}
                  <div className="p-1.5">
                    <label className="block text-slate-400 mb-1 font-semibold">Time and currency format:</label>
                    <select 
                      value={timeFormat}
                      onChange={(e) => setTimeFormat(e.target.value)}
                      className={`w-full border px-3 py-1.5 text-xs font-medium rounded cursor-pointer ${
                        os === 'win7' 
                          ? 'bg-white text-slate-900 border-slate-400 hover:border-blue-500' 
                          : 'bg-[#180646] text-white border-indigo-800 hover:border-indigo-500'
                      }`}
                    >
                      {timeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  {/* Keyboard or input method */}
                  <div className="p-1.5">
                    <label className="block text-slate-400 mb-1 font-semibold">Keyboard or input method:</label>
                    <select 
                      value={keyMethod}
                      onChange={(e) => setKeyMethod(e.target.value)}
                      className={`w-full border px-3 py-1.5 text-xs font-medium rounded cursor-pointer ${
                        os === 'win7' 
                          ? 'bg-white text-slate-900 border-slate-400 hover:border-blue-500' 
                          : 'bg-[#180646] text-white border-indigo-800 hover:border-indigo-500'
                      }`}
                    >
                      {keyOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>

                <p className="text-center text-[11px] text-slate-400 italic pt-2">
                  Enter your language and other preferences and click "Next" to continue.
                </p>
              </div>

              {/* Footer with Copyright and Next Button */}
              <div className="flex items-center justify-between border-t border-slate-400/30 pt-4 text-xs">
                <span className="text-[10px] text-slate-400">
                  {os === 'win7' ? 'Copyright © 2009 Microsoft Corporation. All rights reserved.' : '© Microsoft Corporation. All rights reserved.'}
                </span>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className={`px-6 py-1.5 font-bold text-xs rounded border transition-all cursor-pointer ${
                    os === 'win7'
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-900 border-slate-400 shadow-sm active:bg-slate-400'
                      : 'bg-slate-200 hover:bg-white text-slate-950 border-slate-300 shadow active:bg-slate-300'
                  }`}
                >
                  <span className="underline">N</span>ext &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 1.5: "Install Now" Screen (Matching exact video flow) */}
          {state.step === 'installer_welcome' && (
            <div className="space-y-8 flex-1 flex flex-col justify-between py-6 relative">
              {isStartingSetup ? (
                <div className="my-auto text-center space-y-4 py-12">
                  <Loader2 className="w-10 h-10 text-sky-400 animate-spin mx-auto" />
                  <p className="text-base font-bold text-slate-100">Setup is starting...</p>
                </div>
              ) : (
                <>
                  <div className="my-auto text-center space-y-6">
                    <button
                      type="button"
                      onClick={handleInstallNowClick}
                      className={`px-10 py-3.5 font-bold text-sm rounded-lg border shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                        os === 'win7'
                          ? 'bg-gradient-to-b from-sky-100 via-sky-200 to-sky-300 text-slate-900 border-sky-400 hover:border-blue-600 shadow-sky-500/20'
                          : 'bg-slate-200 hover:bg-white text-slate-950 border-slate-300 shadow-xl'
                      }`}
                    >
                      Install now
                    </button>
                    <p className="text-xs text-slate-400">
                      Click "Install now" to begin the Windows installation wizard.
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-400/30 pt-4 text-xs">
                    <button
                      type="button"
                      onClick={() => alert("System Recovery Options / Command Prompt available after installation in Desktop CMD.")}
                      className="text-sky-400 underline hover:text-sky-300 text-xs cursor-pointer"
                    >
                      Repair your computer
                    </button>

                    <span className="text-[10px] text-slate-400">
                      {os === 'win7' ? 'Windows 7 Setup' : 'Windows 10 Setup'}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 2: Activate / Product Key */}
          {state.step === 'installer_key' && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-base font-bold">Activate Windows</h2>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                  Enter your 25-character product key to activate Windows, or select "I don't have a product key" for trial/lab setup.
                </p>
                <div className="max-w-md p-1">
                  <input
                    type="text"
                    value={productKey}
                    onChange={(e) => setProductKey(e.target.value)}
                    placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-xs text-slate-100 font-mono tracking-wider uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-400/30 pt-4 text-xs">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="text-sky-400 underline hover:text-sky-300 text-xs cursor-pointer"
                >
                  I don't have a product key
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-1.5 font-bold text-xs rounded bg-slate-200 text-slate-950 hover:bg-white shadow cursor-pointer transition-all"
                >
                  <span className="underline">N</span>ext &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Select Edition & License Terms */}
          {state.step === 'installer_edition' && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-base font-bold">Applicable notices and license terms</h2>
                <div className="border rounded p-3 text-xs max-h-36 overflow-y-auto bg-slate-950 text-slate-300 leading-relaxed border-slate-700">
                  <p className="font-bold text-white mb-1">MICROSOFT SOFTWARE LICENSE TERMS</p>
                  <p>MICROSOFT WINDOWS {os.toUpperCase()} OPERATING SYSTEM</p>
                  <p className="mt-2">
                    These license terms are an agreement between Microsoft Corporation and you. Please read them carefully. By installing, copying, or otherwise using the software, you accept these terms.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 text-xs p-2">
                  <input
                    type="checkbox"
                    id="eula"
                    checked={agreedToEula}
                    onChange={(e) => setAgreedToEula(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <label htmlFor="eula" className="text-slate-200 cursor-pointer font-medium">
                    I <span className="underline font-bold">a</span>ccept the license terms
                  </label>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-400/30 pt-4 text-xs">
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!agreedToEula}
                  className={`px-6 py-1.5 font-bold text-xs rounded transition-all cursor-pointer ${
                    agreedToEula
                      ? 'bg-slate-200 text-slate-950 hover:bg-white shadow'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="underline">N</span>ext &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Installation Type (Custom) */}
          {state.step === 'installer_type' && (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-base font-bold">Which type of installation do you want?</h2>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded text-slate-500 opacity-50">
                    <h4 className="font-bold text-xs">Upgrade: Install Windows and keep files, settings, and applications</h4>
                    <p className="text-[11px] mt-1">Not available when booting from installation media.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpdateState({ step: 'installer_partition' })}
                    className={`w-full text-left p-4 rounded border transition-all cursor-pointer group ${
                      os === 'win7'
                        ? 'bg-white hover:bg-sky-50 border-slate-400 text-slate-900 shadow-sm'
                        : 'bg-slate-950 hover:bg-indigo-950/50 border-slate-700 text-white'
                    }`}
                  >
                    <h4 className="font-bold text-xs text-sky-400 group-hover:text-sky-300 flex items-center justify-between">
                      <span><span className="underline font-bold">C</span>ustom: Install Windows only (advanced)</span>
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
              <h2 className="text-lg font-bold flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
                Installing Windows...
              </h2>
              <p className="text-xs text-slate-300">
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
                  className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full transition-all duration-300"
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
