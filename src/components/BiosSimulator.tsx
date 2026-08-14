import React, { useState, useEffect, useCallback } from 'react';
import { OSType, BiosConfig, TaskRequirement } from '../types';
import { HelpRubricModal } from './HelpRubricModal';
import { AlertTriangle, Key, ShieldCheck, Check, Save } from 'lucide-react';

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
  const tabs = ['main', 'advanced', 'security', 'boot', 'exit'] as const;
  type TabType = typeof tabs[number];

  const [activeTab, setActiveTab] = useState<TabType>('boot');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [config, setConfig] = useState<BiosConfig>({ ...biosConfig });
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showMouseToast, setShowMouseToast] = useState(false);

  // Define menu items for each tab
  const getTabItems = useCallback((tab: TabType) => {
    switch (tab) {
      case 'main':
        return [
          { id: 'time', label: 'System Time:', value: '[10:24:30]' },
          { id: 'date', label: 'System Date:', value: '[08/12/2026]' },
          { id: 'drive', label: 'Primary Master:', value: `Virtual SATA SSD (${task.diskSizeGB} GB)` },
          { id: 'mem', label: 'System Memory:', value: '640 KB' },
          { id: 'extmem', label: 'Extended Memory:', value: '16383 MB' }
        ];
      case 'advanced':
        return [
          { id: 'sata', label: 'SATA Controller Mode', value: `[${config.sataMode.toUpperCase()}]` },
          { id: 'cpu', label: 'Processor Type', value: 'Intel Core i7-11700K' },
          { id: 'vt', label: 'Virtualization Technology', value: '[Enabled]' }
        ];
      case 'security':
        return [
          { id: 'secureboot', label: 'Secure Boot Control', value: `[${config.secureBoot ? 'Enabled' : 'Disabled'}]` },
          { id: 'tpm', label: 'TPM 2.0 / Intel PTT State', value: `[${config.tpmEnabled ? 'Enabled' : 'Disabled'}]` },
          { id: 'pass', label: 'Supervisor Password', value: 'Clear' }
        ];
      case 'boot':
        return config.bootOrder.map((device, idx) => {
          const devName = device === 'usb'
            ? 'Removable Devices (USB Flash Drive)'
            : device === 'hdd'
            ? 'Hard Drive (Drive 0)'
            : 'CD-ROM Drive';
          return {
            id: `boot_${device}`,
            label: `${idx + 1}. ${devName}`,
            value: idx === 0 ? '[1st Boot Device]' : ''
          };
        }).concat([
          { id: 'bootmode', label: 'Boot Mode Priority', value: `[${config.bootMode.toUpperCase()}]` }
        ]);
      case 'exit':
        return [
          { id: 'save_exit', label: 'Save Changes and Exit', value: '(Press F10 or Enter)' },
          { id: 'discard_exit', label: 'Discard Changes and Exit', value: '' },
          { id: 'defaults', label: 'Get Default Values', value: '(Press F9)' }
        ];
    }
  }, [config, task.diskSizeGB]);

  const currentItems = getTabItems(activeTab);

  const triggerMouseWarning = () => {
    setShowMouseToast(true);
    setTimeout(() => setShowMouseToast(false), 3000);
  };

  // Helper to reorder boot device
  const moveBootDevice = useCallback((dir: 'up' | 'down') => {
    if (activeTab !== 'boot') return;
    if (selectedIndex >= config.bootOrder.length) return; // on bootMode

    const newOrder = [...config.bootOrder];
    const targetIdx = dir === 'up' ? selectedIndex - 1 : selectedIndex + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;

    const temp = newOrder[selectedIndex];
    newOrder[selectedIndex] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;

    setConfig(prev => ({ ...prev, bootOrder: newOrder }));
    setSelectedIndex(targetIdx);
  }, [activeTab, selectedIndex, config.bootOrder]);

  // Toggle item value
  const toggleCurrentValue = useCallback(() => {
    const items = getTabItems(activeTab);
    const item = items[selectedIndex];
    if (!item) return;

    if (item.id === 'sata') {
      setConfig(prev => ({ ...prev, sataMode: prev.sataMode === 'ahci' ? 'ide' : 'ahci' }));
    } else if (item.id === 'secureboot') {
      setConfig(prev => ({ ...prev, secureBoot: !prev.secureBoot }));
    } else if (item.id === 'tpm') {
      setConfig(prev => ({ ...prev, tpmEnabled: !prev.tpmEnabled }));
    } else if (item.id === 'bootmode') {
      setConfig(prev => ({ ...prev, bootMode: prev.bootMode === 'legacy' ? 'uefi' : 'legacy' }));
    } else if (item.id === 'save_exit') {
      setShowConfirmExit(true);
    } else if (item.id === 'defaults') {
      setConfig({
        bootOrder: ['hdd', 'cdrom', 'usb'],
        bootMode: 'legacy',
        sataMode: 'ide',
        secureBoot: false,
        tpmEnabled: false,
        savedAndExited: false
      });
    }
  }, [activeTab, selectedIndex, getTabItems]);

  // Global Keyboard Navigation Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scroll or shortcut interference
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'F1', 'F9', 'F10'].includes(e.key)) {
        e.preventDefault();
      }

      if (showConfirmExit) {
        if (e.key === 'Enter' || e.key === 'y' || e.key === 'Y') {
          onSaveBios({ ...config, savedAndExited: true });
        } else if (e.key === 'Escape' || e.key === 'n' || e.key === 'N') {
          setShowConfirmExit(false);
        }
        return;
      }

      // Tab switching: ArrowLeft / ArrowRight
      if (e.key === 'ArrowLeft') {
        const currentTabIdx = tabs.indexOf(activeTab);
        const prevTabIdx = (currentTabIdx - 1 + tabs.length) % tabs.length;
        setActiveTab(tabs[prevTabIdx]);
        setSelectedIndex(0);
      } else if (e.key === 'ArrowRight') {
        const currentTabIdx = tabs.indexOf(activeTab);
        const nextTabIdx = (currentTabIdx + 1) % tabs.length;
        setActiveTab(tabs[nextTabIdx]);
        setSelectedIndex(0);
      }

      // Vertical item selection: ArrowUp / ArrowDown
      else if (e.key === 'ArrowDown') {
        const items = getTabItems(activeTab);
        setSelectedIndex(prev => (prev >= items.length - 1 ? 0 : prev + 1));
      } else if (e.key === 'ArrowUp') {
        const items = getTabItems(activeTab);
        setSelectedIndex(prev => (prev <= 0 ? items.length - 1 : prev - 1));
      }

      // Value modification or boot ordering: + / - / Enter / Space
      else if (e.key === '+' || e.key === '=' || e.key === 'PageUp') {
        if (activeTab === 'boot' && selectedIndex < config.bootOrder.length) {
          moveBootDevice('up');
        } else {
          toggleCurrentValue();
        }
      } else if (e.key === '-' || e.key === '_' || e.key === 'PageDown') {
        if (activeTab === 'boot' && selectedIndex < config.bootOrder.length) {
          moveBootDevice('down');
        } else {
          toggleCurrentValue();
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        toggleCurrentValue();
      }

      // Function Keys
      else if (e.key === 'F10') {
        setShowConfirmExit(true);
      } else if (e.key === 'F9') {
        setConfig({
          bootOrder: ['hdd', 'cdrom', 'usb'],
          bootMode: 'legacy',
          sataMode: 'ide',
          secureBoot: false,
          tpmEnabled: false,
          savedAndExited: false
        });
      } else if (e.key === 'Escape') {
        if (activeTab !== 'exit') {
          setActiveTab('exit');
          setSelectedIndex(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, selectedIndex, config, showConfirmExit, getTabItems, moveBootDevice, toggleCurrentValue, onSaveBios]);

  return (
    <div 
      onClick={triggerMouseWarning}
      className="fixed inset-0 bg-slate-950 flex flex-col justify-between p-2 sm:p-6 select-none z-50 font-mono"
    >
      <HelpRubricModal task={task} selectedOS={os} />

      {/* Keyboard Only Floating Toast Warning */}
      {showMouseToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-2xl text-xs border-2 border-amber-500 animate-bounce flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />
          <span>⚠️ KEYBOARD ONLY IN BIOS! Use ← → Arrow Keys for Tabs, ↑ ↓ for Items, -/+ or Enter to Change, F10 Save & Exit.</span>
        </div>
      )}

      {/* Main PhoenixBIOS Window Canvas (Pixel accurate match to image!) */}
      <div className="max-w-4xl mx-auto w-full border-4 border-[#00a8a8] shadow-2xl flex flex-col flex-1 my-auto overflow-hidden text-xs">
        
        {/* Top Header Bar: Cyan with PhoenixBIOS Title */}
        <div className="bg-[#00a8a8] text-black font-bold text-center py-1 text-sm tracking-wider uppercase border-b-2 border-black flex justify-between px-4 items-center">
          <span className="w-24 hidden sm:inline text-[10px] text-slate-900 font-semibold">Phoenix Tech</span>
          <span className="flex-1 text-center font-bold">PhoenixBIOS Setup Utility</span>
          <span className="w-24 text-right text-[10px] text-slate-900 font-semibold hidden sm:inline">v6.00PG</span>
        </div>

        {/* Menu Tabs Bar: Dark Blue Background */}
        <div className="bg-[#0000aa] px-4 py-1 flex items-center justify-start gap-4 text-sm font-bold border-b-2 border-black">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <div
                key={tab}
                className={`px-3 py-0.5 capitalize transition-all ${
                  isSelected
                    ? 'bg-[#bfbfbf] text-[#0000aa] font-black shadow'
                    : 'text-white'
                }`}
              >
                {tab === 'main' ? 'Main' : tab === 'advanced' ? 'Advanced' : tab === 'security' ? 'Security' : tab === 'boot' ? 'Boot' : 'Exit'}
              </div>
            );
          })}
        </div>

        {/* Main Center Area: Two Columns over Light Gray Canvas */}
        <div className="flex-1 bg-[#bfbfbf] text-black flex flex-col md:flex-row border-b-2 border-black overflow-hidden min-h-[380px]">
          
          {/* Left Column: Menu Items (~65% width) */}
          <div className="flex-1 p-4 border-r-2 border-black space-y-1.5 overflow-y-auto">
            {currentItems.map((item, index) => {
              const isFocused = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between px-2 py-1 text-xs font-bold leading-none ${
                    isFocused
                      ? 'bg-[#0000aa] text-white shadow'
                      : 'text-[#0000aa]'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className={isFocused ? 'text-amber-300' : 'text-slate-900'}>
                    {item.value}
                  </span>
                </div>
              );
            })}

            {/* Sub-note hint in Boot tab */}
            {activeTab === 'boot' && (
              <div className="pt-6 text-[11px] text-[#0000aa] italic space-y-1 border-t border-slate-500/50 mt-4">
                <p>Use <strong className="text-black font-bold">&lt;+&gt;</strong> or <strong className="text-black font-bold">&lt;-&gt;</strong> keys to move device up or down in boot priority list.</p>
                <p className="text-amber-900 font-semibold">1st Boot Device must be set to <span className="underline uppercase font-bold">USB Flash Drive</span> for installation media boot.</p>
              </div>
            )}

            {/* Sub-note in Security tab */}
            {activeTab === 'security' && (
              <div className="pt-6 text-[11px] text-[#0000aa] italic border-t border-slate-500/50 mt-4">
                <p>Requirement for Windows 11: Secure Boot = <strong className="text-black uppercase">{task.biosReq.secureBoot ? 'Enabled' : 'Disabled'}</strong> | TPM 2.0 = <strong className="text-black uppercase">{task.biosReq.tpmEnabled ? 'Enabled' : 'Disabled'}</strong></p>
              </div>
            )}
          </div>

          {/* Right Column: Item Specific Help (~35% width matching reference image!) */}
          <div className="w-full md:w-80 bg-[#bfbfbf] p-3 text-black font-mono text-xs flex flex-col justify-between border-t-2 md:border-t-0 border-black">
            <div>
              <div className="border-b border-black pb-1 mb-2 font-bold text-center text-sm uppercase text-[#0000aa]">
                Item Specific Help
              </div>

              {activeTab === 'boot' ? (
                <div className="space-y-2 text-[11px] leading-relaxed text-slate-900">
                  <p className="font-semibold text-black">Keys used to view or configure devices:</p>
                  <p><strong className="text-[#0000aa]">&lt;Enter&gt;</strong> expands or collapses devices with a + or -</p>
                  <p><strong className="text-[#0000aa]">&lt;Ctrl+Enter&gt;</strong> expands all</p>
                  <p><strong className="text-[#0000aa]">&lt;+&gt;</strong> and <strong className="text-[#0000aa]">&lt;-&gt;</strong> moves the device up or down in priority.</p>
                  <p><strong className="text-[#0000aa]">&lt;n&gt;</strong> May move removable device between Hard Disk or Removable Disk</p>
                  <p><strong className="text-[#0000aa]">&lt;d&gt;</strong> Remove a device that is not installed.</p>
                </div>
              ) : activeTab === 'advanced' ? (
                <div className="space-y-2 text-[11px] leading-relaxed text-slate-900">
                  <p className="font-semibold text-black">Configure SATA Controller:</p>
                  <p><strong className="text-[#0000aa]">AHCI Mode:</strong> Advanced Host Controller Interface for SSD performance.</p>
                  <p><strong className="text-[#0000aa]">IDE Mode:</strong> Legacy compatibility mode for older operating systems.</p>
                  <p className="pt-2 text-[#0000aa] font-bold">Press &lt;+&gt; or &lt;-&gt; or &lt;Enter&gt; to toggle setting.</p>
                </div>
              ) : activeTab === 'security' ? (
                <div className="space-y-2 text-[11px] leading-relaxed text-slate-900">
                  <p className="font-semibold text-black">Firmware Security Settings:</p>
                  <p><strong className="text-[#0000aa]">Secure Boot:</strong> Ensures only authorized firmware boots.</p>
                  <p><strong className="text-[#0000aa]">TPM 2.0 / PTT:</strong> Hardware cryptographic module for Windows 11 compatibility.</p>
                </div>
              ) : (
                <div className="space-y-2 text-[11px] leading-relaxed text-slate-900">
                  <p className="font-semibold text-black">BIOS Navigation Help:</p>
                  <p>Use <strong className="text-[#0000aa]">&lt;← →&gt;</strong> to select Menu screens.</p>
                  <p>Use <strong className="text-[#0000aa]">&lt;↑ ↓&gt;</strong> to select options within a Menu.</p>
                  <p>Press <strong className="text-[#0000aa]">&lt;F10&gt;</strong> to save configuration and exit setup.</p>
                </div>
              )}
            </div>

            <div className="p-2 bg-[#a0a0a0] border border-slate-600 rounded text-[10px] text-slate-900 mt-4">
              Student Task Target: Boot Order = <strong className="text-black uppercase">USB 1st</strong> | SATA = <strong className="text-black uppercase">{task.biosReq.sataMode}</strong>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar: Cyan Background (Matching exact bottom legend in image!) */}
        <div className="bg-[#00a8a8] text-black font-bold p-2 text-[11px] space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span><strong className="text-[#0000aa]">F1</strong> Help</span>
            <span><strong className="text-[#0000aa]">↑↓</strong> Select Item</span>
            <span><strong className="text-[#0000aa]">-/+</strong> Change Values</span>
            <span><strong className="text-[#0000aa]">F9</strong> Setup Defaults</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 border-t border-black/30">
            <span><strong className="text-[#0000aa]">Esc</strong> Exit</span>
            <span><strong className="text-[#0000aa]">←→</strong> Select Menu</span>
            <span><strong className="text-[#0000aa]">Enter</strong> Select Sub-Menu</span>
            <span><strong className="text-[#0000aa]">F10</strong> Save and Exit</span>
          </div>
        </div>
      </div>

      {/* Save & Exit Confirmation Modal */}
      {showConfirmExit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-mono">
          <div className="bg-[#bfbfbf] border-4 border-[#0000aa] p-6 max-w-md w-full shadow-2xl text-black space-y-4">
            <div className="bg-[#0000aa] text-white font-bold p-2 text-center text-sm uppercase">
              Save configuration changes and exit now?
            </div>
            <p className="text-xs text-black leading-relaxed font-semibold">
              Boot Order: <strong className="text-[#0000aa] uppercase">{config.bootOrder[0]} FIRST</strong> | Mode: <strong className="text-[#0000aa] uppercase">{config.bootMode}</strong> | SATA: <strong className="text-[#0000aa] uppercase">{config.sataMode}</strong>
            </p>
            <div className="p-2 bg-yellow-200 border border-yellow-500 text-[11px] text-yellow-950 font-bold">
              Press [ENTER] or [Y] to Confirm Save & Reboot. Press [ESC] or [N] to Cancel.
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmExit(false)}
                className="px-4 py-1.5 bg-[#a0a0a0] hover:bg-slate-400 text-black font-bold border border-black text-xs"
              >
                [Esc] Cancel
              </button>
              <button
                onClick={() => onSaveBios({ ...config, savedAndExited: true })}
                className="px-4 py-1.5 bg-[#0000aa] hover:bg-blue-800 text-white font-bold border border-black text-xs shadow"
              >
                [Enter] Save & Reboot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
