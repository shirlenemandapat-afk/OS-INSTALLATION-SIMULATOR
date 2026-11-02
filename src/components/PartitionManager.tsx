import React, { useState } from 'react';
import { OSType, PartitionItem, TaskRequirement } from '../types';
import { 
  HardDrive, 
  Trash2, 
  Layers, 
  Plus, 
  AlertTriangle,
  FolderOpen,
  RotateCw
} from 'lucide-react';

interface PartitionManagerProps {
  os: OSType;
  task: TaskRequirement;
  partitions: PartitionItem[];
  selectedPartitionId: string | null;
  onUpdatePartitions: (newPartitions: PartitionItem[], selectedId: string | null) => void;
  onNextStep: () => void;
}

export const PartitionManager: React.FC<PartitionManagerProps> = ({
  os,
  task,
  partitions,
  selectedPartitionId,
  onUpdatePartitions,
  onNextStep
}) => {
  // Advanced drive options toggle (matches win7_8.jpg)
  const [showDriveOptions, setShowDriveOptions] = useState(false);
  
  // Inline "New" partition creation form
  const [showInlineNew, setShowInlineNew] = useState(false);
  const [inputMB, setInputMB] = useState<number>(task.diskSizeGB * 1024);
  
  // Authentic Windows 7 system dialog prompts
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFormatConfirm, setShowFormatConfirm] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const totalDriveMB = task.diskSizeGB * 1024;
  const unallocated = partitions.find(p => p.type === 'unallocated');
  const availableUnallocatedMB = unallocated ? unallocated.sizeMB : 0;
  const selectedPart = partitions.find(p => p.id === selectedPartitionId);

  const handleSelectPartition = (id: string) => {
    onUpdatePartitions(partitions, id);
    const target = partitions.find(p => p.id === id);
    if (target?.type === 'unallocated') {
      setStatusNotice('Windows cannot be installed to this hard disk space. Windows must be installed to a partition formatted as NTFS.');
    } else if (target?.type === 'system' || target?.type === 'msr' || target?.type === 'recovery') {
      setStatusNotice(`Windows cannot be installed to ${target.name}. (Show details)`);
    } else {
      setStatusNotice(null);
    }
  };

  const handleOpenNewInline = () => {
    if (!unallocated || unallocated.sizeMB <= 0) {
      setStatusNotice('There is no unallocated space available on this drive. Delete an existing partition first.');
      return;
    }
    setInputMB(unallocated.sizeMB);
    setShowInlineNew(true);
    setStatusNotice(null);
  };

  const handleApplyNewPartition = () => {
    if (inputMB <= 0) {
      setStatusNotice('Please specify a valid partition size greater than 0 MB.');
      return;
    }

    if (!unallocated || inputMB > unallocated.sizeMB) {
      setStatusNotice(`Specified partition size (${inputMB.toLocaleString()} MB) exceeds available unallocated space (${availableUnallocatedMB.toLocaleString()} MB).`);
      return;
    }

    const hasSystemPart = partitions.some(p => p.type === 'system' || p.type === 'recovery');
    if (!hasSystemPart) {
      setShowInlineNew(false);
      setShowSystemPrompt(true);
    } else {
      executePartitionCreation(false);
    }
  };

  const executePartitionCreation = (createSystemPartitions: boolean) => {
    const currentUnallocated = partitions.find(p => p.type === 'unallocated');
    if (!currentUnallocated) return;

    const newPartitionsList: PartitionItem[] = [];
    let remainingMB = currentUnallocated.sizeMB;

    if (createSystemPartitions) {
      if (os === 'win7') {
        newPartitionsList.push({
          id: 'part_sys_reserved',
          driveNumber: 0,
          partitionNumber: 1,
          name: 'Disk 0 Partition 1: System Reserved',
          sizeMB: 100,
          type: 'system',
          formatted: true
        });
        remainingMB -= 100;
      } else {
        newPartitionsList.push({
          id: 'part_efi_sys',
          driveNumber: 0,
          partitionNumber: 1,
          name: 'Drive 0 Partition 1: System',
          sizeMB: 100,
          type: 'system',
          formatted: true
        });
        newPartitionsList.push({
          id: 'part_msr',
          driveNumber: 0,
          partitionNumber: 2,
          name: 'Drive 0 Partition 2: MSR (Reserved)',
          sizeMB: 16,
          type: 'msr',
          formatted: true
        });
        remainingMB -= 116;
      }
    }

    const existingPrimaries = partitions.filter(p => p.type === 'primary');
    const nextPrimaryNum = existingPrimaries.length + (createSystemPartitions ? (os === 'win7' ? 2 : 3) : 1);

    const actualPrimaryMB = Math.min(inputMB, remainingMB);
    const newPrimaryId = `part_primary_${Date.now()}`;
    const newPrimary: PartitionItem = {
      id: newPrimaryId,
      driveNumber: 0,
      partitionNumber: nextPrimaryNum,
      name: `Disk 0 Partition ${nextPrimaryNum}`,
      sizeMB: actualPrimaryMB,
      type: 'primary',
      formatted: false
    };

    remainingMB -= actualPrimaryMB;

    const existingNonUnallocated = partitions.filter(p => p.type !== 'unallocated');
    const updated = [...existingNonUnallocated, ...newPartitionsList, newPrimary];

    if (remainingMB > 10) {
      updated.push({
        id: 'part_unallocated',
        driveNumber: 0,
        partitionNumber: null,
        name: 'Disk 0 Unallocated Space',
        sizeMB: remainingMB,
        type: 'unallocated',
        formatted: false
      });
    }

    onUpdatePartitions(updated, newPrimaryId);
    setShowInlineNew(false);
    setShowSystemPrompt(false);
    setStatusNotice(null);
  };

  const handleConfirmDelete = () => {
    if (!selectedPartitionId) return;
    const target = partitions.find(p => p.id === selectedPartitionId);
    if (!target || target.type === 'unallocated') return;

    const filtered = partitions.filter(p => p.id !== selectedPartitionId);
    const freedMB = target.sizeMB;

    const unallocatedItem = filtered.find(p => p.type === 'unallocated');
    if (unallocatedItem) {
      unallocatedItem.sizeMB += freedMB;
    } else {
      filtered.push({
        id: 'part_unallocated',
        driveNumber: 0,
        partitionNumber: null,
        name: 'Disk 0 Unallocated Space',
        sizeMB: freedMB,
        type: 'unallocated',
        formatted: false
      });
    }

    const remainingPrimaries = filtered.filter(p => p.type === 'primary');
    let finalPartitions = filtered;
    if (remainingPrimaries.length === 0) {
      finalPartitions = [
        {
          id: 'part_unallocated_reset',
          driveNumber: 0,
          partitionNumber: null,
          name: 'Disk 0 Unallocated Space',
          sizeMB: totalDriveMB,
          type: 'unallocated',
          formatted: false
        }
      ];
    }

    onUpdatePartitions(finalPartitions, null);
    setShowDeleteConfirm(false);
    setStatusNotice(null);
  };

  const handleConfirmFormat = () => {
    if (!selectedPartitionId) return;
    const updated = partitions.map(p => {
      if (p.id === selectedPartitionId && p.type === 'primary') {
        return { ...p, formatted: true };
      }
      return p;
    });
    onUpdatePartitions(updated, selectedPartitionId);
    setShowFormatConfirm(false);
    setStatusNotice(null);
  };

  const handleProceedNext = () => {
    if (!selectedPartitionId) {
      setStatusNotice('Please select a partition to install Windows.');
      return;
    }
    const selected = partitions.find(p => p.id === selectedPartitionId);
    if (!selected || selected.type === 'unallocated') {
      setStatusNotice('Windows cannot be installed to this hard disk space. Windows must be installed to a partition formatted as NTFS.');
      return;
    }
    if (selected.type === 'system' || selected.type === 'msr' || selected.type === 'recovery') {
      setStatusNotice(`Windows cannot be installed to ${selected.name}. (Show details)`);
      return;
    }
    setStatusNotice(null);
    onNextStep();
  };

  return (
    <div className="space-y-4 select-none text-slate-800 font-sans">
      {/* Title - Exact match to win7_8.jpg */}
      <div>
        <h2 className="text-[17px] font-normal text-[#1E395B]">
          Where do you want to install Windows?
        </h2>
      </div>

      {/* Partitions Details View Table (Pixel-perfect replica of win7_8.jpg) */}
      <div className="border border-[#7F9DB9] rounded-[1px] bg-white overflow-hidden shadow-inner min-h-[220px]">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-gradient-to-b from-[#F9FAFC] via-[#ECEFF4] to-[#DFE5EE] border-b border-[#A0B0C4] text-[#1E395B] font-normal">
              <th className="py-1 px-3 border-r border-[#C5D0DC] font-normal w-1/2">Name</th>
              <th className="py-1 px-3 border-r border-[#C5D0DC] font-normal">Total Size</th>
              <th className="py-1 px-3 border-r border-[#C5D0DC] font-normal">Free Space</th>
              <th className="py-1 px-3 font-normal">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {partitions.map((p) => {
              const isSelected = p.id === selectedPartitionId;
              const isUnallocated = p.type === 'unallocated';
              const sizeFormatted = p.sizeMB >= 1024 ? `${(p.sizeMB / 1024).toFixed(1)} GB` : `${p.sizeMB}.0 MB`;
              const freeFormatted = p.sizeMB >= 1024 ? `${(p.sizeMB / 1024).toFixed(1)} GB` : `${p.sizeMB}.0 MB`;

              let typeLabel = '';
              if (p.type === 'system') typeLabel = 'System';
              else if (p.type === 'primary') typeLabel = 'Primary';
              else if (p.type === 'msr') typeLabel = 'MSR (Reserved)';

              return (
                <tr
                  key={p.id}
                  onClick={() => handleSelectPartition(p.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#EBF3FB] via-[#DCEBFA] to-[#CEE4FA] text-black border-t border-b border-[#7DA2CE]'
                      : 'hover:bg-[#F4F8FC] text-slate-800'
                  }`}
                >
                  <td className="py-1.5 px-3 flex items-center gap-2">
                    {/* Authentic Windows 7 Hard Drive Icon */}
                    <div className="w-4 h-3.5 bg-gradient-to-b from-slate-200 to-slate-400 border border-slate-500 rounded-[1px] flex items-center justify-center shrink-0 shadow-xs">
                      <div className="w-2.5 h-1.5 border-b border-blue-500" />
                    </div>
                    <span className="truncate">{p.name}</span>
                    {p.type === 'primary' && p.formatted && (
                      <span className="text-[10px] text-emerald-700 ml-1 font-mono">(NTFS)</span>
                    )}
                  </td>
                  <td className="py-1.5 px-3 font-mono">{sizeFormatted}</td>
                  <td className="py-1.5 px-3 font-mono">{freeFormatted}</td>
                  <td className="py-1.5 px-3">{typeLabel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Inline "New" Partition Input Row */}
      {showInlineNew && (
        <div className="p-2.5 bg-[#F4F8FC] border border-[#B2CBE4] text-slate-800 text-xs flex flex-wrap items-center justify-between gap-2 rounded-[2px]">
          <div className="flex items-center gap-3">
            <span className="text-slate-800 font-normal">Size:</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={100}
                max={availableUnallocatedMB}
                value={inputMB || ''}
                onChange={(e) => setInputMB(Math.max(0, Number(e.target.value)))}
                className="w-24 px-1.5 py-0.5 text-xs border border-[#7F9DB9] bg-white text-black font-mono focus:outline-none"
                autoFocus
              />
              <span className="text-slate-600 font-normal text-xs">MB</span>
            </div>

            <div className="flex items-center gap-1 ml-2">
              <button
                type="button"
                onClick={() => setInputMB(availableUnallocatedMB)}
                className="text-[10px] px-1.5 py-0.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-[1px] cursor-pointer"
              >
                Max ({availableUnallocatedMB.toLocaleString()} MB)
              </button>
              {task.partitionReq.primarySizeGB * 1024 <= availableUnallocatedMB && (
                <button
                  type="button"
                  onClick={() => setInputMB(task.partitionReq.primarySizeGB * 1024)}
                  className="text-[10px] px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-700 rounded-[1px] cursor-pointer font-medium"
                >
                  Task ({task.partitionReq.primarySizeGB} GB)
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyNewPartition}
              className="px-4 py-0.5 text-xs bg-gradient-to-b from-[#F2F2F2] to-[#D4D4D4] hover:border-[#3C7FB1] border border-[#707070] text-black rounded-[2px] cursor-pointer shadow-xs"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setShowInlineNew(false)}
              className="px-3 py-0.5 text-xs bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-[2px] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Links & Drive Options Bar (Exact match to win7_8.jpg) */}
      <div className="flex items-center justify-between text-xs pt-1">
        {/* Left Links: Refresh & Load Driver */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => onUpdatePartitions(partitions, selectedPartitionId)}
            className="flex items-center gap-1.5 text-[#0066CC] hover:text-[#004B99] hover:underline cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => alert("Load Driver:\n\nInsert the installation media containing driver files for storage controller, then click OK.")}
            className="flex items-center gap-1.5 text-[#0066CC] hover:text-[#004B99] hover:underline cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Load Driver</span>
          </button>
        </div>

        {/* Right Link: Drive options (advanced) */}
        <div>
          <button
            type="button"
            onClick={() => setShowDriveOptions(!showDriveOptions)}
            className="text-[#0066CC] hover:text-[#004B99] hover:underline cursor-pointer"
          >
            Drive options (<span className="underline">a</span>dvanced)
          </button>
        </div>
      </div>

      {/* Expanded Drive Options Toolbar */}
      {showDriveOptions && (
        <div className="flex items-center justify-end gap-4 text-xs pt-1 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={!selectedPart || selectedPart.type === 'unallocated'}
            className="flex items-center gap-1 text-[#0066CC] hover:underline disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Delete</span>
          </button>
          <button
            type="button"
            onClick={() => setShowFormatConfirm(true)}
            disabled={!selectedPart || selectedPart.type !== 'primary'}
            className="flex items-center gap-1 text-[#0066CC] hover:underline disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>Format</span>
          </button>
          <button
            type="button"
            onClick={handleOpenNewInline}
            disabled={!unallocated || unallocated.sizeMB <= 0}
            className="flex items-center gap-1 text-[#0066CC] hover:underline disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>New</span>
          </button>
        </div>
      )}

      {/* Warning/Status Bar */}
      <div className="min-h-[22px] flex items-center pt-2">
        {statusNotice ? (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-800">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{statusNotice}</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400">
            {selectedPart 
              ? `Selected: ${selectedPart.name} (${selectedPart.sizeMB >= 1024 ? (selectedPart.sizeMB / 1024).toFixed(1) + ' GB' : selectedPart.sizeMB + ' MB'})`
              : 'Select a drive partition to proceed.'}
          </div>
        )}
      </div>

      {/* Bottom Footer: Next Button (Right-aligned matching win7_8.jpg) */}
      <div className="flex items-center justify-end border-t border-slate-200 pt-3">
        <button
          type="button"
          onClick={handleProceedNext}
          className="px-7 py-1 bg-gradient-to-b from-[#F2F2F2] via-[#EBEBEB] to-[#D4D4D4] border border-[#707070] hover:border-[#3C7FB1] hover:shadow-[0_0_6px_rgba(60,127,177,0.8)] active:bg-[#C8C8C8] text-black text-xs font-normal rounded-[3px] shadow-sm cursor-pointer transition-all"
        >
          Next
        </button>
      </div>

      {/* Dialog: System Reserved Partition Notice (Authentic Windows 7 Modal) */}
      {showSystemPrompt && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[120] p-4">
          <div className="bg-[#F0F0F0] border border-[#0055EA] rounded-[3px] shadow-2xl max-w-md w-full text-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-gradient-to-r from-[#205C90] via-[#3B82C4] to-[#205C90] text-white px-3 py-1 flex items-center justify-between text-xs font-semibold">
              <span>Windows Setup</span>
              <button 
                type="button" 
                onClick={() => setShowSystemPrompt(false)} 
                className="hover:bg-rose-600 px-1 text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-400 flex items-center justify-center shrink-0">
                <span className="text-blue-600 font-serif font-bold text-sm">i</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-800 pt-0.5">
                To ensure that all Windows features work correctly, Windows might create additional partitions for system files.
              </p>
            </div>
            <div className="bg-[#F0F0F0] border-t border-slate-300 px-3 py-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => executePartitionCreation(true)}
                className="px-6 py-0.5 bg-gradient-to-b from-[#F2F2F2] to-[#D4D4D4] hover:border-[#3C7FB1] border border-[#707070] text-black text-xs rounded-[3px] cursor-pointer"
                autoFocus
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setShowSystemPrompt(false)}
                className="px-5 py-0.5 bg-gradient-to-b from-[#F2F2F2] to-[#D4D4D4] hover:border-[#3C7FB1] border border-[#707070] text-black text-xs rounded-[3px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[120] p-4">
          <div className="bg-[#F0F0F0] border border-[#0055EA] rounded-[3px] shadow-2xl max-w-md w-full text-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-gradient-to-r from-[#205C90] via-[#3B82C4] to-[#205C90] text-white px-3 py-1 flex items-center justify-between text-xs font-semibold">
              <span>Windows Setup</span>
              <button 
                type="button" 
                onClick={() => setShowDeleteConfirm(false)} 
                className="hover:bg-rose-600 px-1 text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" />
              <p className="text-xs leading-relaxed text-slate-800 pt-0.5">
                The partition might contain recovery files, system files, or important software from your computer manufacturer. If you delete this partition, any data stored on it will be lost.
              </p>
            </div>
            <div className="bg-[#F0F0F0] border-t border-slate-300 px-3 py-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-6 py-0.5 bg-gradient-to-b from-[#F2F2F2] to-[#D4D4D4] hover:border-[#3C7FB1] border border-[#707070] text-black text-xs rounded-[3px] cursor-pointer"
                autoFocus
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-5 py-0.5 bg-gradient-to-b from-[#F2F2F2] to-[#D4D4D4] hover:border-[#3C7FB1] border border-[#707070] text-black text-xs rounded-[3px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog: Format Confirmation */}
      {showFormatConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[120] p-4">
          <div className="bg-[#F0F0F0] border border-[#0055EA] rounded-[3px] shadow-2xl max-w-md w-full text-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="bg-gradient-to-r from-[#205C90] via-[#3B82C4] to-[#205C90] text-white px-3 py-1 flex items-center justify-between text-xs font-semibold">
              <span>Windows Setup</span>
              <button 
                type="button" 
                onClick={() => setShowFormatConfirm(false)} 
                className="hover:bg-rose-600 px-1 text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex items-start gap-3">
              <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" />
              <p className="text-xs leading-relaxed text-slate-800 pt-0.5">
                The partition might contain recovery files, system files, or important software from your computer manufacturer. If you format this partition, any data stored on it will be lost. Do you want to continue?
              </p>
            </div>
            <div className="bg-[#F0F0F0] border-t border-slate-300 px-3 py-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmFormat}
                className="px-6 py-0.5 bg-gradient-to-b from-[#F2F2F2] to-[#D4D4D4] hover:border-[#3C7FB1] border border-[#707070] text-black text-xs rounded-[3px] cursor-pointer"
                autoFocus
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setShowFormatConfirm(false)}
                className="px-5 py-0.5 bg-gradient-to-b from-[#F2F2F2] to-[#D4D4D4] hover:border-[#3C7FB1] border border-[#707070] text-black text-xs rounded-[3px] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
