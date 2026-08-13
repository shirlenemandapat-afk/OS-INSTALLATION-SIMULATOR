import React, { useState, useEffect } from 'react';
import { OSType, StudentInfo } from '../types';
import { User, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface OobeSimulatorProps {
  os: OSType;
  student: StudentInfo;
  onFinishOobe: () => void;
}

export const OobeSimulator: React.FC<OobeSimulatorProps> = ({ os, student, onFinishOobe }) => {
  const [username, setUsername] = useState(student.name || 'StudentUser');
  const [oobeStep, setOobeStep] = useState<'account' | 'privacy' | 'welcome'>('account');

  useEffect(() => {
    if (oobeStep === 'welcome') {
      const timer = setTimeout(() => {
        onFinishOobe();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [oobeStep]);

  return (
    <div className="fixed inset-0 select-none bg-slate-950 text-slate-100 flex items-center justify-center p-4 z-50">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {oobeStep === 'account' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-2xl mx-auto flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Who is going to use this PC?</h2>
              <p className="text-xs text-slate-400">
                Create a user account to log into {os.toUpperCase()}.
              </p>
            </div>

            <div className="text-left max-w-sm mx-auto space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">User Name:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setOobeStep('privacy')}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        )}

        {oobeStep === 'privacy' && (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-emerald-600/20 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Choose privacy settings for your device</h2>
              <p className="text-xs text-slate-400">
                Configure diagnostic & location options.
              </p>
            </div>

            <div className="text-left space-y-2 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span>Location Services</span>
                <span className="text-emerald-400 font-bold">Yes</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Diagnostic Data</span>
                <span className="text-emerald-400 font-bold">Required Only</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setOobeStep('welcome')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Accept & Complete
              </button>
            </div>
          </div>
        )}

        {oobeStep === 'welcome' && (
          <div className="space-y-6 py-8">
            <Sparkles className="w-12 h-12 text-blue-400 mx-auto animate-spin" />
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">Hi {username}!</h2>
              <p className="text-sm text-slate-300">Getting things ready for you...</p>
              <p className="text-xs text-slate-500">Evaluating configuration accuracy & generating rubric score...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
