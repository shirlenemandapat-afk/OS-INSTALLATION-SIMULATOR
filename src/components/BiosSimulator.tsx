import React, { useState, useEffect, useCallback } from 'react';
import { OSType, BiosConfig, TaskRequirement } from '../types';
import { HelpRubricModal } from './HelpRubricModal';
import { 
  AlertTriangle, Key, ShieldCheck, Check, Save, Smartphone, 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CornerDownLeft, 
  Plus, Minus, RotateCcw, X
} from 'lucide-react';

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
  const [showTouchController, setShowTouchController] = useState(true);

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

  // Helper to reorder boot device
  const moveBootDevice = useCallback((dir: 'up' | 'down', customIndex?: number) => {
    const idxToMove = customIndex !== undefined ? customIndex : selectedIndex;
    if (activeTab !== 'boot') return;
    if (idxToMove >= config.bootOrder.length) return; // on bootMode

    const newOrder = [...config.bootOrder];
    const targetIdx = dir === 'up' ? idxToMove - 1 : idxToMove + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;

    const temp = newOrder[idxToMove];
    newOrder[idxToMove] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;

    setConfig(prev => ({ ...prev, bootOrder: newOrder }));
    setSelectedIndex(targetIdx);
  }, [activeTab, selectedIndex, config.bootOrder]);

  // Toggle item value
  const toggleItemValue = useCallback((targetIndex?: number) => {
    const items = getTabItems(activeTab);
    const itemIndex = targetIndex !== undefined ? targetIndex : selectedIndex;
    const item = items[itemIndex];
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
          toggleItemValue();
        }
      } else if (e.key === '-' || e.key === '_' || e.key === 'PageDown') {
        if (activeTab === 'boot' && selectedIndex < config.bootOrder.length) {
          moveBootDevice('down');
        } else {
          toggleItemValue();
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        toggleItemValue();
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
  }, [activeTab, selectedIndex, config, showConfirmExit, getTabItems, moveBootDevice, toggleItemValue, onSaveBios]);

  // Touch handlers for D-Pad
  const handleNavLeft = () => {
    const currentTabIdx = tabs.indexOf(activeTab);
    const prevTabIdx = (currentTabIdx - 1 + tabs.length) % tabs.length;
    setActiveTab(tabs[prevTabIdx]);
    setSelectedIndex(0);
  };

  const handleNavRight = () => {
    const currentTabIdx = tabs.indexOf(activeTab);
    const nextTabIdx = (currentTabIdx + 1) % tabs.length;
    setActiveTab(tabs[nextTabIdx]);
    setSelectedIndex(0);
  };

  const handleNavUp = () => {
    const items = getTabItems(activeTab);
    setSelectedIndex(prev => (prev <= 0 ? items.length - 1 : prev - 1));
  };

  const handleNavDown = () => {
    const items = getTabItems(activeTab);
    setSelectedIndex(prev => (prev >= items.length - 1 ? 0 : prev + 1));
  };

  const handlePlus = () => {
    if (activeTab === 'boot' && selectedIndex < config.bootOrder.length) {
      moveBootDevice('up');
    } else {
      toggleItemValue();
    }
  };

  const handleMinus = () => {
    if (activeTab === 'boot' && selectedIndex < config.bootOrder.length) {
      moveBootDevice('down');
    } else {
      toggleItemValue();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col justify-between p-1 sm:p-4 md:p-6 select-none z-50 font-mono overflow-y-auto">
      <HelpRubricModal task={task} selectedOS={os} />

      {/* Main PhoenixBIOS Window Canvas (Pixel accurate match to image with Touchscreen enablement!) */}
      <div className="max-w-4xl mx-auto w-full border-2 sm:border-4 border-[#00a8a8] shadow-2xl flex flex-col my-auto overflow-hidden text-xs bg-[#bfbfbf]">
        
        {/* Top Header Bar: Cyan with PhoenixBIOS Title */}
        <div className="bg-[#00a8a8] text-black font-bold text-center py-1 sm:py-1.5 text-xs sm:text-sm tracking-wider uppercase border-b-2 border-black flex justify-between px-2 sm:px-4 items-center">
          <span className="hidden sm:inline text-[10px] text-slate-900 font-semibold">Phoenix Tech</span>
          <span className="flex-1 text-center font-bold truncate">PhoenixBIOS Setup Utility</span>
          <span className="text-[10px] text-slate-900 font-semibold hidden sm:inline">v6.00PG</span>
        </div>

        {/* Menu Tabs Bar: Dark Blue Background - Fully Tappable for Touchscreen / CP */}
        <div className="bg-[#0000aa] px-1 sm:px-4 py-1 flex items-center justify-start gap-1 sm:gap-3 text-xs sm:text-sm font-bold border-b-2 border-black overflow-x-auto">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                type="button"
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedIndex(0);
                }}
                className={`px-2 sm:px-3 py-1 capitalize transition-all cursor-pointer rounded-t sm:rounded-none shrink-0 ${
                  isSelected
                    ? 'bg-[#bfbfbf] text-[#0000aa] font-black shadow'
                    : 'text-white hover:bg-blue-800'
                }`}
              >
                {tab === 'main' ? 'Main' : tab === 'advanced' ? 'Advanced' : tab === 'security' ? 'Security' : tab === 'boot' ? 'Boot' : 'Exit'}
              </button>
            );
          })}
        </div>

        {/* Main Center Area: Two Columns over Light Gray Canvas */}
        <div className="bg-[#bfbfbf] text-black flex flex-col md:flex-row border-b-2 border-black overflow-hidden min-h-[300px] sm:min-h-[360px]">
          
          {/* Left Column: Menu Items (~65% width) - Interactive Touch Enabled */}
          <div className="flex-1 p-2 sm:p-4 border-r-0 md:border-r-2 border-black space-y-1.5 overflow-y-auto max-h-[380px] sm:max-h-none">
            <div className="text-[10px] sm:text-xs text-blue-900 font-bold mb-2 flex items-center justify-between">
              <span>📱 Touch any item or button below to configure:</span>
              <span className="text-[10px] text-slate-600 bg-slate-300 px-1.5 py-0.5 rounded">Touchscreen Ready</span>
            </div>

            {currentItems.map((item, index) => {
              const isFocused = index === selectedIndex;
              const isBootDevice = activeTab === 'boot' && index < config.bootOrder.length;
              const isToggleable = ['sata', 'secureboot', 'tpm', 'bootmode'].includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedIndex(index);
                    if (isToggleable) {
                      toggleItemValue(index);
                    } else if (item.id === 'save_exit') {
                      setShowConfirmExit(true);
                    } else if (item.id === 'defaults') {
                      toggleItemValue(index);
                    }
                  }}
                  className={`flex flex-wrap items-center justify-between p-1.5 sm:px-2 sm:py-1 text-xs font-bold leading-tight cursor-pointer rounded transition-colors ${
                    isFocused
                      ? 'bg-[#0000aa] text-white shadow ring-1 ring-amber-300'
                      : 'text-[#0000aa] hover:bg-slate-300'
                  }`}
                >
                  <span className="flex-1 truncate mr-2">{item.label}</span>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={isFocused ? 'text-amber-300' : 'text-slate-900'}>
                      {item.value}
                    </span>

                    {/* Quick Touch Toggle Buttons for Cellphone / Touch Navigation */}
                    {isToggleable && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIndex(index);
                          toggleItemValue(index);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold border transition-transform active:scale-95 ${
                          isFocused
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-[#0000aa] text-white border-blue-900'
                        }`}
                      >
                        Change ⇄
                      </button>
                    )}

                    {/* Boot Device Up/Down Quick Touch Controls */}
                    {isBootDevice && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBootDevice('up', index);
                          }}
                          disabled={index === 0}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            index === 0
                              ? 'opacity-30 cursor-not-allowed bg-slate-400 text-slate-600'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 cursor-pointer'
                          }`}
                          title="Move Up in Boot Priority"
                        >
                          ▲ Up
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBootDevice('down', index);
                          }}
                          disabled={index >= config.bootOrder.length - 1}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            index >= config.bootOrder.length - 1
                              ? 'opacity-30 cursor-not-allowed bg-slate-400 text-slate-600'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 cursor-pointer'
                          }`}
                          title="Move Down in Boot Priority"
                        >
                          ▼ Down
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Sub-note hint in Boot tab */}
            {activeTab === 'boot' && (
              <div className="pt-3 text-[11px] text-[#0000aa] italic space-y-1 border-t border-slate-500/50 mt-3">
                <p>Use <strong className="text-black font-bold">&lt;+&gt;</strong> / <strong className="text-black font-bold">&lt;-&gt;</strong> or tap <strong className="text-emerald-800 font-bold">[▲ Up] / [▼ Down]</strong> to set USB as 1st boot device.</p>
                <p className="text-amber-900 font-semibold">1st Boot Device must be set to <span className="underline uppercase font-bold">USB Flash Drive</span> for OS installer.</p>
              </div>
            )}

            {/* Sub-note in Security tab */}
            {activeTab === 'security' && (
              <div className="pt-3 text-[11px] text-[#0000aa] italic border-t border-slate-500/50 mt-3">
                <p>Windows 11 Target: Secure Boot = <strong className="text-black uppercase">{task.biosReq.secureBoot ? 'Enabled' : 'Disabled'}</strong> | TPM 2.0 = <strong className="text-black uppercase">{task.biosReq.tpmEnabled ? 'Enabled' : 'Disabled'}</strong></p>
              </div>
            )}
          </div>

          {/* Right Column: Item Specific Help (~35% width matching reference image!) */}
          <div className="w-full md:w-80 bg-[#bfbfbf] p-3 text-black font-mono text-xs flex flex-col justify-between border-t-2 md:border-t-0 border-black">
            <div>
              <div className="border-b border-black pb-1 mb-2 font-bold text-center text-xs sm:text-sm uppercase text-[#0000aa]">
                Item Specific Help
              </div>

              {activeTab === 'boot' ? (
                <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-900">
                  <p className="font-semibold text-black">Boot Device Configuration:</p>
                  <p>• Tap <strong className="text-[#0000aa]">▲ Up</strong> or <strong className="text-[#0000aa]">▼ Down</strong> to change priority order.</p>
                  <p>• Set <strong className="text-emerald-800 font-bold">USB Flash Drive</strong> to position 1.</p>
                  <p>• Select <strong className="text-[#0000aa]">Boot Mode Priority</strong> to toggle UEFI / Legacy.</p>
                </div>
              ) : activeTab === 'advanced' ? (
                <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-900">
                  <p className="font-semibold text-black">Configure SATA Controller:</p>
                  <p><strong className="text-[#0000aa]">AHCI Mode:</strong> Advanced Host Controller Interface for SSD performance.</p>
                  <p><strong className="text-[#0000aa]">IDE Mode:</strong> Legacy compatibility mode for older operating systems.</p>
                  <p className="pt-1 text-[#0000aa] font-bold">Tap &lt;Change ⇄&gt; to switch SATA mode.</p>
                </div>
              ) : activeTab === 'security' ? (
                <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-900">
                  <p className="font-semibold text-black">Firmware Security Settings:</p>
                  <p><strong className="text-[#0000aa]">Secure Boot:</strong> Ensures only signed bootloaders execute.</p>
                  <p><strong className="text-[#0000aa]">TPM 2.0 / PTT:</strong> Cryptographic security module for Windows 11.</p>
                </div>
              ) : (
                <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-900">
                  <p className="font-semibold text-black">BIOS Navigation Guide:</p>
                  <p>• Tap menu tabs at top to switch views.</p>
                  <p>• Tap any item in list to focus or toggle.</p>
                  <p>• Use the on-screen keypad below on mobile phones.</p>
                </div>
              )}
            </div>

            <div className="p-2 bg-[#a0a0a0] border border-slate-600 rounded text-[10px] text-slate-900 mt-2">
              Target Requirement: Boot = <strong className="text-black uppercase">USB 1st</strong> | SATA = <strong className="text-black uppercase">{task.biosReq.sataMode}</strong>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar: Cyan Background with Quick Touch Action Buttons */}
        <div className="bg-[#00a8a8] text-black font-bold p-1.5 sm:p-2 text-[10px] sm:text-[11px]">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <button
              type="button"
              onClick={() => setShowTouchController(prev => !prev)}
              className="px-2 py-1 bg-slate-900 text-cyan-300 rounded font-bold flex items-center gap-1 text-[10px] sm:text-xs shadow hover:bg-slate-800 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-300" />
              <span>{showTouchController ? 'Hide Keypad' : 'Show Virtual Keypad'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfig({
                  bootOrder: ['hdd', 'cdrom', 'usb'],
                  bootMode: 'legacy',
                  sataMode: 'ide',
                  secureBoot: false,
                  tpmEnabled: false,
                  savedAndExited: false
                })}
                className="px-2 py-1 bg-slate-200 hover:bg-white text-slate-900 border border-black rounded text-[10px] sm:text-xs font-bold cursor-pointer"
              >
                F9 Setup Defaults
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmExit(true)}
                className="px-3 py-1 bg-[#0000aa] hover:bg-blue-800 text-white rounded border border-black text-[10px] sm:text-xs font-bold shadow-md cursor-pointer flex items-center gap-1"
              >
                <Save className="w-3 h-3 text-amber-300" />
                <span>F10 Save & Exit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / Touchscreen Virtual D-Pad & Control Keypad */}
      {showTouchController && (
        <div className="max-w-4xl mx-auto w-full bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-2 sm:p-3 mt-2 shadow-2xl text-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-bold">
            <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="hidden sm:inline">Cellphone Touch Controller:</span>
          </div>

          {/* D-Pad Navigation */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleNavLeft}
              className="w-10 h-10 bg-slate-800 active:bg-blue-600 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center border border-slate-700 active:scale-95 shadow cursor-pointer font-bold text-xs"
              title="Previous Tab (Left)"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleNavUp}
                className="w-10 h-7 bg-slate-800 active:bg-blue-600 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center border border-slate-700 active:scale-95 shadow cursor-pointer font-bold text-xs"
                title="Up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNavDown}
                className="w-10 h-7 bg-slate-800 active:bg-blue-600 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center border border-slate-700 active:scale-95 shadow cursor-pointer font-bold text-xs"
                title="Down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleNavRight}
              className="w-10 h-10 bg-slate-800 active:bg-blue-600 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center border border-slate-700 active:scale-95 shadow cursor-pointer font-bold text-xs"
              title="Next Tab (Right)"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons: -, +, Enter, F10 */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={handleMinus}
              className="px-3 py-2 bg-slate-800 active:bg-indigo-600 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 active:scale-95 font-bold text-xs flex items-center gap-1 cursor-pointer"
              title="Decrease / Move Down (-)"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>[-]</span>
            </button>

            <button
              type="button"
              onClick={handlePlus}
              className="px-3 py-2 bg-slate-800 active:bg-indigo-600 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 active:scale-95 font-bold text-xs flex items-center gap-1 cursor-pointer"
              title="Increase / Move Up (+)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>[+]</span>
            </button>

            <button
              type="button"
              onClick={() => toggleItemValue()}
              className="px-3 py-2 bg-blue-600 active:bg-blue-500 hover:bg-blue-700 text-white rounded-lg border border-blue-500 active:scale-95 font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
              title="Enter / Select"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>Enter</span>
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmExit(true)}
              className="px-3 py-2 bg-emerald-600 active:bg-emerald-500 hover:bg-emerald-700 text-white rounded-lg border border-emerald-500 active:scale-95 font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
              title="F10 Save & Exit"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save (F10)</span>
            </button>
          </div>
        </div>
      )}

      {/* Save & Exit Confirmation Modal */}
      {showConfirmExit && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-mono">
          <div className="bg-[#bfbfbf] border-4 border-[#0000aa] p-4 sm:p-6 max-w-md w-full shadow-2xl text-black space-y-4 rounded">
            <div className="bg-[#0000aa] text-white font-bold p-2 text-center text-xs sm:text-sm uppercase rounded">
              Save configuration changes and exit now?
            </div>
            <p className="text-xs text-black leading-relaxed font-semibold">
              Boot Order: <strong className="text-[#0000aa] uppercase">{config.bootOrder[0]} FIRST</strong> | Mode: <strong className="text-[#0000aa] uppercase">{config.bootMode}</strong> | SATA: <strong className="text-[#0000aa] uppercase">{config.sataMode}</strong>
            </p>
            <div className="p-2 bg-yellow-200 border border-yellow-500 text-[11px] text-yellow-950 font-bold rounded">
              Confirm to Save BIOS settings & reboot into Windows Installation.
            </div>
            <div className="flex items-center justify-end gap-2 sm:gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmExit(false)}
                className="px-4 py-2 bg-[#a0a0a0] hover:bg-slate-400 text-black font-bold border border-black text-xs rounded active:scale-95 cursor-pointer min-h-[44px]"
              >
                [Esc] Cancel
              </button>
              <button
                type="button"
                onClick={() => onSaveBios({ ...config, savedAndExited: true })}
                className="px-4 py-2 bg-[#0000aa] hover:bg-blue-800 text-white font-bold border border-black text-xs shadow rounded active:scale-95 cursor-pointer min-h-[44px]"
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
