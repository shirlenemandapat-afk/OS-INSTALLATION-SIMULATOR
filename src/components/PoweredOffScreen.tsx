import React from 'react';
import { Power, Cpu, Monitor, Zap } from 'lucide-react';

interface PoweredOffScreenProps {
  onPowerOn: () => void;
}

export const PoweredOffScreen: React.FC<PoweredOffScreenProps> = ({ onPowerOn }) => {
  return (
    <div className="fixed inset-0 bg-black text-slate-100 flex flex-col items-center justify-center p-6 z-50 font-sans select-none">
      {/* PC Tower / Monitor Hardware Box */}
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

        <div className="w-20 h-20 bg-slate-900 border-2 border-slate-800 rounded-full flex items-center justify-center mx-auto shadow-inner relative">
          <Power className="w-10 h-10 text-rose-500/80 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full ring-4 ring-slate-950 animate-ping" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-200 tracking-wide uppercase">
            SIMULATOR POWERED OFF
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The computer system has safely shut down. Press the hardware power button below to boot up the PC.
          </p>
        </div>

        {/* Hardware Status Specs */}
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-left space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-sky-400" /> Display Output:
            </span>
            <span className="font-mono text-slate-200 font-bold">No Signal (Standby)</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" /> Motherboard Power:
            </span>
            <span className="font-mono text-slate-200 font-bold">5V Standby (S5 State)</span>
          </div>
        </div>

        {/* Power On Button */}
        <button
          onClick={onPowerOn}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-emerald-400/40"
        >
          <Zap className="w-5 h-5 text-amber-300 animate-bounce" />
          <span>POWER ON COMPUTER</span>
        </button>

        <p className="text-[11px] text-slate-500">
          💡 Tip: During startup, press <kbd className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono font-bold">DEL</kbd> or <kbd className="bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded border border-slate-700 font-mono font-bold">F2</kbd> on your physical keyboard to enter BIOS.
        </p>
      </div>
    </div>
  );
};
