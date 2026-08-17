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
    setStep('win7_key');
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
  if (os === 'win7') {
    return (
      <div className="fixed inset-0 select-none bg-gradient-to-tr from-blue-900 via-sky-600 to-teal-800 flex items-center justify-center p-4 z-50">
        {/* Windows 7 Setup Window Container */}
        <div className="w-full max-w-2xl bg-slate-100 text-slate-900 border-2 border-slate-300 rounded-md shadow-2xl overflow-hidden flex flex-col min-h-[500px] justify-between">
          
          {/* Windows 7 Aero Header Bar */}
          <div className="px-4 py-2 bg-gradient-to-r from-blue-700 via-sky-600 to-blue-800 text-white font-semibold text-xs flex items-center justify-between border-b border-sky-400/50">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-sky-300" />
              <span>Set Up Windows</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="w-3 h-3 rounded-full bg-slate-400/30 flex items-center justify-center text-[9px]">-</span>
              <span className="w-3 h-3 rounded-full bg-slate-400/30 flex items-center justify-center text-[9px]">□</span>
              <span className="w-3 h-3 rounded-full bg-slate-400/30 flex items-center justify-center text-[9px]">✕</span>
            </div>
          </div>

          <div className="p-8 flex-1 flex flex-col justify-between">
            {/* Windows 7 Emblem */}
            <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid grid-cols-2 gap-0.5 w-6 h-6">
                  <div className="bg-red-500 rounded-tl-xs" />
                  <div className="bg-green-500 rounded-tr-xs" />
                  <div className="bg-blue-500 rounded-bl-xs" />
                  <div className="bg-yellow-400 rounded-br-xs" />
                </div>
                <h1 className="text-xl font-bold text-blue-950">Windows 7 Professional</h1>
              </div>
              <span className="text-[11px] text-slate-500 font-sans">Initial Configuration</span>
            </div>

            {/* SCREEN 1: Choose a user name and computer name */}
            {step === 'win7_user' && (
              <form onSubmit={handleNextFromUser} className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Choose a user name for your account and name your computer</h2>
                    <p className="text-xs text-slate-600 mt-1">
                      The user name is required to distinguish your account on this computer.
                    </p>
                  </div>

                  <div className="space-y-4 max-w-md pt-2 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Type a user name (for example, John):
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        className="w-full bg-white border border-slate-400 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-inner"
                        placeholder="Student"
                        required
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Type a computer name (for example, John-PC):
                      </label>
                      <input
                        type="text"
                        value={computerName}
                        onChange={(e) => setComputerName(e.target.value)}
                        className="w-full bg-white border border-slate-400 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-inner"
                        placeholder="Student-PC"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-300 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-1.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 border border-slate-400 rounded text-slate-900 font-bold text-xs shadow transition-all cursor-pointer"
                  >
                    <span className="underline">N</span>ext &rarr;
                  </button>
                </div>
              </form>
            )}

            {/* SCREEN 2: Set a password for your account */}
            {step === 'win7_password' && (
              <form onSubmit={handleNextFromPassword} className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Set a password for your account</h2>
                    <p className="text-xs text-slate-600 mt-1">
                      Creating a password is a recommended security precaution that helps protect your user account.
                    </p>
                  </div>

                  {passwordError && (
                    <div className="p-2 bg-rose-100 border border-rose-300 rounded text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <div className="space-y-3 max-w-md text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Type a password (recommended):</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-slate-400 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-inner"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Retype your password:</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white border border-slate-400 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-inner"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Type a password hint (required if password set):</label>
                      <input
                        type="text"
                        value={passwordHint}
                        onChange={(e) => setPasswordHint(e.target.value)}
                        className="w-full bg-white border border-slate-400 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-inner"
                        placeholder="e.g. My university student ID"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-300 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-1.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 border border-slate-400 rounded text-slate-900 font-bold text-xs shadow transition-all cursor-pointer"
                  >
                    <span className="underline">N</span>ext &rarr;
                  </button>
                </div>
              </form>
            )}

            {/* SCREEN 3: Product Key & KMS Information (From Illinois WebStore Guide) */}
            {step === 'win7_key' && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Type your Windows product key</h2>
                    <p className="text-xs text-slate-600 mt-1">
                      Your product key can be found on the Windows installation disc package or in your confirmation email.
                    </p>
                  </div>

                  <div className="p-3 bg-sky-50 border border-sky-300 rounded text-slate-700 text-xs flex items-start gap-2.5">
                    <Key className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-sky-900">University Campus License (KMS Auto-Activation):</span>
                      <p className="text-[11px] text-sky-800 mt-0.5">
                        If you are using University Volume Licensing (KMS), you can leave this blank and click <strong>Skip</strong> or <strong>Next</strong>. Windows will automatically contact the campus KMS server.
                      </p>
                    </div>
                  </div>

                  <div className="max-w-md space-y-2 text-xs">
                    <label className="block font-semibold text-slate-700">Product key:</label>
                    <input
                      type="text"
                      value={productKey}
                      onChange={(e) => setProductKey(e.target.value)}
                      className="w-full bg-white border border-slate-400 rounded px-3 py-1.5 text-xs text-slate-900 font-mono tracking-widest uppercase focus:outline-none focus:border-blue-600 shadow-inner"
                      placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                    />

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="autoact"
                        checked={autoActivateOnline}
                        onChange={(e) => setAutoActivateOnline(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      />
                      <label htmlFor="autoact" className="text-slate-700 text-xs cursor-pointer">
                        Automatically activate Windows when I'm online
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between border-t border-slate-300 pt-4">
                  <button
                    type="button"
                    onClick={() => handleNextFromKey(true)}
                    className="px-4 py-1.5 text-slate-700 hover:text-slate-900 font-semibold text-xs underline cursor-pointer"
                  >
                    Skip (Campus KMS License)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNextFromKey(false)}
                    className="px-6 py-1.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 border border-slate-400 rounded text-slate-900 font-bold text-xs shadow transition-all cursor-pointer"
                  >
                    <span className="underline">N</span>ext &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 4: Help protect your computer and improve Windows automatically */}
            {step === 'win7_updates' && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Help protect your computer and improve Windows automatically</h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Use recommended settings to keep your computer up to date with the latest security definitions.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Recommended Settings */}
                  <button
                    type="button"
                    onClick={() => handleSelectUpdateMode('recommended')}
                    className="w-full text-left p-3.5 bg-white hover:bg-sky-50 border border-slate-300 hover:border-blue-400 rounded-lg flex items-start gap-3 transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-blue-900 group-hover:text-blue-700">
                        Use recommended settings
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Install important and recommended updates, help make Internet browsing safer, check online for solutions to problems.
                      </p>
                    </div>
                  </button>

                  {/* Install important updates only */}
                  <button
                    type="button"
                    onClick={() => handleSelectUpdateMode('important')}
                    className="w-full text-left p-3.5 bg-white hover:bg-sky-50 border border-slate-300 hover:border-blue-400 rounded-lg flex items-start gap-3 transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-blue-900 group-hover:text-blue-700">
                        Install important updates only
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Only install security and other critical updates for Windows.
                      </p>
                    </div>
                  </button>

                  {/* Ask me later */}
                  <button
                    type="button"
                    onClick={() => handleSelectUpdateMode('later')}
                    className="w-full text-left p-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-start gap-3 transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">Ask me later</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Until you decide, your computer might be vulnerable to security threats.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="border-t border-slate-300 pt-3 text-[11px] text-slate-500">
                  <span>Learn more about each option in Windows Help and Support.</span>
                </div>
              </div>
            )}

            {/* SCREEN 5: Review your time and date settings */}
            {step === 'win7_datetime' && (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Review your time and date settings</h2>
                    <p className="text-xs text-slate-600 mt-1">
                      Set the current time zone, date, and local clock.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Time Zone */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Time zone:</label>
                      <select
                        value={timeZone}
                        onChange={(e) => setTimeZone(e.target.value)}
                        className="w-full bg-white border border-slate-400 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-inner cursor-pointer"
                      >
                        <option value="(UTC-06:00) Central Time (US & Canada)">(UTC-06:00) Central Time (US & Canada)</option>
                        <option value="(UTC-05:00) Eastern Time (US & Canada)">(UTC-05:00) Eastern Time (US & Canada)</option>
                        <option value="(UTC-08:00) Pacific Time (US & Canada)">(UTC-08:00) Pacific Time (US & Canada)</option>
                        <option value="(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi">(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi</option>
                        <option value="(UTC+08:00) Manila, Taipei, Singapore">(UTC+08:00) Manila, Taipei, Singapore</option>
                        <option value="(UTC+00:00) Dublin, Edinburgh, Lisbon, London">(UTC+00:00) Dublin, Edinburgh, Lisbon, London</option>
                      </select>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="dst"
                          checked={autoDst}
                          onChange={(e) => setAutoDst(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                        <label htmlFor="dst" className="text-slate-700 text-xs cursor-pointer">
                          Automatically adjust clock for Daylight Saving Time
                        </label>
                      </div>
                    </div>

                    {/* Date and Time Pickers */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="p-3 bg-white border border-slate-300 rounded">
                        <span className="font-semibold text-slate-700 block mb-2 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-blue-600" /> Date
                        </span>
                        <input
                          type="date"
                          value={currentDate}
                          onChange={(e) => setCurrentDate(e.target.value)}
                          className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-800"
                        />
                      </div>

                      <div className="p-3 bg-white border border-slate-300 rounded">
                        <span className="font-semibold text-slate-700 block mb-2 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-blue-600" /> Time
                        </span>
                        <input
                          type="time"
                          value={currentTime}
                          onChange={(e) => setCurrentTime(e.target.value)}
                          className="w-full border border-slate-300 rounded p-1.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-300 pt-4">
                  <button
                    type="button"
                    onClick={handleNextFromDateTime}
                    className="px-6 py-1.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 border border-slate-400 rounded text-slate-900 font-bold text-xs shadow transition-all cursor-pointer"
                  >
                    <span className="underline">N</span>ext &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 6: Select your computer's current location */}
            {step === 'win7_network' && (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Select your computer's current location</h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Windows will automatically apply the correct network security settings based on the network type.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Home network */}
                  <button
                    type="button"
                    onClick={() => handleSelectNetwork('home')}
                    className="w-full text-left p-3.5 bg-white hover:bg-sky-50 border border-slate-300 hover:border-blue-400 rounded-lg flex items-start gap-3 transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-blue-900 group-hover:text-blue-700">
                        Home network
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        If all the computers on this network are at your home, and you recognize them. Network discovery is turned on.
                      </p>
                    </div>
                  </button>

                  {/* Work network */}
                  <button
                    type="button"
                    onClick={() => handleSelectNetwork('work')}
                    className="w-full text-left p-3.5 bg-white hover:bg-sky-50 border border-slate-300 hover:border-blue-400 rounded-lg flex items-start gap-3 transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-blue-900 group-hover:text-blue-700">
                        Work network
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        If all the computers on this network are at your workplace or school campus. Network discovery is turned on.
                      </p>
                    </div>
                  </button>

                  {/* Public network */}
                  <button
                    type="button"
                    onClick={() => handleSelectNetwork('public')}
                    className="w-full text-left p-3.5 bg-white hover:bg-sky-50 border border-slate-300 hover:border-blue-400 rounded-lg flex items-start gap-3 transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <Coffee className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-blue-900 group-hover:text-blue-700">
                        Public network
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        If you don't recognize all the computers on the network (such as in a coffee shop or airport).
                      </p>
                    </div>
                  </button>
                </div>

                <div className="border-t border-slate-300 pt-3 text-[11px] text-slate-500">
                  <span>You can change this setting at any time in Network and Sharing Center.</span>
                </div>
              </div>
            )}

            {/* SCREEN 7A: Windows is finalizing your settings */}
            {step === 'win7_finalizing' && (
              <div className="space-y-6 flex-1 flex flex-col justify-center items-center text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Windows is finalizing your settings</h3>
                  <p className="text-xs text-slate-500">Please wait while the system completes configuration...</p>
                </div>
              </div>
            )}

            {/* SCREEN 7B: Welcome Screen */}
            {step === 'win7_welcome' && (
              <div className="space-y-6 flex-1 flex flex-col justify-center items-center text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-tr from-sky-400 to-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-sky-500/30">
                  <User className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-blue-950">Welcome</h3>
                  <p className="text-sm font-semibold text-slate-700">{username}</p>
                </div>
              </div>
            )}

            {/* SCREEN 7C: Preparing your desktop */}
            {step === 'win7_preparing' && (
              <div className="space-y-6 flex-1 flex flex-col justify-center items-center text-center py-12">
                <Sparkles className="w-10 h-10 text-sky-500 animate-pulse mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Preparing your desktop...</h3>
                  <p className="text-xs text-slate-500">Evaluating configuration accuracy and generating rubric score...</p>
                </div>
              </div>
            )}

          </div>
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
