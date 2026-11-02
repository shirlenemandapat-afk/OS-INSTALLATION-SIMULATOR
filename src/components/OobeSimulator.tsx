import React, { useState, useEffect } from 'react';
import { OSType, StudentInfo } from '../types';
import { 
  User, ShieldCheck, Sparkles, Key, Lock, Clock, Calendar, 
  Wifi, Home, Building2, Coffee, Check, AlertCircle, HelpCircle,
  Shield, CheckCircle2, Monitor, ArrowRight, Volume2, Mic, Globe,
  CheckSquare, HelpCircle as QuestionIcon, ToggleLeft, ToggleRight,
  Laptop, Server, Compass
} from 'lucide-react';

interface OobeSimulatorProps {
  os: OSType;
  student: StudentInfo;
  onFinishOobe: () => void;
}

export const OobeSimulator: React.FC<OobeSimulatorProps> = ({ os, student, onFinishOobe }) => {
  // Account Information
  const [username, setUsername] = useState(student.name || 'Student');
  const [computerName, setComputerName] = useState(`${(student.name || 'Student').replace(/\s+/g, '')}-PC`);
  
  // Password Configuration
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordHint, setPasswordHint] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Security Questions for Windows 10
  const [q1, setQ1] = useState("What was your first pet's name?");
  const [a1, setA1] = useState('');
  const [q2, setQ2] = useState("What was the name of the city where you were born?");
  const [a2, setA2] = useState('');
  const [q3, setQ3] = useState("What was your childhood nickname?");
  const [a3, setA3] = useState('');

  // Product Key & KMS Activation (Win 7)
  const [productKey, setProductKey] = useState('');
  const [autoActivateOnline, setAutoActivateOnline] = useState(true);

  // Update Settings Mode (Win 7)
  const [updateMode, setUpdateMode] = useState<'recommended' | 'important' | 'later'>('recommended');

  // Date & Time Settings (Win 7)
  const [timeZone, setTimeZone] = useState('(UTC-06:00) Central Time (US & Canada)');
  const [autoDst, setAutoDst] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().slice(0, 10));
  const [currentTime, setCurrentTime] = useState(new Date().toTimeString().slice(0, 5));

  // Network Location (Win 7)
  const [networkLocation, setNetworkLocation] = useState<'home' | 'work' | 'public'>('work');

  // Windows 10 Specific States
  const [selectedRegion, setSelectedRegion] = useState('United States');
  const [selectedKeyboard, setSelectedKeyboard] = useState('US');
  const [setupType, setSetupType] = useState<'personal' | 'org'>('personal');
  const [privacySettings, setPrivacySettings] = useState({
    speech: true,
    location: true,
    findMyDevice: true,
    diagnostics: 'full', // 'full' or 'required'
    inking: true,
    tailored: true,
    adId: true
  });
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);

  // Current OOBE Step
  const [step, setStep] = useState<
    // Windows 7 steps
    'win7_user' | 'win7_password' | 'win7_key' | 'win7_updates' | 'win7_datetime' | 'win7_network' | 'win7_finalizing' | 'win7_welcome' | 'win7_preparing' |
    // Windows 10 steps
    'win10_region' | 'win10_keyboard' | 'win10_second_keyboard' | 'win10_network' | 'win10_setuptype' | 'win10_user' | 'win10_password' | 'win10_security_questions' | 'win10_activity' | 'win10_cortana' | 'win10_privacy' | 'win10_just_a_moment' | 'win10_hi' | 'win10_getting_ready' | 'win10_almost_there'
  >(os === 'win7' ? 'win7_user' : 'win10_region');

  // Auto-sync computer name when username changes
  const handleUsernameChange = (val: string) => {
    setUsername(val);
    const sanitized = val.replace(/[^a-zA-Z0-9]/g, '');
    setComputerName(`${sanitized || 'User'}-PC`);
  };

  // Step transitions for Windows 7
  const handleNextFromUser = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim()) {
      alert('Please enter a user name.');
      return;
    }
    setStep('win7_password');
  };

  const handleNextFromPassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password && password !== confirmPassword) {
      setPasswordError('The passwords you entered do not match. Please retype the password.');
      return;
    }
    setPasswordError('');
    // In Illinois Windows 7 Enterprise edition, setup moves directly to Update Settings (win7_12.jpg)
    setStep('win7_updates');
  };

  const handleNextFromKey = (skip = false) => {
    setStep('win7_updates');
  };

  const handleSelectUpdateMode = (mode: 'recommended' | 'important' | 'later') => {
    setUpdateMode(mode);
    setStep('win7_datetime');
  };

  const handleNextFromDateTime = () => {
    setStep('win7_network');
  };

  const handleSelectNetwork = (net: 'home' | 'work' | 'public') => {
    setNetworkLocation(net);
    setStep('win7_finalizing');
  };

  // Windows 10 Password check
  const handleWin10PasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setPasswordError('The passwords do not match. Please try again.');
      return;
    }
    setPasswordError('');
    setStep('win10_security_questions');
  };

  // Windows 10 Security questions submit
  const handleWin10SecurityQuestionsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('win10_activity');
  };

  // Windows 10 Finalize sequence
  const startWin10FinalizeSequence = () => {
    setStep('win10_just_a_moment');
  };

  // Finalizing animation sequence
  useEffect(() => {
    if (step === 'win7_finalizing') {
      const t = setTimeout(() => setStep('win7_welcome'), 2000);
      return () => clearTimeout(t);
    }
    if (step === 'win7_welcome') {
      const t = setTimeout(() => setStep('win7_preparing'), 2200);
      return () => clearTimeout(t);
    }
    if (step === 'win7_preparing') {
      const t = setTimeout(() => onFinishOobe(), 2400);
      return () => clearTimeout(t);
    }

    // Windows 10 Boot Sequence
    if (step === 'win10_just_a_moment') {
      const t = setTimeout(() => setStep('win10_hi'), 1800);
      return () => clearTimeout(t);
    }
    if (step === 'win10_hi') {
      const t = setTimeout(() => setStep('win10_getting_ready'), 2400);
      return () => clearTimeout(t);
    }
    if (step === 'win10_getting_ready') {
      const t = setTimeout(() => setStep('win10_almost_there'), 2800);
      return () => clearTimeout(t);
    }
    if (step === 'win10_almost_there') {
      const t = setTimeout(() => onFinishOobe(), 2000);
      return () => clearTimeout(t);
    }
  }, [step, onFinishOobe]);

  // =========================================================================
  // WINDOWS 7 AUTHENTIC OOBE SCREENS (MATCHING ILLINOIS KMS GUIDE)
  // =========================================================================
  // =========================================================================
  // WINDOWS 7 AUTHENTIC OOBE SCREENS (EXACT REPLICA OF ILLINOIS KMS GUIDE win7_10.jpg - win7_15.jpg)
  // =========================================================================
  if (os === 'win7') {
    // Welcome and Preparing Desktop screens (Fullscreen Windows 7 Harmony background)
    if (step === 'win7_welcome' || step === 'win7_preparing') {
      return (
        <div 
          className="fixed inset-0 select-none flex flex-col justify-between p-6 z-50 font-sans"
          style={{
            background: `radial-gradient(ellipse at 50% 38%, #1a74ba 0%, #125e9f 35%, #0a4985 70%, #033465 100%)`
          }}
        >
          {/* Virtual PC Top Bar */}
          <div className="w-full bg-[#1b4366]/90 border-b border-[#3b7fae]/50 px-4 py-1 flex items-center justify-between text-xs text-white z-30 shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-blue-500 inline-block text-[8px] font-bold text-center leading-3">PC</span>
              <span className="font-semibold text-xs tracking-tight text-white/95 drop-shadow">webstoretest - Windows Virtual PC</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-white/80">
              <span>Action ▾</span>
              <span>Tools ▾</span>
              <span className="font-mono">Ctrl+Alt+Del</span>
              <span>?</span>
              <span className="text-white/30">|</span>
              <span className="text-white/50 text-[10px]">_ □ ✕</span>
            </div>
          </div>

          <div className="my-auto flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-500">
            {step === 'win7_welcome' ? (
              <>
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#8ec4f5] to-[#2574be] border-2 border-white/80 flex items-center justify-center text-white shadow-2xl">
                  <User className="w-14 h-14" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-light text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Welcome</h2>
                  <p className="text-sm text-sky-100 font-medium drop-shadow">{username || 'Student'}</p>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-full border-4 border-[#6EE7F9] border-t-transparent animate-spin mx-auto drop-shadow-md" />
                <h2 className="text-2xl font-light text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  Preparing your desktop...
                </h2>
              </div>
            )}
          </div>

          <div className="text-center text-xs text-white/60 pb-2">
            Windows 7 Enterprise
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
        {/* Windows 7 Harmony Light Ribbons */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
          viewBox="0 0 1920 1080" 
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="oobeCenterGlow" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#3ca0dc" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#196cb0" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#053360" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="oobeRibbon" x1="0%" y1="20%" x2="100%" y2="60%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#8de0f7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38b6d8" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <rect width="1920" height="1080" fill="url(#oobeCenterGlow)" />
          <path d="M -100 250 Q 550 150 1200 480 T 2050 420" stroke="url(#oobeRibbon)" strokeWidth="65" fill="none" opacity="0.8" />
          <path d="M -100 320 Q 650 240 1400 580 T 2050 560" stroke="#a0e6ff" strokeWidth="35" fill="none" opacity="0.4" />
        </svg>

        {/* TOP HEADER CONTROLS (Authentic webstoretest - Windows Virtual PC Bar matching all Illinois screenshots) */}
        <div className="w-full bg-[#1b4366]/90 border-b border-[#3b7fae]/50 px-4 py-1 flex items-center justify-between text-xs text-white z-30 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-blue-500 inline-block text-[8px] font-bold text-center leading-3">PC</span>
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
            <span className="text-white/50 text-[10px]">_ □ ✕</span>
          </div>
        </div>

        {/* Windows 7 "Set Up Windows" Aero Window (Exact replica of win7_10.jpg to win7_15.jpg) */}
        <div className="w-full max-w-[690px] my-auto overflow-hidden shadow-[0_16px_45px_rgba(0,0,0,0.55)] transition-all relative z-10 border border-[#4a779f] rounded-[4px] flex flex-col bg-white text-slate-800 min-h-[460px]">
          
          {/* Aero Glass Title Bar */}
          <div 
            className="px-3 py-1 flex items-center justify-between text-xs border-b border-[#315d82]"
            style={{
              background: 'linear-gradient(to bottom, #dbebfb 0%, #bbd8f4 45%, #9bc2ea 55%, #83aede 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85)'
            }}
          >
            <div className="flex items-center gap-2">
              {step !== 'win7_user' && step !== 'win7_finalizing' && (
                <button
                  type="button"
                  onClick={() => {
                    if (step === 'win7_password') setStep('win7_user');
                    else if (step === 'win7_updates') setStep('win7_password');
                    else if (step === 'win7_datetime') setStep('win7_updates');
                    else if (step === 'win7_network') setStep('win7_datetime');
                  }}
                  className="w-5 h-5 rounded-full bg-gradient-to-b from-[#4BA1E8] to-[#1C60A0] border border-[#164573] flex items-center justify-center text-white shadow-xs cursor-pointer active:scale-95"
                  title="Back"
                >
                  <span className="text-[10px] font-bold">‹</span>
                </button>
              )}
              {/* Windows Flag Icon */}
              <div className="grid grid-cols-2 gap-[1px] w-3.5 h-3.5 shrink-0 shadow-xs">
                <div className="bg-[#EA3923] rounded-tl-[1px]" />
                <div className="bg-[#7FBA00] rounded-tr-[1px]" />
                <div className="bg-[#00A4EF] rounded-bl-[1px]" />
                <div className="bg-[#FFB900] rounded-br-[1px]" />
              </div>
              <span className="font-normal text-[#122b44] text-[12px] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                Set Up Windows
              </span>
            </div>

            <div className="flex items-center border border-[#769abb] rounded-[2px] overflow-hidden bg-gradient-to-b from-white/60 to-white/20 shadow-xs">
              <span className="w-5 h-4 flex items-center justify-center text-[#244b6e] text-[9px] cursor-default border-r border-[#88a9c7]">_</span>
              <span className="w-5 h-4 flex items-center justify-center text-slate-400 text-[8px] cursor-not-allowed border-r border-[#88a9c7]">□</span>
              <span className="w-6 h-4 flex items-center justify-center text-[#244b6e] text-[9px] cursor-default">✕</span>
            </div>
          </div>

          {/* SCREEN 1: USER AND COMPUTER NAME (win7_10.jpg) */}
          {step === 'win7_user' && (
            <form onSubmit={handleNextFromUser} className="p-8 flex-1 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Windows 7 Enterprise Logo Header matching win7_10.jpg */}
                <div className="pt-2 text-center flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <div className="grid grid-cols-2 gap-1 w-9 h-9 shrink-0">
                      <div className="bg-[#EA3923] rounded-tl-[2px]" />
                      <div className="bg-[#7FBA00] rounded-tr-[2px]" />
                      <div className="bg-[#00A4EF] rounded-bl-[2px]" />
                      <div className="bg-[#FFB900] rounded-br-[2px]" />
                    </div>
                    <h1 className="text-2xl font-light text-slate-900 tracking-wide">
                      Windows 7 <span className="font-normal text-slate-800">Enterprise</span>
                    </h1>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <p className="text-xs text-slate-800 leading-relaxed">
                    Choose a user name for your <span className="text-[#0066CC] hover:underline cursor-pointer">account</span> and name your computer to distinguish it on the network.
                  </p>

                  <div className="space-y-3 pt-1 text-xs">
                    <div>
                      <label className="block text-slate-700 mb-1">
                        Type a user name (for example, John):
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        className="w-80 bg-white border border-[#7F9DB9] rounded-[2px] px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-400"
                        placeholder="John"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 mb-1">
                        Type a <span className="text-[#0066CC] hover:underline cursor-pointer">computer name</span>:
                      </label>
                      <input
                        type="text"
                        value={computerName}
                        onChange={(e) => setComputerName(e.target.value)}
                        className="w-80 bg-white border border-[#7F9DB9] rounded-[2px] px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-400"
                        placeholder="John-PC"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom footer matching win7_10.jpg */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-xs mt-6">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]" title="Ease of Access">
                  ⚙
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-[11px] text-slate-500">
                    Copyright © 2009 Microsoft Corporation. All rights reserved.
                  </span>
                  <button
                    type="submit"
                    className="px-7 py-1 bg-gradient-to-b from-[#F2F2F2] via-[#EBEBEB] to-[#D4D4D4] border border-[#707070] hover:border-[#3C7FB1] hover:shadow-[0_0_6px_rgba(60,127,177,0.8)] active:bg-[#C8C8C8] text-black text-xs font-normal rounded-[3px] shadow-sm cursor-pointer transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* SCREEN 2: SET PASSWORD (win7_11.jpg) */}
          {step === 'win7_password' && (
            <form onSubmit={handleNextFromPassword} className="p-8 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-[17px] font-normal text-[#1E395B]">
                  Set a password for your account
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Creating a password is a smart security precaution that helps protect your user account from unwanted users. Be sure to remember your password or keep it in a safe place.
                </p>

                {passwordError && (
                  <div className="p-2 bg-rose-50 border border-rose-300 text-rose-700 text-xs rounded">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <label className="block text-slate-700 mb-1">Type a password (recommended):</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-80 bg-white border border-[#7F9DB9] rounded-[2px] px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Retype your password:</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-80 bg-white border border-[#7F9DB9] rounded-[2px] px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Type a password hint:</label>
                    <input
                      type="text"
                      value={passwordHint}
                      onChange={(e) => setPasswordHint(e.target.value)}
                      className="w-80 bg-white border border-[#7F9DB9] rounded-[2px] px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-400"
                    />
                    <p className="text-[11px] text-slate-500 mt-1 max-w-md">
                      Choose a word or phrase that helps you remember your password. If you forget your password, Windows will show you your hint.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-200 pt-4 text-xs mt-6">
                <button
                  type="submit"
                  className="px-7 py-1 bg-gradient-to-b from-[#F2F2F2] via-[#EBEBEB] to-[#D4D4D4] border border-[#707070] hover:border-[#3C7FB1] hover:shadow-[0_0_6px_rgba(60,127,177,0.8)] active:bg-[#C8C8C8] text-black text-xs font-normal rounded-[3px] shadow-sm cursor-pointer transition-all"
                >
                  Next
                </button>
              </div>
            </form>
          )}

          {/* SCREEN 3: HELP PROTECT YOUR COMPUTER (win7_12.jpg) */}
          {step === 'win7_updates' && (
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-[17px] font-normal text-[#1E395B]">
                  Help protect your computer and improve Windows automatically
                </h2>

                <div className="space-y-3 pt-2">
                  {/* Recommended Settings Card matching win7_12.jpg */}
                  <button
                    type="button"
                    onClick={() => handleSelectUpdateMode('recommended')}
                    className="w-full text-left p-3.5 border border-[#A0A0A0]/60 hover:border-[#7DA2CE] hover:bg-[#F2F7FD] rounded-[2px] transition-all cursor-pointer group flex items-start gap-4 shadow-xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[#0066CC] text-xs font-normal group-hover:underline">
                        Use recommended settings
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Install important and recommended updates, help make Internet browsing safer, check online for solutions to problems, and help Microsoft improve Windows.
                      </p>
                    </div>
                  </button>

                  {/* Install Important Updates Only Card */}
                  <button
                    type="button"
                    onClick={() => handleSelectUpdateMode('important')}
                    className="w-full text-left p-3.5 border border-[#A0A0A0]/60 hover:border-[#7DA2CE] hover:bg-[#F2F7FD] rounded-[2px] transition-all cursor-pointer group flex items-start gap-4 shadow-xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[#0066CC] text-xs font-normal group-hover:underline">
                        Install important updates only
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Only install security updates and other important updates for Windows.
                      </p>
                    </div>
                  </button>

                  {/* Ask Me Later Card */}
                  <button
                    type="button"
                    onClick={() => handleSelectUpdateMode('later')}
                    className="w-full text-left p-3.5 border border-[#A0A0A0]/60 hover:border-[#7DA2CE] hover:bg-[#F2F7FD] rounded-[2px] transition-all cursor-pointer group flex items-start gap-4 shadow-xs"
                  >
                    <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <span className="text-xs font-bold">✕</span>
                    </div>
                    <div>
                      <h4 className="text-[#0066CC] text-xs font-normal group-hover:underline">
                        Ask me later
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Until you decide, your computer might be vulnerable to security threats.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Privacy text matching win7_12.jpg */}
              <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 leading-relaxed mt-4 space-y-1">
                <p className="text-[#0066CC] hover:underline cursor-pointer">Learn more about each option</p>
                <p>
                  When you use recommended settings or install updates only, some information is sent to Microsoft. The information is not used to identify you or contact you. To turn off these settings later, search for 'Turn off recommended setting' in Help and Support. <span className="text-[#0066CC] hover:underline cursor-pointer">Read the privacy statement</span>
                </p>
              </div>
            </div>
          )}

          {/* SCREEN 4: REVIEW TIME AND DATE SETTINGS (win7_13.jpg) */}
          {step === 'win7_datetime' && (
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-[17px] font-normal text-[#1E395B]">
                  Review your time and date settings
                </h2>

                <div className="space-y-4 pt-1 text-xs">
                  <div>
                    <label className="block text-slate-700 mb-1">Time zone:</label>
                    <select
                      value={timeZone}
                      onChange={(e) => setTimeZone(e.target.value)}
                      className="w-full max-w-md bg-white border border-[#7F9DB9] rounded-[2px] px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="(UTC-06:00) Central Time (US & Canada)">(UTC-06:00) Central Time (US & Canada)</option>
                      <option value="(UTC-08:00) Pacific Time (US & Canada)">(UTC-08:00) Pacific Time (US & Canada)</option>
                      <option value="(UTC-05:00) Eastern Time (US & Canada)">(UTC-05:00) Eastern Time (US & Canada)</option>
                      <option value="(UTC+08:00) Manila, Taipei, Singapore">(UTC+08:00) Manila, Taipei, Singapore</option>
                    </select>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="dst-check"
                        checked={autoDst}
                        onChange={(e) => setAutoDst(e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                      <label htmlFor="dst-check" className="text-slate-700 text-xs cursor-pointer select-none">
                        Automatically adjust clock for Daylight Saving Time
                      </label>
                    </div>
                  </div>

                  {/* Calendar and Clock matching win7_13.jpg */}
                  <div className="grid grid-cols-2 gap-8 pt-3 max-w-md">
                    <div>
                      <span className="font-normal text-slate-700 block mb-2">Date:</span>
                      <div className="border border-[#7F9DB9] p-2 bg-white text-center text-xs">
                        <div className="font-semibold text-slate-800 pb-1 border-b border-slate-200">
                          August, 2026
                        </div>
                        <div className="grid grid-cols-7 gap-1 pt-1.5 text-[10px] text-slate-500 font-mono">
                          <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                        </div>
                        <div className="grid grid-cols-7 gap-1 pt-1 text-[10px] text-slate-700 font-mono">
                          <span className="text-slate-300">26</span><span className="text-slate-300">27</span><span className="text-slate-300">28</span><span className="text-slate-300">29</span><span className="text-slate-300">30</span><span className="text-slate-300">31</span><span>1</span>
                          <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span>
                          <span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span>
                          <span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span>
                          <span>23</span><span>24</span><span>25</span><span className="bg-sky-100 border border-sky-400 font-bold text-blue-900 rounded-[1px]">26</span><span>27</span><span>28</span><span>29</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="font-normal text-slate-700 block mb-2">Time:</span>
                      <div className="flex flex-col items-center">
                        {/* Windows 7 Analog Clock graphic matching win7_13.jpg */}
                        <div className="w-24 h-24 rounded-full border-4 border-[#C8D8E8] shadow-inner bg-gradient-to-b from-white to-[#F0F4F8] relative flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-800 z-10" />
                          {/* Hour hand */}
                          <div className="w-0.5 h-6 bg-slate-700 absolute top-6 origin-bottom transform rotate-[55deg]" />
                          {/* Minute hand */}
                          <div className="w-0.5 h-9 bg-slate-900 absolute top-3 origin-bottom transform rotate-[255deg]" />
                          {/* Second hand */}
                          <div className="w-[1px] h-10 bg-blue-600 absolute top-2 origin-bottom transform rotate-[130deg]" />
                        </div>
                        <div className="mt-2 flex items-center border border-[#7F9DB9] rounded-[2px] px-2 py-0.5 text-xs bg-white">
                          <span>1:57:42 PM</span>
                          <span className="ml-2 text-[8px] text-slate-400">▴▾</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-200 pt-4 text-xs mt-6">
                <button
                  type="button"
                  onClick={handleNextFromDateTime}
                  className="px-7 py-1 bg-gradient-to-b from-[#F2F2F2] via-[#EBEBEB] to-[#D4D4D4] border border-[#707070] hover:border-[#3C7FB1] hover:shadow-[0_0_6px_rgba(60,127,177,0.8)] active:bg-[#C8C8C8] text-black text-xs font-normal rounded-[3px] shadow-sm cursor-pointer transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 5: SELECT NETWORK LOCATION (win7_14.jpg) */}
          {step === 'win7_network' && (
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-[17px] font-normal text-[#1E395B]">
                  Select your computer's current location
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">
                  This computer is connected to a network. Windows will automatically apply the correct network settings based on the network's location.
                </p>

                <div className="space-y-3 pt-2">
                  {/* Home Network Card */}
                  <button
                    type="button"
                    onClick={() => handleSelectNetwork('home')}
                    className="w-full text-left p-3.5 border border-[#A0A0A0]/60 hover:border-[#7DA2CE] hover:bg-[#F2F7FD] rounded-[2px] transition-all cursor-pointer group flex items-start gap-4 shadow-xs"
                  >
                    <div className="w-10 h-10 bg-amber-100 border border-amber-300 rounded-[2px] flex items-center justify-center shrink-0">
                      <Home className="w-6 h-6 text-amber-800" />
                    </div>
                    <div>
                      <h4 className="text-[#0066CC] text-xs font-normal group-hover:underline">
                        Home network
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        If all the computers on this network are at your home, and you recognize them, this is a trusted home network. Don't choose this for public places such as coffee shops or airports.
                      </p>
                    </div>
                  </button>

                  {/* Work Network Card (Highlighted as chosen in Illinois guide win7_14.jpg) */}
                  <button
                    type="button"
                    onClick={() => handleSelectNetwork('work')}
                    className="w-full text-left p-3.5 border border-[#7DA2CE] bg-[#F2F7FD] rounded-[2px] transition-all cursor-pointer group flex items-start gap-4 shadow-xs ring-1 ring-[#7DA2CE]"
                  >
                    <div className="w-10 h-10 bg-blue-100 border border-blue-300 rounded-[2px] flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-blue-800" />
                    </div>
                    <div>
                      <h4 className="text-[#0066CC] text-xs font-semibold group-hover:underline">
                        Work network
                      </h4>
                      <p className="text-[11px] text-slate-700 mt-0.5 leading-relaxed">
                        If all the computers on this network are at your workplace, and you recognize them, this is a trusted work network. Don't choose this for public places such as coffee shops or airports.
                      </p>
                    </div>
                  </button>

                  {/* Public Network Card */}
                  <button
                    type="button"
                    onClick={() => handleSelectNetwork('public')}
                    className="w-full text-left p-3.5 border border-[#A0A0A0]/60 hover:border-[#7DA2CE] hover:bg-[#F2F7FD] rounded-[2px] transition-all cursor-pointer group flex items-start gap-4 shadow-xs"
                  >
                    <div className="w-10 h-10 bg-stone-100 border border-stone-300 rounded-[2px] flex items-center justify-center shrink-0">
                      <Coffee className="w-6 h-6 text-stone-700" />
                    </div>
                    <div>
                      <h4 className="text-[#0066CC] text-xs font-normal group-hover:underline">
                        Public network
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        If you don't recognize all the computers on the network (for example, you're in a coffee shop or airport, or you have mobile broadband), this is a public network and is not trusted.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="pt-4 text-[11px] text-slate-600">
                If you aren't sure, select Public network.
              </div>
            </div>
          )}

          {/* SCREEN 6: WINDOWS IS FINALIZING YOUR SETTINGS (win7_15.jpg) */}
          {step === 'win7_finalizing' && (
            <div className="p-8 flex-1 flex flex-col justify-between items-center text-center">
              <div className="pt-6 flex flex-col items-center space-y-2">
                <div className="flex items-center gap-2">
                  <div className="grid grid-cols-2 gap-1 w-9 h-9 shrink-0">
                    <div className="bg-[#EA3923] rounded-tl-[2px]" />
                    <div className="bg-[#7FBA00] rounded-tr-[2px]" />
                    <div className="bg-[#00A4EF] rounded-bl-[2px]" />
                    <div className="bg-[#FFB900] rounded-br-[2px]" />
                  </div>
                  <h1 className="text-2xl font-light text-slate-900 tracking-wide">
                    Windows 7 <span className="font-normal text-slate-800">Enterprise</span>
                  </h1>
                </div>
              </div>

              <div className="my-auto space-y-3 w-full max-w-sm">
                <p className="text-sm font-normal text-slate-800">
                  Windows is finalizing your settings
                </p>
                {/* Windows 7 Animated Indeterminate Green Bar matching win7_15.jpg */}
                <div className="w-full h-3 bg-[#E0E0E0] rounded-[2px] overflow-hidden p-[1px] border border-[#A0A0A0]">
                  <div className="h-full bg-gradient-to-r from-[#88DE75] via-[#4BB834] to-[#88DE75] animate-pulse rounded-[1px] w-full" />
                </div>
              </div>

              <div className="pb-4 text-xs text-slate-400">
                Please wait...
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // =========================================================================
  // WINDOWS 10 AUTHENTIC OUT-OF-BOX EXPERIENCE (OOBE) FLOW
  // =========================================================================
  const win10Regions = [
    'United States', 'Philippines', 'United Kingdom', 'Canada', 'Australia', 
    'Germany', 'India', 'Japan', 'Singapore', 'France', 'Brazil'
  ];

  const win10Keyboards = [
    'US', 'United Kingdom', 'Canadian Multilingual Standard', 'Dvorak', 'Spanish'
  ];

  const securityQuestionsList1 = [
    "What was your first pet's name?",
    "What's the name of the city where you were born?",
    "What was your childhood nickname?"
  ];
  const securityQuestionsList2 = [
    "What's the name of the first school you attended?",
    "What's the name of your oldest cousin?",
    "What city did your parents meet in?"
  ];
  const securityQuestionsList3 = [
    "What was the make and model of your first car?",
    "What was the first music concert you attended?",
    "What was your favorite food as a child?"
  ];

  return (
    <div className="fixed inset-0 select-none bg-[#004275] text-white flex flex-col justify-between p-6 z-50 font-sans">
      
      {/* Top Windows 10 Logo / Title */}
      <div className="flex items-center justify-between opacity-80 text-xs">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
            <div className="bg-white" />
            <div className="bg-white" />
            <div className="bg-white" />
            <div className="bg-white" />
          </div>
          <span className="font-light tracking-wider">Windows 10 Setup</span>
        </div>
        <span className="text-[11px] opacity-70">OOBE Simulator</span>
      </div>

      {/* Center Interactive OOBE Stage */}
      <div className="max-w-3xl w-full mx-auto my-auto flex flex-col items-center justify-center">

        {/* STEP 1: Region Selection */}
        {step === 'win10_region' && (
          <div className="w-full max-w-xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-light tracking-wide text-center">
              Let's start with region. Is this right?
            </h2>

            <div className="bg-black/20 border border-white/10 rounded-lg max-h-64 overflow-y-auto p-1 divide-y divide-white/5">
              {win10Regions.map((region) => (
                <div
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`p-3 text-sm cursor-pointer rounded transition-all flex items-center justify-between ${
                    selectedRegion === region
                      ? 'bg-[#0078d7] text-white font-semibold'
                      : 'hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <span>{region}</span>
                  {selectedRegion === region && <Check className="w-4 h-4" />}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep('win10_keyboard')}
                className="px-8 py-2 bg-[#0078d7] hover:bg-[#106ebe] text-white font-semibold text-sm rounded shadow-lg transition-all cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Keyboard Layout Selection */}
        {step === 'win10_keyboard' && (
          <div className="w-full max-w-xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-light tracking-wide text-center">
              Is this the right keyboard layout?
            </h2>

            <div className="bg-black/20 border border-white/10 rounded-lg max-h-64 overflow-y-auto p-1 divide-y divide-white/5">
              {win10Keyboards.map((kb) => (
                <div
                  key={kb}
                  onClick={() => setSelectedKeyboard(kb)}
                  className={`p-3 text-sm cursor-pointer rounded transition-all flex items-center justify-between ${
                    selectedKeyboard === kb
                      ? 'bg-[#0078d7] text-white font-semibold'
                      : 'hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <span>{kb}</span>
                  {selectedKeyboard === kb && <Check className="w-4 h-4" />}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep('win10_second_keyboard')}
                className="px-8 py-2 bg-[#0078d7] hover:bg-[#106ebe] text-white font-semibold text-sm rounded shadow-lg transition-all cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Second Keyboard Layout */}
        {step === 'win10_second_keyboard' && (
          <div className="w-full max-w-xl space-y-8 text-center animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-light tracking-wide">
              Want to add a second keyboard layout?
            </h2>
            <p className="text-xs text-slate-300">
              If you type in more than one language, you can add another layout now or do it later in Settings.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep('win10_network')}
                className="px-8 py-2 bg-[#0078d7] hover:bg-[#106ebe] text-white font-semibold text-sm rounded shadow-lg transition-all cursor-pointer"
              >
                Add layout
              </button>
              <button
                type="button"
                onClick={() => setStep('win10_network')}
                className="px-8 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded border border-white/20 transition-all cursor-pointer"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Network Connection */}
        {step === 'win10_network' && (
          <div className="w-full max-w-xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-light tracking-wide text-center">
              Let's connect you to a network
            </h2>
            <p className="text-xs text-slate-300 text-center">
              You'll need an internet connection to complete setup, get device security updates, and access cloud services.
            </p>

            <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5 text-sky-400" />
                  <div>
                    <h4 className="text-sm font-semibold">Campus-Lab-Secure-Ethernet</h4>
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-300 font-mono">1000 Mbps</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep('win10_setuptype')}
                className="text-xs text-sky-300 underline hover:text-white cursor-pointer"
              >
                I don't have internet
              </button>

              <button
                type="button"
                onClick={() => setStep('win10_setuptype')}
                className="px-8 py-2 bg-[#0078d7] hover:bg-[#106ebe] text-white font-semibold text-sm rounded shadow-lg transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: How would you like to set up? (Personal vs Org) */}
        {step === 'win10_setuptype' && (
          <div className="w-full max-w-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-light tracking-wide text-center">
              How would you like to set up?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div
                onClick={() => setSetupType('personal')}
                className={`p-6 rounded-xl border cursor-pointer transition-all ${
                  setupType === 'personal'
                    ? 'bg-[#0078d7]/40 border-sky-400 shadow-xl'
                    : 'bg-black/20 border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center mb-3">
                  <Laptop className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm mb-1">Set up for personal use</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We'll help you set up with a personal account or offline local credentials.
                </p>
              </div>

              <div
                onClick={() => setSetupType('org')}
                className={`p-6 rounded-xl border cursor-pointer transition-all ${
                  setupType === 'org'
                    ? 'bg-[#0078d7]/40 border-sky-400 shadow-xl'
                    : 'bg-black/20 border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-3">
                  <Server className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm mb-1">Set up for an organization</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You'll have access to school or university resources, network domains, and KMS licensing.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep('win10_user')}
                className="px-8 py-2 bg-[#0078d7] hover:bg-[#106ebe] text-white font-semibold text-sm rounded shadow-lg transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Who's going to use this PC? */}
        {step === 'win10_user' && (
          <form onSubmit={(e) => { e.preventDefault(); setStep('win10_password'); }} className="w-full max-w-lg space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-light tracking-wide text-center">
              Who's going to use this PC?
            </h2>
            <p className="text-xs text-slate-300 text-center">
              What name do you want to use?
            </p>

            <div className="space-y-4 pt-2">
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="w-full bg-transparent border-b-2 border-white/60 focus:border-sky-400 py-2 text-base text-white placeholder-white/40 focus:outline-none transition-colors"
                placeholder="User name"
                required
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between pt-6">
              <span className="text-xs text-slate-400">Offline Account</span>
              <button
                type="submit"
                className="px-8 py-2 bg-[#0078d7] hover:bg-[#106ebe] text-white font-semibold text-sm rounded shadow-lg transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* STEP 7: Create a memorable password */}
        {step === 'win10_password' && (
          <form onSubmit={handleWin10PasswordSubmit} className="w-full max-w-lg space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-light tracking-wide text-center">
              Create a super memorable password
            </h2>

            {passwordError && (
              <div className="p-2 bg-rose-500/20 border border-rose-500/50 rounded text-rose-200 text-xs">
                {passwordError}
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Enter password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/60 focus:border-sky-400 py-2 text-base text-white placeholder-white/40 focus:outline-none transition-colors"
                  placeholder="Password"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Confirm password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-white/60 focus:border-sky-400 py-2 text-base text-white placeholder-white/40 focus:outline-none transition-colors"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="px-8 py-2 bg-[#0078d7] hover:bg-[#106ebe] text-white font-semibold text-sm rounded shadow-lg transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* STEP 8: Security Questions */}
        {step === 'win10_security_questions' && (
          <form onSubmit={handleWin10SecurityQuestionsSubmit} className="w-full max-w-xl space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-light tracking-wide text-center">
              Now add 3 security questions
            </h2>
            <p className="text-xs text-slate-300 text-center">
              In case you forget your password, these will help you recover access.
            </p>

            <div className="space-y-4 text-xs">
              {/* Q1 */}
              <div className="space-y-1.5 bg-black/20 p-3 rounded-lg border border-white/10">
                <label className="font-semibold text-sky-300">Security question (1 of 3):</label>
                <select
                  value={q1}
                  onChange={(e) => setQ1(e.target.value)}
                  className="w-full bg-[#00345c] border border-white/20 rounded p-1.5 text-white"
                >
                  {securityQuestionsList1.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                <input
                  type="text"
                  value={a1}
                  onChange={(e) => setA1(e.target.value)}
                  className="w-full bg-transparent border-b border-white/40 py-1 text-white placeholder-white/40 focus:outline-none focus:border-sky-400"
                  placeholder="Your answer"
                />
              </div>

              {/* Q2 */}
              <div className="space-y-1.5 bg-black/20 p-3 rounded-lg border border-white/10">
                <label className="font-semibold text-sky-300">Security question (2 of 3):</label>
                <select
                  value={q2}
                  onChange={(e) => setQ2(e.target.value)}
                  className="w-full bg-[#00345c] border border-white/20 rounded p-1.5 text-white"
                >
                  {securityQuestionsList2.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                <input
                  type="text"
                  value={a2}
                  onChange={(e) => setA2(e.target.value)}
                  className="w-full bg-transparent border-b border-white/40 py-1 text-white placeholder-white/40 focus:outline-none focus:border-sky-400"
                  placeholder="Your answer"
                />
              </div>

              {/* Q3 */}
              <div className="space-y-1.5 bg-black/20 p-3 rounded-lg border border-white/10">
                <label className="font-semibold text-sky-300">Security question (3 of 3):</label>
                <select
                  value={q3}
                  onChange={(e) => setQ3(e.target.value)}
                  className="w-full bg-[#00345c] border border-white/20 rounded p-1.5 text-white"
                >
                  {securityQuestionsList3.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                <input
                  type="text"
                  value={a3}
                  onChange={(e) => setA3(e.target.value)}
                  className="w-full bg-transparent border-b border-white/40 py-1 text-white placeholder-white/40 focus:outline-none focus:border-sky-400"
                  placeholder="Your answer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-8 py-2 bg-[#0078d7] hover:bg-[#106ebe] text-white font-semibold text-sm rounded shadow-lg transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* STEP 9: Activity History */}
        {step === 'win10_activity' && (
          <div className="w-full max-w-xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-light tracking-wide">
              Do more across devices with activity history
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
              If you want to continue what you were doing and jump back into documents, apps, or websites across devices, send your activity history to Microsoft.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep('win10_cortana')}
                className="px-8 py-2 bg-[#0078d7] hover:bg-[#106ebe] text-white font-semibold text-sm rounded shadow-lg transition-all cursor-pointer"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setStep('win10_cortana')}
                className="px-8 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded border border-white/20 transition-all cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* STEP 10: Cortana Digital Assistant */}
        {step === 'win10_cortana' && (
          <div className="w-full max-w-xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full border-4 border-sky-400 border-t-transparent animate-spin mx-auto" />
            <h2 className="text-2xl font-light tracking-wide">
              Let Cortana help you get things done
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
              Cortana can give you reminders, keep your schedule organized, and answer questions.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep('win10_privacy')}
                className="px-8 py-2 bg-[#0078d7] hover:bg-[#106ebe] text-white font-semibold text-sm rounded shadow-lg transition-all cursor-pointer"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => setStep('win10_privacy')}
                className="px-8 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded border border-white/20 transition-all cursor-pointer"
              >
                Not now
              </button>
            </div>
          </div>
        )}

        {/* STEP 11: Privacy Settings for your device */}
        {step === 'win10_privacy' && (
          <div className="w-full max-w-3xl space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-light tracking-wide text-center">
              Choose privacy settings for your device
            </h2>
            <p className="text-xs text-slate-300 text-center">
              Microsoft puts you in control of your privacy. Choose your settings, then select Accept to save them.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs max-h-72 overflow-y-auto p-1">
              
              {/* Online Speech */}
              <div className="bg-black/25 p-3 rounded-lg border border-white/10 space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span>Online speech recognition</span>
                  <button
                    type="button"
                    onClick={() => setPrivacySettings(p => ({ ...p, speech: !p.speech }))}
                    className="text-sky-300 cursor-pointer"
                  >
                    {privacySettings.speech ? <ToggleRight className="w-6 h-6 text-sky-400" /> : <ToggleLeft className="w-6 h-6 text-slate-500" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300">Use your voice for dictation and store voice data in cloud.</p>
              </div>

              {/* Location */}
              <div className="bg-black/25 p-3 rounded-lg border border-white/10 space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span>Location</span>
                  <button
                    type="button"
                    onClick={() => setPrivacySettings(p => ({ ...p, location: !p.location }))}
                    className="text-sky-300 cursor-pointer"
                  >
                    {privacySettings.location ? <ToggleRight className="w-6 h-6 text-sky-400" /> : <ToggleLeft className="w-6 h-6 text-slate-500" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300">Get location-based experiences like directions and weather.</p>
              </div>

              {/* Find My Device */}
              <div className="bg-black/25 p-3 rounded-lg border border-white/10 space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span>Find my device</span>
                  <button
                    type="button"
                    onClick={() => setPrivacySettings(p => ({ ...p, findMyDevice: !p.findMyDevice }))}
                    className="text-sky-300 cursor-pointer"
                  >
                    {privacySettings.findMyDevice ? <ToggleRight className="w-6 h-6 text-sky-400" /> : <ToggleLeft className="w-6 h-6 text-slate-500" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300">Turn on location data to locate your device if you lose it.</p>
              </div>

              {/* Diagnostic data */}
              <div className="bg-black/25 p-3 rounded-lg border border-white/10 space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span>Diagnostic data</span>
                  <span className="text-[11px] text-sky-300 uppercase">{privacySettings.diagnostics}</span>
                </div>
                <p className="text-[11px] text-slate-300">Send diagnostic data to Microsoft to keep Windows secure and up to date.</p>
              </div>

              {/* Inking & typing */}
              <div className="bg-black/25 p-3 rounded-lg border border-white/10 space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span>Inking & typing</span>
                  <button
                    type="button"
                    onClick={() => setPrivacySettings(p => ({ ...p, inking: !p.inking }))}
                    className="text-sky-300 cursor-pointer"
                  >
                    {privacySettings.inking ? <ToggleRight className="w-6 h-6 text-sky-400" /> : <ToggleLeft className="w-6 h-6 text-slate-500" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300">Send inking and typing data to improve language recognition.</p>
              </div>

              {/* Advertising ID */}
              <div className="bg-black/25 p-3 rounded-lg border border-white/10 space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span>Tailored experiences & Ad ID</span>
                  <button
                    type="button"
                    onClick={() => setPrivacySettings(p => ({ ...p, tailored: !p.tailored }))}
                    className="text-sky-300 cursor-pointer"
                  >
                    {privacySettings.tailored ? <ToggleRight className="w-6 h-6 text-sky-400" /> : <ToggleLeft className="w-6 h-6 text-slate-500" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-300">Allow apps to use advertising ID for relevant suggestions.</p>
              </div>

            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={startWin10FinalizeSequence}
                className="px-10 py-2.5 bg-[#0078d7] hover:bg-[#106ebe] text-white font-semibold text-sm rounded shadow-xl transition-all cursor-pointer"
              >
                Accept
              </button>
            </div>
          </div>
        )}

        {/* STEP 12A: Just a moment... */}
        {step === 'win10_just_a_moment' && (
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <div className="w-14 h-14 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-2xl font-light tracking-wide">Just a moment...</h2>
          </div>
        )}

        {/* STEP 12B: Hi */}
        {step === 'win10_hi' && (
          <div className="text-center space-y-4 animate-in fade-in duration-700">
            <h2 className="text-4xl font-light tracking-wider">Hi</h2>
            <p className="text-base text-slate-200">We're getting everything ready for you.</p>
          </div>
        )}

        {/* STEP 12C: Getting ready */}
        {step === 'win10_getting_ready' && (
          <div className="text-center space-y-4 animate-in fade-in duration-700">
            <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-2xl font-light tracking-wide">This might take several minutes</h2>
            <p className="text-sm text-slate-300">Don't turn off your PC</p>
            <p className="text-xs text-sky-300 font-mono pt-2">Leave everything to us...</p>
          </div>
        )}

        {/* STEP 12D: Almost there */}
        {step === 'win10_almost_there' && (
          <div className="text-center space-y-4 animate-in fade-in duration-700">
            <Sparkles className="w-10 h-10 text-sky-400 animate-pulse mx-auto" />
            <h2 className="text-3xl font-light tracking-wide">Almost there</h2>
          </div>
        )}

      </div>

      {/* Bottom Cortana Voice Assistant Bar */}
      <div className="flex items-center justify-between text-xs text-slate-300 pt-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsVoiceMuted(!isVoiceMuted)}
            className="flex items-center gap-1.5 p-1.5 hover:bg-white/10 rounded cursor-pointer transition-colors"
            title="Cortana Audio"
          >
            <Volume2 className={`w-4 h-4 ${isVoiceMuted ? 'text-rose-400' : 'text-sky-300'}`} />
            <span>{isVoiceMuted ? 'Muted' : 'Audio On'}</span>
          </button>
          <div className="flex items-center gap-1.5 p-1.5 text-slate-400">
            <Mic className="w-4 h-4" />
            <span>Voice Assistant Ready</span>
          </div>
        </div>

        <span className="text-[11px] text-slate-400">Windows 10 Out-Of-Box Experience</span>
      </div>

    </div>
  );
};
