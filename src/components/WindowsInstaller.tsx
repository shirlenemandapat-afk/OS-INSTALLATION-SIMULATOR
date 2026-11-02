import React, { useState, useEffect } from 'react';
import { OSType, SimulationState, TaskRequirement } from '../types';
import { PartitionManager } from './PartitionManager';
import { HelpRubricModal } from './HelpRubricModal';
import { 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft
} from 'lucide-react';

interface WindowsInstallerProps {
  os: OSType;
  task: TaskRequirement;
  state: SimulationState;
  onUpdateState: (updates: Partial<SimulationState>) => void;
  onCompleteInstallation: () => void;
  onRestartComputer?: () => void;
  onShutdownComputer?: () => void;
}

// Authentic Waving Windows 7 Flag SVG (Exact replica of win7_3.jpg and win7_4.jpg)
const Windows7WavingLogo: React.FC<{ className?: string }> = ({ className = "w-20 h-20" }) => (
  <svg viewBox="0 0 140 140" className={className} filter="drop-shadow(0px 6px 14px rgba(0,0,0,0.65))">
    <defs>
      <linearGradient id="flagRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF5A36" />
        <stop offset="45%" stopColor="#EA3923" />
        <stop offset="100%" stopColor="#B01E0F" />
      </linearGradient>
      <linearGradient id="flagGreen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9DE026" />
        <stop offset="45%" stopColor="#7FBA00" />
        <stop offset="100%" stopColor="#558000" />
      </linearGradient>
      <linearGradient id="flagBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38C6FF" />
        <stop offset="45%" stopColor="#00A4EF" />
        <stop offset="100%" stopColor="#006BB3" />
      </linearGradient>
      <linearGradient id="flagYellow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFDE38" />
        <stop offset="45%" stopColor="#FFB900" />
        <stop offset="100%" stopColor="#D68000" />
      </linearGradient>
      <linearGradient id="sheen" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
        <stop offset="40%" stopColor="#ffffff" stopOpacity="0.2" />
        <stop offset="60%" stopColor="#ffffff" stopOpacity="0.0" />
      </linearGradient>
    </defs>

    {/* Top Left - Red */}
    <g>
      <path
        d="M 26 30 C 44 24, 58 36, 68 33 C 68 51, 67 58, 67 65 C 57 69, 42 56, 25 62 Z"
        fill="url(#flagRed)"
      />
      <path
        d="M 26 30 C 44 24, 58 36, 68 33 C 68 44, 67 50, 67 53 C 57 54, 42 44, 25 49 Z"
        fill="url(#sheen)"
      />
    </g>

    {/* Top Right - Green */}
    <g>
      <path
        d="M 74 32 C 86 28, 102 40, 118 36 C 116 54, 115 62, 114 70 C 98 74, 87 61, 73 64 Z"
        fill="url(#flagGreen)"
      />
      <path
        d="M 74 32 C 86 28, 102 40, 118 36 C 116 46, 115 51, 114 55 C 98 56, 87 47, 73 50 Z"
        fill="url(#sheen)"
      />
    </g>

    {/* Bottom Left - Blue */}
    <g>
      <path
        d="M 24 70 C 42 64, 56 76, 67 72 C 67 90, 66 98, 66 106 C 54 110, 40 98, 23 103 Z"
        fill="url(#flagBlue)"
      />
      <path
        d="M 24 70 C 42 64, 56 76, 67 72 C 67 83, 66 89, 66 92 C 54 94, 40 84, 23 88 Z"
        fill="url(#sheen)"
      />
    </g>

    {/* Bottom Right - Yellow */}
    <g>
      <path
        d="M 73 71 C 85 67, 101 79, 116 76 C 114 94, 113 102, 112 110 C 97 114, 85 102, 72 104 Z"
        fill="url(#flagYellow)"
      />
      <path
        d="M 73 71 C 85 67, 101 79, 116 76 C 114 86, 113 91, 112 95 C 97 96, 85 88, 72 90 Z"
        fill="url(#sheen)"
      />
    </g>
  </svg>
);

