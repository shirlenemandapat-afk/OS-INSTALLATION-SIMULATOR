import React, { useState } from 'react';
import { OSType, BiosConfig, TaskRequirement } from '../types';
import { HelpRubricModal } from './HelpRubricModal';
import { Cpu, HardDrive, Shield, Check, Save, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

interface BiosSimulatorProps {
  os: OSType;
  task: TaskRequirement;
  biosConfig: BiosConfig;
  onSaveBios: (updatedConfig: BiosConfig) => void;
}

export const BiosSimulator: React.FC<BiosSimulatorProps> = ({
  os,
  task,
  biosConfig,
  onSaveBios
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'advanced' | 'boot' | 'security' | 'exit'>('boot');
  const [config, setConfig] = useState<BiosConfig>({ ...biosConfig });
  const [showConfirmExit, setShowConfirmExit] = useState(false);

  // Helper to move boot item up/down
  const moveBootItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...config.bootOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setConfig({ ...config, bootOrder: newOrder });
  };

  const handleSaveAndExit = () => {
    onSaveBios({
      ...config,
      savedAndExited: true
    });
  };

  // Aesthetics based on selected OS era
  const getBiosTheme = () => {
    switch (os) {
      case 'win7':
        return {
          containerClass: 'bg-blue-900 text-yellow-300 font-mono text-sm border-4 border-slate-300',
          headerBg: 'bg-slate-300 text-blue-950 font-bold px-4 py-1.5 flex justify-between items-center',
          tabActive: 'bg-yellow-400 text-blue-950 font-bold px-3 py-1',
          tabInactive: 'text-white hover:text-yellow-200 px-3 py-1',
          panelBg: 'bg-blue-950 border-2 border-slate-400 p-4 min-h-[420px]',
          accentText: 'text-white font-bold',
          title: 'Phoenix - AwardBIOS CMOS Setup Utility (Legacy v6.00PG)'
        };
      case 'win10':
        return {
          containerClass: 'bg-slate-950 text-slate-100 font-sans text-sm border border-slate-800',
          headerBg: 'bg-slate-900 border-b border-slate-800 text-sky-400 font-bold px-6 py-3 flex justify-between items-center',
          tabActive: 'bg-sky-600 text-white font-bold px-4 py-2 rounded-t-lg',
          tabInactive: 'text-slate-400 hover:text-slate-200 px-4 py-2',
          panelBg: 'bg-slate-900/90 border border-slate-800 rounded-b-xl p-6 min-h-[420px]',
          accentText: 'text-sky-300 font-semibold',
          title: 'Aptio Setup Utility - American Megatrends (UEFI Mode)'
        };
      case 'win11':
        return {
          containerClass: 'bg-slate-950 text-slate-100 font-sans text-sm border border-indigo-900/50',
          headerBg: 'bg-gradient-to-r from-indigo-950 via-slate-950 to-blue-950 border-b border-indigo-800/40 px-6 py-3 flex justify-between items-center',
          tabActive: 'bg-indigo-600 text-white font-bold px-4 py-2 rounded-t-xl shadow-lg shadow-indigo-600/20',
          tabInactive: 'text-slate-400 hover:text-slate-200 px-4 py-2',
          panelBg: 'bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-b-2xl p-6 min-h-[420px]',
          accentText: 'text-indigo-300 font-semibold',
          title: 'ROG / ASUS UEFI BIOS Utility - Advanced Mode (TPM 2.0 Ready)'
        };
    }
  };

  const theme = getBiosTheme();

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col justify-between p-4 md:p-8 select-none z-50">
      <HelpRubricModal task={task} selectedOS={os} />

      <div className={`max-w-5xl mx-auto w-full shadow-2xl rounded-xl overflow-hidden ${theme.containerClass} flex flex-col flex-1`}>
        {/* BIOS Header Bar */}
        <div className={theme.headerBg}>
          <span className="truncate">{theme.title}</span>
          <span className="text-xs opacity-90 hidden sm:inline">System Time: {new Date().toLocaleTimeString()}</span>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900/90 px-4 pt-2 border-b border-slate-800 flex items-center gap-1 overflow-x-auto">
          {(['main', 'advanced', 'boot', 'security', 'exit'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? theme.tabActive : theme.tabInactive}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className={`flex-1 ${theme.panelBg} flex flex-col justify-between gap-6`}>
          {activeTab === 'main' && (
            <div className="space-y-4">
              <h3 className={`text-base border-b border-slate-700 pb-2 ${theme.accentText}`}>System Information Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs space-y-1">
                <div>BIOS Version: <strong className="text-white">v3.2.1-LabBuild</strong></div>
                <div>Processor: <strong className="text-white">Intel Core i7-11700K @ 3.60GHz</strong></div>
                <div>Installed Memory: <strong className="text-white">16,384 MB DDR4</strong></div>
                <div>Storage Drive 0: <strong className="text-white">Virtual SATA SSD ({task.diskSizeGB} GB)</strong></div>
                <div>Target OS Requested: <strong className="text-amber-400 uppercase font-bold">{os}</strong></div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <h3 className={`text-base border-b border-slate-700 pb-2 ${theme.accentText}`}>Storage Controller & SATA Configuration</h3>
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">SATA Controller Mode:</span>
                    <span className="text-[11px] text-slate-400">Select AHCI for modern SSD performance or IDE for legacy compatibility.</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfig({ ...config, sataMode: 'ahci' })}
                      className={`px-3 py-1.5 rounded font-bold border transition-all ${
                        config.sataMode === 'ahci'
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      AHCI
                    </button>
                    <button
                      onClick={() => setConfig({ ...config, sataMode: 'ide' })}
                      className={`px-3 py-1.5 rounded font-bold border transition-all ${
                        config.sataMode === 'ide'
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      IDE
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-amber-300 text-[11px]">
                  Task Requirement: Set SATA Mode to <strong className="uppercase font-bold text-amber-400">{task.biosReq.sataMode}</strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'boot' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <h3 className={`text-base ${theme.accentText}`}>Boot Order Priority & Mode Settings</h3>
                <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                  Target: Set USB Flash Drive as 1st Boot Device
                </span>
              </div>

              {/* Boot Order List */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">1. Boot Device Priority List (1st device boots installer):</label>
                <div className="space-y-2">
                  {config.bootOrder.map((device, index) => {
                    const label = device === 'usb' ? 'USB Flash Drive (Bootable Installer)' : device === 'hdd' ? 'Hard Disk Drive (Drive 0)' : 'CD/DVD-ROM Drive';
                    const isFirst = index === 0;
                    return (
                      <div
                        key={device}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          isFirst
                            ? 'bg-amber-950/40 border-amber-500 text-amber-200 font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                            {index + 1}
                          </span>
                          <span>{label}</span>
                          {isFirst && <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded">1ST BOOT DEVICE</span>}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveBootItem(index, 'up')}
                            disabled={index === 0}
                            className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 text-slate-300"
                            title="Move Up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveBootItem(index, 'down')}
                            disabled={index === config.bootOrder.length - 1}
                            className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 text-slate-300"
                            title="Move Down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Boot Mode Selection */}
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">Boot Mode (UEFI vs Legacy CSM):</span>
                    <span className="text-[11px] text-slate-400">UEFI is required for Windows 11 & modern partition tables (GPT).</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfig({ ...config, bootMode: 'uefi' })}
                      className={`px-3 py-1.5 rounded font-bold border transition-all ${
                        config.bootMode === 'uefi'
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      UEFI Mode
                    </button>
                    <button
                      onClick={() => setConfig({ ...config, bootMode: 'legacy' })}
                      className={`px-3 py-1.5 rounded font-bold border transition-all ${
                        config.bootMode === 'legacy'
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      Legacy CSM
                    </button>
                  </div>
                </div>
                <div className="text-amber-300 text-[11px]">
                  Task Requirement: Set Boot Mode to <strong className="uppercase font-bold text-amber-400">{task.biosReq.bootMode}</strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className={`text-base border-b border-slate-700 pb-2 ${theme.accentText}`}>Security, Secure Boot & TPM 2.0 / PTT</h3>

              <div className="space-y-3 text-xs">
                {/* Secure Boot Toggle */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">Secure Boot Control:</span>
                    <span className="text-[11px] text-slate-400">Ensures system boots using only trusted software firmware.</span>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, secureBoot: !config.secureBoot })}
                    className={`px-4 py-1.5 rounded-lg font-bold border transition-all ${
                      config.secureBoot
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {config.secureBoot ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {/* TPM 2.0 Toggle */}
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-200 block">TPM 2.0 / Intel PTT Device:</span>
                    <span className="text-[11px] text-slate-400">Hardware security processor required for Windows 11 installation.</span>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, tpmEnabled: !config.tpmEnabled })}
                    className={`px-4 py-1.5 rounded-lg font-bold border transition-all ${
                      config.tpmEnabled
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {config.tpmEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="p-3 bg-indigo-950/40 border border-indigo-900/60 rounded-xl text-indigo-300 text-[11px]">
                  Task Requirement: Secure Boot = <strong className="text-white">{task.biosReq.secureBoot ? 'ENABLED' : 'DISABLED'}</strong> | TPM 2.0 = <strong className="text-white">{task.biosReq.tpmEnabled ? 'ENABLED' : 'DISABLED'}</strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exit' && (
            <div className="space-y-6 text-xs max-w-lg mx-auto py-6 text-center">
              <h3 className={`text-lg ${theme.accentText}`}>Exit & Save Configuration Options</h3>
              <p className="text-slate-300">
                After configuring Boot Order, SATA Mode, Boot Mode, and Security settings according to your assigned student task, select <strong className="text-amber-300">Save Changes & Reset</strong> to apply settings and boot into the Windows Installer.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setShowConfirmExit(true)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes and Reset (F10)</span>
                </button>
                <button
                  onClick={() => setActiveTab('boot')}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Discard Changes & Return
                </button>
              </div>
            </div>
          )}

          {/* BIOS Key Legend Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-4">
              <span><kbd className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded">F1</kbd> Help</span>
              <span><kbd className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded">↑↓</kbd> Select Item</span>
              <span><kbd className="bg-slate-800 text-amber-300 px-1 py-0.5 rounded">F10</kbd> Save & Exit</span>
            </div>
            <button
              onClick={() => setShowConfirmExit(true)}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded shadow transition-all"
            >
              F10: Save & Exit
            </button>
          </div>
        </div>
      </div>

      {/* Save & Exit Confirmation Modal */}
      {showConfirmExit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-slate-100">Save Configuration and Exit?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Save configured BIOS settings (Boot Order: <strong className="text-amber-300 uppercase">{config.bootOrder[0]} First</strong>, Mode: <strong className="text-blue-300 uppercase">{config.bootMode}</strong>, SATA: <strong className="text-blue-300 uppercase">{config.sataMode}</strong>) and reboot system into installer?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmExit(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAndExit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save & Exit Setup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
