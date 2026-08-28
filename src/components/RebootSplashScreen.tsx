import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, Keyboard, Terminal, Smartphone, Settings, Play } from 'lucide-react';
import { BiosConfig, OSType } from '../types';

interface RebootSplashScreenProps {
  diskSizeGB: number;
  biosConfig: BiosConfig;
  selectedOS?: OSType;
  onEnterBios: () => void;
  onBootInstaller: () => void;
}

export const RebootSplashScreen: React.FC<RebootSplashScreenProps> = ({
  diskSizeGB,
  biosConfig,
  selectedOS = 'win10',
  onEnterBios,
  onBootInstaller
}) => {
  const [progress, setProgress] = useState(15);
  const [bootFailed, setBootFailed] = useState(false);
  const [enteringStatus, setEnteringStatus] = useState<string | null>(null);
  const isNavigatingRef = useRef(false);

  // Trigger entering BIOS with visual status feedback
  const triggerEnterBios = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setEnteringStatus('Entering System Setup (BIOS)...');
    setTimeout(() => {
      onEnterBios();
    }, 650);
  }, [onEnterBios]);

  // Trigger entering Boot Manager
  const triggerBootMenu = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setEnteringStatus('Entering BIOS Boot Manager...');
    setTimeout(() => {
      onEnterBios();
    }, 700);
  }, [onEnterBios]);

  // Keyboard listener for physical F2, DEL, F12, F10, F1
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 or DEL -> System Setup (BIOS)
      if (
        e.key === 'F2' ||
        e.key === 'f2' ||
        e.key === 'Delete' ||
        e.key === 'Del'
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerEnterBios();
        return;
      }

      // F12 -> Boot Manager / PXE
      if (e.key === 'F12' || e.key === 'f12') {
        e.preventDefault();
        e.stopPropagation();
        triggerBootMenu();
        return;
      }

      // F10 -> System Services / Setup
      if (e.key === 'F10' || e.key === 'f10') {
        e.preventDefault();
        e.stopPropagation();
        setEnteringStatus('Entering System Services...');
        setTimeout(() => {
          triggerEnterBios();
        }, 600);
        return;
      }

      // F1 -> Retry boot if failed
      if (bootFailed && (e.key === 'F1' || e.key === 'f1')) {
        e.preventDefault();
        setBootFailed(false);
        setProgress(20);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [triggerEnterBios, triggerBootMenu, bootFailed]);

  // Progress bar animation to simulate POST hardware initialization
  useEffect(() => {
    if (bootFailed || enteringStatus) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Check boot order
          if (biosConfig.bootOrder[0] === 'usb') {
            onBootInstaller();
          } else {
            setBootFailed(true);
          }
          return 100;
        }
        return prev + 14;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [biosConfig.bootOrder, onBootInstaller, bootFailed, enteringStatus]);

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col justify-between p-3 sm:p-8 md:p-12 font-mono select-none overflow-y-auto">
      
      {/* Top Right Corner Status / Key Legend */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5 text-xs text-sky-400 bg-sky-950/40 px-2 py-1 rounded border border-sky-800/60">
          <Smartphone className="w-3.5 h-3.5" />
          <span className="text-[11px]">Touchscreen / CP Ready</span>
        </div>

        <div className="text-right text-xs sm:text-sm text-slate-200 tracking-wider space-y-0.5 leading-tight select-none">
          <div className={`${enteringStatus?.includes('Setup') ? 'text-cyan-300 font-bold' : 'text-slate-300'}`}>
            F2 = System Setup
          </div>
          <div className="text-slate-300">
            F10 = System Services
          </div>
          {enteringStatus && (
            <div className="text-cyan-400 font-bold animate-pulse pt-0.5 pb-0.5">
              {enteringStatus}
            </div>
          )}
          <div className={`${enteringStatus?.includes('Boot Manager') ? 'text-cyan-300 font-bold' : 'text-slate-300'}`}>
            F12 = PXE Boot
          </div>
        </div>
      </div>

      {/* Main Center Area: Authentic Dell Logo & Reference Image UI */}
      <div className="my-auto flex flex-col items-center justify-center text-center w-full max-w-xl mx-auto space-y-6 sm:space-y-8 py-4">
        {!bootFailed ? (
          <>
            {/* Authentic Dell Brand Logo with tilted E */}
            <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
              <svg
                viewBox="0 0 420 130"
                className="w-48 sm:w-80 md:w-96 h-auto drop-shadow-md"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g fill="#0000FF">
                  {/* Letter D */}
                  <path d="M 20 15 L 75 15 C 105 15, 125 35, 125 65 C 125 95, 105 115, 75 115 L 20 115 Z M 52 40 L 52 90 L 72 90 C 88 90, 96 80, 96 65 C 96 50, 88 40, 72 40 Z" />
                  
                  {/* Letter E (Tilted at 30 degrees) */}
                  <g transform="translate(170, 65) rotate(-33) translate(-170, -65)">
                    <path d="M 135 15 L 205 15 L 205 40 L 165 40 L 165 52 L 200 52 L 200 77 L 165 77 L 165 90 L 205 90 L 205 115 L 135 115 Z" />
                  </g>
                  
                  {/* Letter L (First) */}
                  <path d="M 225 15 L 257 15 L 257 90 L 295 90 L 295 115 L 225 115 Z" />
                  
                  {/* Letter L (Second) */}
                  <path d="M 310 15 L 342 15 L 342 90 L 380 90 L 380 115 L 310 115 Z" />
                </g>
              </svg>

              {/* Sub-text under logo: www.dell.com */}
              <p className="text-white text-xs sm:text-sm tracking-[0.35em] font-mono select-none uppercase">
                w w w . d e l l . c o m
              </p>
            </div>

            {/* Model Name, Loading Progress Bar & BIOS Revision */}
            <div className="flex flex-col items-center space-y-2 w-full max-w-xs pt-2 sm:pt-4">
              <span className="text-white text-xs sm:text-sm font-mono tracking-wider font-semibold">
                PowerEdge T710
              </span>

              {/* Rectangular Progress Bar with thin white border */}
              <div className="w-56 sm:w-64 h-4 bg-black border border-white p-[2px] overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="text-white text-xs font-mono tracking-wider">
                BIOS Revision 6.1.0
              </span>
            </div>

            {/* Prominent Touch / Mobile Quick Action Buttons for Cellphones */}
            <div className="w-full pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={triggerEnterBios}
                className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl border border-blue-400/50 shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm cursor-pointer min-h-[48px]"
              >
                <Settings className="w-4 h-4 text-cyan-300 animate-spin" />
                <span>Tap to Enter BIOS Setup (F2)</span>
              </button>

              <button
                type="button"
                onClick={triggerBootMenu}
                className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-xl border border-slate-700 shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm cursor-pointer min-h-[48px]"
              >
                <Play className="w-4 h-4 text-emerald-400" />
                <span>Boot Menu (F12)</span>
              </button>
            </div>
          </>
        ) : (
          /* Authentic Dell POST Boot Device Failure Screen */
          <div className="w-full max-w-lg bg-black text-left text-xs sm:text-sm font-mono space-y-4 border-l-4 border-amber-500 pl-4 py-2">
            <div className="text-white space-y-1">
              <p className="font-bold text-rose-400">No boot device available.</p>
              <p className="text-slate-300">Current 1st Boot Priority: <span className="text-amber-300 uppercase font-bold">{biosConfig.bootOrder[0] === 'hdd' ? 'Hard Drive (Drive 0)' : biosConfig.bootOrder[0]}</span></p>
              <p className="text-slate-400">SATA 0: Installed (Virtual {diskSizeGB} GB SSD - No OS Found)</p>
              <p className="text-slate-400">USB Device: Connected (Bootable Windows Installer)</p>
            </div>

            <div className="pt-2 text-slate-200 space-y-3">
              <p className="text-cyan-300 font-bold animate-pulse">
                Strike F1 to retry boot, F2 for system setup utility
              </p>
              
              {/* Touchscreen Action Buttons for Boot Failure */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={triggerEnterBios}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg border border-blue-400 shadow flex items-center justify-center gap-2 active:scale-95 cursor-pointer text-xs min-h-[44px]"
                >
                  <Settings className="w-4 h-4 text-cyan-300" />
                  <span>Enter BIOS to Set USB First (F2)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBootFailed(false);
                    setProgress(20);
                  }}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 shadow flex items-center justify-center gap-2 active:scale-95 cursor-pointer text-xs min-h-[44px]"
                >
                  <span>Retry Boot (F1)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Interactive Keyboard & Touch Helper Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-900 pt-3">
        <div className="flex items-center gap-2 text-slate-300 flex-wrap">
          <Keyboard className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
          <span className="text-[11px] sm:text-xs">Physical Key / Screen Touch:</span>
          <button
            type="button"
            onClick={triggerEnterBios}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 rounded font-mono font-bold text-[11px] transition-all active:scale-95 cursor-pointer shadow"
          >
            [ F2 ] System Setup
          </button>
          <button
            type="button"
            onClick={triggerBootMenu}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded font-mono font-bold text-[11px] transition-all active:scale-95 cursor-pointer shadow"
          >
            [ F12 ] Boot Menu
          </button>
        </div>

        <div className="text-[11px] text-slate-400">
          Target OS: <span className="text-white font-bold uppercase">{selectedOS === 'win7' ? 'Windows 7' : selectedOS === 'win10' ? 'Windows 10' : 'Windows 11'}</span> | Dell Inc. System POST
        </div>
      </div>
    </div>
  );
};