export const WindowsInstaller: React.FC<WindowsInstallerProps> = ({
  os,
  task,
  state,
  onUpdateState,
  onCompleteInstallation,
  onRestartComputer,
  onShutdownComputer
}) => {
  // Boot sequence states for Windows 7 (win7_1.jpg and win7_2.jpg)
  const [bootPhase, setBootPhase] = useState<'loading_files' | 'starting_windows' | 'ready'>(() => {
    return os === 'win7' && state.step === 'installer_language' ? 'loading_files' : 'ready';
  });
  const [loadingFilesProgress, setLoadingFilesProgress] = useState(15);

  // Step state
  const [agreedToEula, setAgreedToEula] = useState(false);
  const [copyProgress, setCopyProgress] = useState(0);
  const [isStartingSetup, setIsStartingSetup] = useState(false);
  const [restartCountdown, setRestartCountdown] = useState<number | null>(null);

  // Boot phase timers (win7_1.jpg -> win7_2.jpg -> ready)
  useEffect(() => {
    if (bootPhase === 'loading_files') {
      const interval = setInterval(() => {
        setLoadingFilesProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setBootPhase('starting_windows'), 300);
            return 100;
          }
          return prev + 18;
        });
      }, 150);
      return () => clearInterval(interval);
    } else if (bootPhase === 'starting_windows') {
      const timer = setTimeout(() => {
        setBootPhase('ready');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [bootPhase]);

  // Form selections (Exact match to win7_3.jpg)
  const [langInstall, setLangInstall] = useState('English');
  const [timeFormat, setTimeFormat] = useState('English (United States)');
  const [keyMethod, setKeyMethod] = useState('US');
  const [focusedField, setFocusedField] = useState<'lang' | 'time' | 'key'>('lang');

  const langOptions = ['English', 'Spanish', 'French', 'German'];
  const timeOptions = ['English (United States)', 'English (United Kingdom)', 'English (Philippines)', 'Spanish (Mexico)'];
  const keyOptions = ['US', 'United Kingdom', 'Dvorak', 'Spanish'];

  // Screens 1 & 2 have the blue background inside the window
  const isBlueWindowScreen = state.step === 'installer_language' || state.step === 'installer_welcome';

  // Navigation handlers
  const handleNextStep = () => {
    if (state.step === 'installer_language') {
      onUpdateState({ step: 'installer_welcome' });
    } else if (state.step === 'installer_welcome') {
      onUpdateState({ step: 'installer_edition' });
    } else if (state.step === 'installer_edition') {
      if (agreedToEula) {
        onUpdateState({ step: 'installer_type' });
      }
    } else if (state.step === 'installer_type') {
      onUpdateState({ step: 'installer_partition' });
    }
  };

  const handleBackStep = () => {
    if (state.step === 'installer_edition') {
      onUpdateState({ step: 'installer_welcome' });
    } else if (state.step === 'installer_type') {
      onUpdateState({ step: 'installer_edition' });
    } else if (state.step === 'installer_partition') {
      onUpdateState({ step: 'installer_type' });
    }
  };

  const handleInstallNowClick = () => {
    setIsStartingSetup(true);
    setTimeout(() => {
      setIsStartingSetup(false);
      onUpdateState({ step: 'installer_edition' });
    }, 1600);
  };

  // Progress animation for installer copying step
  useEffect(() => {
    if (state.step === 'installer_copying') {
      const interval = setInterval(() => {
        setCopyProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setRestartCountdown(10);
            return 100;
          }
          return prev + 5;
        });
      }, 180);
      return () => clearInterval(interval);
    }
  }, [state.step]);

  // Restart countdown timer
  useEffect(() => {
    if (restartCountdown !== null && restartCountdown > 0) {
      const timer = setTimeout(() => {
        setRestartCountdown(restartCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (restartCountdown === 0) {
      onCompleteInstallation();
    }
  }, [restartCountdown, onCompleteInstallation]);

  const isInstallingStage = state.step === 'installer_copying';

  // 1. BOOT PHASE 1: "Windows is loading files..." (win7_1.jpg)
  if (bootPhase === 'loading_files') {
    return (
      <div className="fixed inset-0 bg-black text-white z-50 flex flex-col justify-between p-8 font-sans select-none">
        {/* Virtual PC Top Bar */}
        <div className="w-full flex items-center justify-between text-xs text-slate-300 border-b border-slate-700 pb-1.5 opacity-80">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-blue-500 inline-block text-[8px] font-bold text-center leading-3">PC</span>
            <span className="font-semibold">webstoretest - Windows Virtual PC</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Action ▾</span>
            <span>Tools ▾</span>
            <span>Ctrl+Alt+Del</span>
            <span>?</span>
            <span className="text-slate-500">|</span>
            <span>_ □ ✕</span>
          </div>
        </div>

        {/* Center Blank */}
        <div className="my-auto" />

        {/* Bottom Loading Bar matching win7_1.jpg */}
        <div className="max-w-xl w-full mx-auto space-y-2 pb-12 text-center">
          <p className="text-sm font-light text-slate-200 tracking-wide font-mono">
            Windows is loading files...
          </p>
          <div className="w-full h-4 bg-[#555555] rounded-[1px] overflow-hidden p-[1px] border border-[#666666]">
            <div 
              className="h-full bg-gradient-to-r from-[#D0D0D0] via-[#E8E8E8] to-[#C0C0C0] transition-all duration-150"
              style={{ width: `${loadingFilesProgress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 2. BOOT PHASE 2: "Starting Windows" with converging lights (win7_2.jpg)
  if (bootPhase === 'starting_windows') {
    return (
      <div 
        onClick={() => setBootPhase('ready')}
        className="fixed inset-0 bg-black text-white z-50 flex flex-col justify-between p-8 font-sans select-none cursor-pointer"
        title="Click to continue"
      >
        {/* Virtual PC Top Bar */}
        <div className="w-full flex items-center justify-between text-xs text-slate-300 border-b border-slate-700 pb-1.5 opacity-80">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-blue-500 inline-block text-[8px] font-bold text-center leading-3">PC</span>
            <span className="font-semibold">webstoretest - Windows Virtual PC</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Action ▾</span>
            <span>Tools ▾</span>
            <span>Ctrl+Alt+Del</span>
            <span>?</span>
            <span className="text-slate-500">|</span>
            <span>_ □ ✕</span>
          </div>
        </div>

        {/* Center: Glowing Windows Flag Logo & "Starting Windows" */}
        <div className="my-auto text-center flex flex-col items-center space-y-6 animate-in fade-in duration-700">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Luminous glow */}
            <div className="absolute inset-0 bg-sky-500/20 blur-xl rounded-full animate-pulse" />
            <Windows7WavingLogo className="w-24 h-24 relative z-10" />
          </div>
          <h2 className="text-2xl font-light tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Starting Windows
          </h2>
        </div>

        {/* Bottom copyright notice matching win7_2.jpg */}
        <div className="text-center pb-6 text-xs text-slate-400 font-light">
          © Microsoft Corporation
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 select-none flex flex-col items-center justify-between z-50 overflow-hidden font-sans"
      style={{
        background: `radial-gradient(ellipse at 50% 38%, #1a74ba 0%, #125e9f 35%, #0a4985 70%, #033465 100%)`
      }}
    >
      {/* Windows 7 Harmony Ambient Light Ribbons (Matches win7_3.jpg and user screenshot image_65d014a4.png) */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
        viewBox="0 0 1920 1080" 
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="centerBlueGlow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#3ca0dc" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#196cb0" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#053360" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="auroraRibbon" x1="0%" y1="20%" x2="100%" y2="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#8de0f7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38b6d8" stopOpacity="0.05" />
          </linearGradient>
          <radialGradient id="cyanBottomGlow" cx="80%" cy="85%" r="45%">
            <stop offset="0%" stopColor="#3ec4b6" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#1a74ba" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#033465" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#centerBlueGlow)" />
        <rect width="1920" height="1080" fill="url(#cyanBottomGlow)" />
        {/* Soft curving light swooshes */}
        <path d="M -100 250 Q 550 150 1200 480 T 2050 420" stroke="url(#auroraRibbon)" strokeWidth="65" fill="none" opacity="0.8" />
        <path d="M -100 320 Q 650 240 1400 580 T 2050 560" stroke="#a0e6ff" strokeWidth="35" fill="none" opacity="0.4" />
        <path d="M 850 1080 Q 1300 750 1700 880 T 2050 780" stroke="#48cfcb" strokeWidth="45" fill="none" opacity="0.2" />
      </svg>

      {/* Floating Task Rubric Help */}
      <HelpRubricModal task={task} selectedOS={os} />

      {/* TOP HEADER CONTROLS (Authentic webstoretest - Windows Virtual PC Bar matching all Illinois screenshots) */}
      <div className="w-full bg-[#1b4366]/90 border-b border-[#3b7fae]/50 px-4 py-1 flex items-center justify-between text-xs text-white z-30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-[2px] flex items-center justify-center font-bold text-[9px] shadow-xs">
            PC
          </div>
          <span className="font-semibold text-xs tracking-tight text-white/95 drop-shadow">
            webstoretest - Windows Virtual PC
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-white/80">
          <span className="hover:text-white cursor-pointer transition-colors">Action ▾</span>
          <span className="hover:text-white cursor-pointer transition-colors">Tools ▾</span>
          <span className="hover:text-white cursor-pointer transition-colors font-mono">Ctrl+Alt+Del</span>
          <span className="hover:text-white cursor-pointer transition-colors">?</span>
          <span className="text-white/30">|</span>
          {onShutdownComputer && (
            <button
              type="button"
              onClick={onShutdownComputer}
              className="hover:text-rose-300 font-normal transition-colors cursor-pointer"
              title="Shut Down Computer"
            >
              Shut Down
            </button>
          )}
          {onRestartComputer && (
            <button
              type="button"
              onClick={onRestartComputer}
              className="hover:text-amber-200 font-normal transition-colors cursor-pointer"
              title="Restart Computer"
            >
              Restart
            </button>
          )}
          <span className="text-white/50 text-[10px]">_ □ ✕</span>
        </div>
      </div>

      {/* SCREEN 2.5: "Setup is starting..." (Exact replica of win7_5.jpg - Fullscreen without window box) */}
      {isStartingSetup ? (
        <div className="my-auto text-center space-y-5 py-24 z-20 animate-in fade-in duration-200">
          <h2 className="text-2xl font-light text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] tracking-wide">
            Setup is starting...
          </h2>
          {/* Windows 7 Aero spinning busy ring cursor matching win7_5.jpg */}
          <div className="w-9 h-9 rounded-full border-4 border-[#6EE7F9] border-t-transparent border-r-cyan-200 animate-spin mx-auto drop-shadow-md" />
        </div>
      ) : (
        /* MAIN INSTALLER WINDOW (Authentic Aero Frame matching win7_3.jpg to win7_9.jpg) */
        <div 
          className={`w-full max-w-[730px] my-auto overflow-hidden shadow-[0_16px_45px_rgba(0,0,0,0.55)] transition-all relative z-10 border border-[#4a779f] rounded-[4px] flex flex-col ${
            isBlueWindowScreen 
              ? 'bg-[#18537d]' 
              : 'bg-white'
          }`}
          style={
            isBlueWindowScreen
              ? {
                  background: `radial-gradient(ellipse at 50% 28%, #256ca0 0%, #175280 55%, #0f3d64 85%, #0a2d4b 100%)`
                }
              : undefined
          }
        >
        {/* TITLE BAR (Exact replica of Aero Glass title bar with Back Button) */}
        <div 
          className="px-3 py-1 flex items-center justify-between text-xs border-b border-[#315d82]"
          style={{
            background: 'linear-gradient(to bottom, #dbebfb 0%, #bbd8f4 45%, #9bc2ea 55%, #83aede 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85)'
          }}
        >
          {/* Left: Back button (if available) + Windows Flag + Title */}
          <div className="flex items-center gap-2">
            {!isBlueWindowScreen && !isInstallingStage && (
              <button
                type="button"
                onClick={handleBackStep}
                className="w-5 h-5 rounded-full bg-gradient-to-b from-[#4BA1E8] to-[#1C60A0] hover:from-[#62B2F2] hover:to-[#2A75BD] border border-[#164573] flex items-center justify-center text-white shadow-xs cursor-pointer active:scale-95"
                title="Back"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
            )}

            {/* Small Windows Flag Icon */}
            <div className="grid grid-cols-2 gap-[1px] w-3.5 h-3.5 shrink-0 shadow-xs">
              <div className="bg-[#EA3923] rounded-tl-[1px]" />
              <div className="bg-[#7FBA00] rounded-tr-[1px]" />
              <div className="bg-[#00A4EF] rounded-bl-[1px]" />
              <div className="bg-[#FFB900] rounded-br-[1px]" />
            </div>
            <span className="font-normal text-[#122b44] text-[12px] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
              Install Windows
            </span>
          </div>

          {/* Right: Window Controls */}
          <div className="flex items-center border border-[#769abb] rounded-[2px] overflow-hidden bg-gradient-to-b from-white/60 to-white/20 shadow-xs">
            <span className="w-5 h-4 flex items-center justify-center text-[#244b6e] text-[9px] cursor-default border-r border-[#88a9c7]">_</span>
            <span className="w-5 h-4 flex items-center justify-center text-slate-400 text-[8px] cursor-not-allowed border-r border-[#88a9c7]">□</span>
            <button 
              type="button"
              onClick={onShutdownComputer}
              className="w-6 h-4 flex items-center justify-center bg-transparent hover:bg-[#E81123] hover:text-white text-[#244b6e] text-[9px] cursor-pointer transition-colors"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* SCREEN 1: LANGUAGE & PREFERENCES (Exact replica of win7_3.jpg) */}
        {state.step === 'installer_language' && (
          <form 
            onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}
            className="p-8 min-h-[440px] flex flex-col justify-between relative text-white"
          >
            {/* Center Top: Waving Logo Flag + "Windows 7" text */}
            <div className="pt-2 text-center flex flex-col items-center">
              <Windows7WavingLogo className="w-24 h-24 mb-1" />
              <h1 className="text-[32px] font-light tracking-wide text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)]">
                Windows 7
              </h1>
            </div>

            {/* Dropdown controls */}
            <div className="max-w-[460px] w-full mx-auto space-y-3 pt-2">
              <div className="flex items-center justify-end gap-3 text-xs">
                <label htmlFor="lang-select" className="font-normal text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] cursor-pointer select-none">
                  Langua<span className="underline">g</span>e to install:
                </label>
                <div className="w-[260px] relative">
                  <select
                    id="lang-select"
                    value={langInstall}
                    onFocus={() => setFocusedField('lang')}
                    onChange={(e) => setLangInstall(e.target.value)}
                    className={`w-full text-xs py-1 px-2.5 border rounded-[2px] cursor-pointer appearance-none ${
                      focusedField === 'lang'
                        ? 'bg-[#0B2A66] text-white border-[#70A0D0] ring-1 ring-white/60'
                        : 'bg-white text-black border-[#7F9DB9]'
                    }`}
                  >
                    {langOptions.map(o => <option key={o} value={o} className="bg-white text-black">{o}</option>)}
                  </select>
                  <div className="absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-b from-[#F2F2F2] via-[#E6E6E6] to-[#D0D0D0] border-l border-[#A0A0A0] rounded-r-[2px] flex items-center justify-center pointer-events-none">
                    <span className="text-[8px] text-black">▼</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 text-xs">
                <label htmlFor="time-select" className="font-normal text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] cursor-pointer select-none">
                  <span className="underline">T</span>ime and currency format:
                </label>
                <div className="w-[260px] relative">
                  <select
                    id="time-select"
                    value={timeFormat}
                    onFocus={() => setFocusedField('time')}
                    onChange={(e) => setTimeFormat(e.target.value)}
                    className={`w-full text-xs py-1 px-2.5 border rounded-[2px] cursor-pointer appearance-none ${
                      focusedField === 'time'
                        ? 'bg-[#0B2A66] text-white border-[#70A0D0] ring-1 ring-white/60'
                        : 'bg-white text-black border-[#7F9DB9]'
                    }`}
                  >
                    {timeOptions.map(o => <option key={o} value={o} className="bg-white text-black">{o}</option>)}
                  </select>
                  <div className="absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-b from-[#F2F2F2] via-[#E6E6E6] to-[#D0D0D0] border-l border-[#A0A0A0] rounded-r-[2px] flex items-center justify-center pointer-events-none">
                    <span className="text-[8px] text-black">▼</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 text-xs">
                <label htmlFor="key-select" className="font-normal text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] cursor-pointer select-none">
                  <span className="underline">K</span>eyboard or input method:
                </label>
                <div className="w-[260px] relative">
                  <select
                    id="key-select"
                    value={keyMethod}
                    onFocus={() => setFocusedField('key')}
                    onChange={(e) => setKeyMethod(e.target.value)}
                    className={`w-full text-xs py-1 px-2.5 border rounded-[2px] cursor-pointer appearance-none ${
                      focusedField === 'key'
                        ? 'bg-[#0B2A66] text-white border-[#70A0D0] ring-1 ring-white/60'
                        : 'bg-white text-black border-[#7F9DB9]'
                    }`}
                  >
                    {keyOptions.map(o => <option key={o} value={o} className="bg-white text-black">{o}</option>)}
                  </select>
                  <div className="absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-b from-[#F2F2F2] via-[#E6E6E6] to-[#D0D0D0] border-l border-[#A0A0A0] rounded-r-[2px] flex items-center justify-center pointer-events-none">
                    <span className="text-[8px] text-black">▼</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] pt-4">
              Enter your language and other preferences and click "Next" to continue.
            </p>

            <div className="flex items-center justify-between pt-6 text-xs border-t border-white/20">
              <span className="text-[11px] text-white/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                Copyright © 2009 Microsoft Corporation. All rights reserved.
              </span>

              <button
                type="submit"
                className="px-7 py-1 bg-gradient-to-b from-[#F2F2F2] via-[#EBEBEB] to-[#D4D4D4] border border-[#707070] hover:border-[#3C7FB1] hover:shadow-[0_0_6px_rgba(60,127,177,0.8)] active:bg-[#C8C8C8] text-black text-xs font-normal rounded-[3px] shadow-sm cursor-pointer transition-all"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* SCREEN 2: "INSTALL NOW" (Exact replica of win7_4.jpg) */}
        {state.step === 'installer_welcome' && (
          <div className="p-8 min-h-[440px] flex flex-col justify-between relative text-white">
            <div className="pt-2 text-center flex flex-col items-center">
              <Windows7WavingLogo className="w-24 h-24 mb-1" />
              <h1 className="text-[32px] font-light tracking-wide text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)]">
                Windows 7
              </h1>
            </div>

            {/* The Famous "Install now" Button matching win7_4.jpg */}
            <div className="text-center my-auto py-6">
              <button
                type="button"
                onClick={handleInstallNowClick}
                className="px-10 py-2.5 bg-gradient-to-b from-[#356d9a]/80 to-[#1e4a6e]/90 hover:from-[#4382b6]/90 hover:to-[#285b85] border border-[#6b9dcd] hover:border-[#9ac2ea] shadow-[0_4px_14px_rgba(0,0,0,0.4)] text-white font-normal text-sm rounded-[3px] cursor-pointer transition-all active:scale-[0.98] inline-flex items-center gap-3"
              >
                <span><span className="underline">I</span>nstall now</span>
                {/* Blue glossy circular arrow icon */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-b from-[#5bb3f4] to-[#1c6bb5] border border-white/60 flex items-center justify-center shadow-xs">
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
            </div>

            {/* Bottom Links matching win7_4.jpg */}
            <div className="flex items-center justify-between pt-6 text-xs border-t border-white/20">
              <div className="space-y-1 text-left">
                <div>
                  <button
                    type="button"
                    onClick={() => alert("What to know before installing Windows:\n\n• Minimum 1 GHz processor, 1 GB RAM (32-bit) / 2 GB RAM (64-bit).\n• Clean install requires creating and formatting NTFS partitions.\n• Boot Order: USB Flash Drive must be set as 1st boot device in BIOS.\n• SATA Mode: Configured to IDE or AHCI.")}
                    className="text-white hover:underline cursor-pointer drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                  >
                    What to know before installing Windows
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => alert("System Recovery Options:\n\n• Startup Repair\n• System Restore\n• System Image Recovery\n• Windows Memory Diagnostic\n• Command Prompt")}
                    className="text-white hover:underline cursor-pointer drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                  >
                    Repair your computer
                  </button>
                </div>
              </div>

              <span className="text-[11px] text-white/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] self-end">
                Copyright © 2009 Microsoft Corporation. All rights reserved.
              </span>
            </div>
          </div>
        )}

        {/* SCREEN 3: LICENSE TERMS (Exact replica of win7_6.jpg) */}
        {state.step === 'installer_edition' && (
          <form 
            onSubmit={(e) => { e.preventDefault(); if (agreedToEula) handleNextStep(); }}
            className="p-8 min-h-[440px] flex flex-col justify-between bg-white text-slate-800"
          >
            <div className="space-y-3">
              <h2 className="text-[17px] font-normal text-[#1E395B]">
                Please read the license terms
              </h2>

              {/* License box matching win7_6.jpg */}
              <div className="border border-[#828790] p-4 text-xs max-h-56 overflow-y-auto bg-white text-black leading-relaxed space-y-3">
                <p className="font-bold">MICROSOFT SOFTWARE LICENSE TERMS</p>
                <p className="font-bold">WINDOWS 7 ENTERPRISE / PROFESSIONAL</p>
                <p>
                  Your use of this software is subject to the terms and conditions of your volume license agreement. You may not use this software if you are not a volume license customer or if you have not acquired a license for the software under your volume license agreement.
                </p>
                <p>
                  EULAID:Win7_RM.0_E_VL_en-us
                </p>
              </div>

              {/* Checkbox matching win7_6.jpg */}
              <div className="flex items-center gap-2 pt-2 text-xs">
                <input
                  type="checkbox"
                  id="eula-terms"
                  checked={agreedToEula}
                  onChange={(e) => setAgreedToEula(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 rounded-[1px] border-[#828790] cursor-pointer"
                />
                <label htmlFor="eula-terms" className="text-black cursor-pointer select-none">
                  I <span className="underline">a</span>ccept the license terms
                </label>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 pt-3 text-xs">
              <button
                type="submit"
                disabled={!agreedToEula}
                className={`px-7 py-1 text-xs font-normal rounded-[3px] border transition-all cursor-pointer ${
                  agreedToEula
                    ? 'bg-gradient-to-b from-[#F2F2F2] via-[#EBEBEB] to-[#D4D4D4] border-[#707070] hover:border-[#3C7FB1] hover:shadow-[0_0_6px_rgba(60,127,177,0.8)] text-black shadow-xs'
                    : 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* SCREEN 4: WHICH TYPE OF INSTALLATION DO YOU WANT? (Exact replica of win7_7.jpg) */}
        {state.step === 'installer_type' && (
          <div className="p-8 min-h-[440px] flex flex-col justify-between bg-white text-slate-800">
            <div className="space-y-4">
              <h2 className="text-[17px] font-normal text-[#1E395B]">
                Which type of installation do you want?
              </h2>

              <div className="space-y-4 pt-2">
                {/* Upgrade Option Card */}
                <div className="p-4 border border-[#A0A0A0]/40 rounded-[2px] bg-white opacity-60 flex items-start gap-4 cursor-not-allowed">
                  {/* Upgrade Icon: 2 monitors + green curved arrow */}
                  <div className="w-12 h-10 shrink-0 relative">
                    <div className="w-9 h-7 bg-slate-100 border border-slate-400 rounded-[1px] absolute left-0 top-0 shadow-xs" />
                    <div className="w-9 h-7 bg-slate-200 border border-slate-500 rounded-[1px] absolute right-0 bottom-0 shadow-xs" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-emerald-600 font-bold text-lg">↻</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[#0066CC] text-xs font-normal">
                      Upgrade
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Upgrade to a newer version of Windows and keep your files, settings, and programs. The option to upgrade is only available when an existing version of Windows is running. We recommend backing up your files before you proceed.
                    </p>
                  </div>
                </div>

                {/* Custom (advanced) Option Card matching win7_7.jpg */}
                <button
                  type="button"
                  onClick={() => onUpdateState({ step: 'installer_partition' })}
                  className="w-full text-left p-4 border border-[#A0A0A0]/60 hover:border-[#7DA2CE] hover:bg-[#F2F7FD] rounded-[2px] transition-all cursor-pointer group flex items-start gap-4 shadow-xs"
                >
                  {/* Custom Icon: Monitor + document checklist */}
                  <div className="w-12 h-10 shrink-0 relative">
                    <div className="w-9 h-7 bg-blue-50 border border-blue-400 rounded-[1px] shadow-xs" />
                    <div className="w-6 h-8 bg-white border border-slate-400 rounded-[1px] absolute right-0 bottom-0 p-1 flex flex-col justify-around shadow-xs">
                      <div className="w-full h-0.5 bg-blue-500" />
                      <div className="w-full h-0.5 bg-slate-300" />
                      <div className="w-full h-0.5 bg-slate-300" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[#0066CC] text-xs font-normal group-hover:underline">
                      <span className="underline">C</span>ustom (advanced)
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Install a new copy of Windows. This option does not keep your files, settings, and programs. The option to make changes to disks and partitions is available when you start your computer using the installation disc. We recommend backing up your files before you proceed.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Left Help Link matching win7_7.jpg */}
            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => alert("Installation Guidance:\n\n• For clean OS installations and lab grading tasks, choose 'Custom (advanced)' to configure Drive 0 partitions.\n• Upgrade is disabled during boot media installation.")}
                className="text-[#0066CC] hover:text-[#004B99] hover:underline text-xs cursor-pointer"
              >
                Help me decide
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 5: PARTITIONING SCREEN (PartitionManager - win7_8.jpg) */}
        {state.step === 'installer_partition' && (
          <div className="p-8 min-h-[440px] flex flex-col justify-between bg-white text-slate-800">
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
          </div>
        )}

        {/* SCREEN 6: INSTALLING WINDOWS CHECKLIST (Exact replica of win7_9.jpg) */}
        {state.step === 'installer_copying' && (
          <div className="p-8 min-h-[440px] flex flex-col justify-between bg-white text-slate-800">
            <div className="space-y-4">
              <h2 className="text-[17px] font-normal text-[#1E395B]">
                Installing Windows...
              </h2>
              <p className="text-xs text-slate-700">
                That's all the information we need right now. Your computer will restart several times during installation.
              </p>

              {/* 5-step checklist directly on white background matching win7_9.jpg */}
              <div className="space-y-2 text-xs text-left max-w-sm pt-4 pl-4">
                <div className="flex items-center gap-2 text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Copying Windows files</span>
                </div>

                <div className={`flex items-center gap-2 ${copyProgress >= 15 ? 'text-slate-900 font-normal' : 'text-slate-400'}`}>
                  {copyProgress >= 100 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : copyProgress >= 15 ? (
                    <span className="w-4 h-4 text-blue-600 animate-spin flex items-center justify-center shrink-0">⏳</span>
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 inline-block shrink-0" />
                  )}
                  <span>
                    Expanding Windows files {copyProgress > 0 ? `(${copyProgress}%)...` : ''}
                  </span>
                </div>

                <div className={`flex items-center gap-2 ${copyProgress >= 80 ? 'text-slate-800' : 'text-slate-400'}`}>
                  {copyProgress >= 80 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 inline-block shrink-0" />
                  )}
                  <span>Installing features</span>
                </div>

                <div className={`flex items-center gap-2 ${copyProgress >= 95 ? 'text-slate-800' : 'text-slate-400'}`}>
                  {copyProgress >= 95 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 inline-block shrink-0" />
                  )}
                  <span>Installing updates</span>
                </div>

                <div className={`flex items-center gap-2 ${copyProgress >= 100 ? 'text-slate-800' : 'text-slate-400'}`}>
                  {copyProgress >= 100 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 inline-block shrink-0" />
                  )}
                  <span>Completing installation</span>
                </div>
              </div>
            </div>

            {/* Restart Countdown Prompt */}
            {restartCountdown !== null && (
              <div className="flex items-center justify-between p-3 bg-[#F0F8FF] border border-[#B0D0F0] rounded-[2px] text-xs text-[#1E395B] animate-in fade-in duration-200">
                <span>
                  Windows needs to restart to continue. Restarting in <strong>{restartCountdown}</strong> seconds...
                </span>
                <button
                  type="button"
                  onClick={onCompleteInstallation}
                  className="px-4 py-1 bg-gradient-to-b from-[#F2F2F2] to-[#D4D4D4] hover:border-[#3C7FB1] border border-[#707070] text-black text-xs rounded-[3px] shadow-xs cursor-pointer"
                >
                  Restart now
                </button>
              </div>
            )}
          </div>
        )}

        </div>
      )}

      {/* AUTHENTIC WINDOWS 7 SETUP SCREEN BOTTOM BAR (Only appears on installation steps win7_6.jpg - win7_9.jpg) */}
      {!isBlueWindowScreen && (
        <div className="w-full bg-gradient-to-b from-[#1f6394]/95 to-[#164c74]/95 border-t border-[#488cb9]/80 py-2.5 px-8 z-20 shadow-lg select-none">
          {/* Top thin green progress track */}
          <div className="w-full bg-[#103754] h-1.5 rounded-full overflow-hidden flex mb-2 border border-[#2b658d]/50">
            {/* Section 1 progress */}
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: '50%',
                backgroundColor: '#62c755'
              }} 
            />
            {/* Section 2 progress */}
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: `${(copyProgress / 100) * 50}%`,
                backgroundColor: '#62c755'
              }} 
            />
          </div>

          {/* Bottom Numbers & Labels: 1 Collecting information | 2 Installing Windows */}
          <div className="flex items-center gap-12 text-xs">
            {/* Step 1 */}
            <div className={`flex items-center gap-2 ${!isInstallingStage ? 'text-white font-normal' : 'text-white/60'}`}>
              <span className="text-lg font-light">1</span>
              <span>Collecting information</span>
            </div>

            {/* Step 2 */}
            <div className={`flex items-center gap-2 ${isInstallingStage ? 'text-white font-normal' : 'text-white/60'}`}>
              <span className="text-lg font-light">2</span>
              <span>Installing Windows</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
