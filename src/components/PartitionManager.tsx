import React, { useState } from 'react';
import { OSType, PartitionItem, TaskRequirement } from '../types';
import { HardDrive, Plus, Trash2, RefreshCw, Layers, CheckCircle2, AlertCircle, Info } from 'lucide-react';

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
  const [showNewModal, setShowNewModal] = useState(false);
  const [inputMB, setInputMB] = useState<number>(task.diskSizeGB * 1024);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const totalDriveMB = task.diskSizeGB * 1024;
  const unallocated = partitions.find(p => p.type === 'unallocated');
  const availableUnallocatedMB = unallocated ? unallocated.sizeMB : 0;
  const hasUserPartitions = partitions.some(p => p.type === 'primary');
  const isFirstPartition = !hasUserPartitions;

  const handleSelectPartition = (id: string) => {
    onUpdatePartitions(partitions, id);
    setErrorMsg('');
  };

  // Open New Partition Modal with dynamic space calculation
  const handleOpenNewModal = () => {
    if (!unallocated || unallocated.sizeMB <= 0) {
      setErrorMsg('No unallocated space remaining on this drive. Delete an existing partition to free space.');
      return;
    }

    // If it's the very first partition, total disk space appears.
    // If user already created a partition, the remaining total unallocated space appears.
    setInputMB(unallocated.sizeMB);
    setErrorMsg('');
    setShowNewModal(true);
  };

  const handleCreatePartition = () => {
    if (inputMB <= 0) {
      setErrorMsg('Please specify a partition size greater than 0 MB.');
      return;
    }

    if (!unallocated || inputMB > unallocated.sizeMB) {
      setErrorMsg(`Specified partition size (${inputMB.toLocaleString()} MB) exceeds available unallocated space (${availableUnallocatedMB.toLocaleString()} MB).`);
      return;
    }

    const hasSystemPart = partitions.some(p => p.type === 'system' || p.type === 'recovery');
    if (!hasSystemPart) {
      // First time creating a partition -> Trigger authentic Windows system files prompt!
      setShowNewModal(false);
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
        // Win 7 creates 100 MB System Reserved partition
        newPartitionsList.push({
          id: 'part_sys_reserved',
          driveNumber: 0,
          partitionNumber: 1,
          name: 'Drive 0 Partition 1: System Reserved',
          sizeMB: 100,
          type: 'system',
          formatted: true
        });
        remainingMB -= 100;
      } else {
        // Win 10 / 11 creates Recovery / EFI System (100MB) & MSR (16MB)
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

    // Existing primary count
    const existingPrimaries = partitions.filter(p => p.type === 'primary');
    const nextPrimaryNum = existingPrimaries.length + (createSystemPartitions ? (os === 'win7' ? 2 : 3) : 1);

    // Calculate Primary Partition Size
    const actualPrimaryMB = Math.min(inputMB, remainingMB);
    const newPrimaryId = `part_primary_${Date.now()}`;
    const newPrimary: PartitionItem = {
      id: newPrimaryId,
      driveNumber: 0,
      partitionNumber: nextPrimaryNum,
      name: `Drive 0 Partition ${nextPrimaryNum}`,
      sizeMB: actualPrimaryMB,
      type: 'primary',
      formatted: false
    };

    remainingMB -= actualPrimaryMB;

    // Existing system or reserved partitions retained
    const existingNonUnallocated = partitions.filter(p => p.type !== 'unallocated');
    const updated = [...existingNonUnallocated, ...newPartitionsList, newPrimary];

    // If there is any remaining unallocated space, keep it in the list
    if (remainingMB > 10) {
      updated.push({
        id: 'part_unallocated',
        driveNumber: 0,
        partitionNumber: null,
        name: 'Drive 0 Unallocated Space',
        sizeMB: remainingMB,
        type: 'unallocated',
        formatted: false
      });
    }

    onUpdatePartitions(updated, newPrimaryId);
    setShowNewModal(false);
    setShowSystemPrompt(false);
  };

  const handleDeletePartition = (id: string) => {
    const target = partitions.find(p => p.id === id);
    if (!target || target.type === 'unallocated') return;

    // Filter out target partition
    const filtered = partitions.filter(p => p.id !== id);
    const freedMB = target.sizeMB;

    // Recalculate and merge unallocated space
    const unallocatedItem = filtered.find(p => p.type === 'unallocated');
    if (unallocatedItem) {
      unallocatedItem.sizeMB += freedMB;
    } else {
      filtered.push({
        id: 'part_unallocated',
        driveNumber: 0,
        partitionNumber: null,
        name: 'Drive 0 Unallocated Space',
        sizeMB: freedMB,
        type: 'unallocated',
        formatted: false
      });
    }

    // If only system/unallocated left or no primary partitions left, clean up
    const remainingPrimaries = filtered.filter(p => p.type === 'primary');
    let finalPartitions = filtered;
    if (remainingPrimaries.length === 0) {
      // Revert completely to single unallocated total disk space
      finalPartitions = [
        {
          id: 'part_unallocated_reset',
          driveNumber: 0,
          partitionNumber: null,
          name: 'Drive 0 Unallocated Space',
          sizeMB: totalDriveMB,
          type: 'unallocated',
          formatted: false
        }
      ];
    }

    onUpdatePartitions(finalPartitions, null);
  };

  const handleFormatPartition = (id: string) => {
    const updated = partitions.map(p => {
      if (p.id === id && p.type === 'primary') {
        return { ...p, formatted: true };
      }
      return p;
    });
    onUpdatePartitions(updated, id);
  };

  const handleProceedNext = () => {
    if (!selectedPartitionId) {
      setErrorMsg('Please select a partition to install Windows.');
      return;
    }
    const selected = partitions.find(p => p.id === selectedPartitionId);
    if (!selected || selected.type === 'unallocated') {
      setErrorMsg('Cannot install Windows on unallocated space. Click "New" to create a partition first.');
      return;
    }
    if (selected.type === 'system' || selected.type === 'msr' || selected.type === 'recovery') {
      setErrorMsg('Windows cannot be installed on a System Reserved/MSR partition. Select a Primary partition.');
      return;
    }
    setErrorMsg('');
    onNextStep();
  };

  const selectedPart = partitions.find(p => p.id === selectedPartitionId);
  const remainingAfterInput = Math.max(0, availableUnallocatedMB - (inputMB || 0));

  return (
    <div className="space-y-5 text-slate-100">
      {/* Header Prompt */}
      <div>
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-blue-400" />
          Where do you want to install Windows?
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Select or partition Drive 0 according to your task instructions ({task.partitionReq.primarySizeGB} GB C: Drive).
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Partitions Table Container */}
      <div className="border border-slate-700/80 rounded-xl overflow-hidden bg-slate-950 shadow-inner">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Total Size</th>
              <th className="px-4 py-3">Free Space</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-right">Format State</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {partitions.map((p) => {
              const isSelected = p.id === selectedPartitionId;
              const sizeGB = (p.sizeMB / 1024).toFixed(1);
              const isUnallocatedRow = p.type === 'unallocated';
              return (
                <tr
                  key={p.id}
                  onClick={() => handleSelectPartition(p.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-600/30 text-white font-semibold border-l-4 border-l-blue-500'
                      : isUnallocatedRow
                      ? 'hover:bg-slate-900/80 text-amber-200/90 font-mono'
                      : 'hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <td className="px-4 py-3 flex items-center gap-2">
                    <HardDrive className={`w-4 h-4 ${isSelected ? 'text-blue-400' : isUnallocatedRow ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span className={isUnallocatedRow ? 'font-medium' : ''}>{p.name}</span>
                  </td>
                  <td className="px-4 py-3">{sizeGB} GB ({p.sizeMB.toLocaleString()} MB)</td>
                  <td className="px-4 py-3">{sizeGB} GB</td>
                  <td className="px-4 py-3">
                    <span className={`uppercase text-[10px] font-bold px-2 py-0.5 rounded ${
                      p.type === 'primary'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : p.type === 'unallocated'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.type === 'primary' ? (
                      p.formatted ? (
                        <span className="text-emerald-400 text-[11px] font-medium flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Formatted
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[11px]">Unformatted</span>
                      )
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drive Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {/* New Partition Button */}
          <button
            onClick={handleOpenNewModal}
            disabled={!unallocated || unallocated.sizeMB <= 0}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>New</span>
          </button>

          {/* Delete Partition Button */}
          <button
            onClick={() => selectedPartitionId && handleDeletePartition(selectedPartitionId)}
            disabled={!selectedPart || selectedPart.type === 'unallocated'}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Delete</span>
          </button>

          {/* Format Partition Button */}
          <button
            onClick={() => selectedPartitionId && handleFormatPartition(selectedPartitionId)}
            disabled={!selectedPart || selectedPart.type !== 'primary'}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Format</span>
          </button>
        </div>

        {/* Proceed Next Button */}
        <button
          onClick={handleProceedNext}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          Next &rarr;
        </button>
      </div>

      {/* Modal: New Partition Size Input */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                {isFirstPartition ? 'Create Initial Partition' : 'Create Partition from Unallocated Space'}
              </h4>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                Drive 0
              </span>
            </div>

            {/* Display Total Disk Space or Remaining Unallocated Space */}
            <div className={`p-3 rounded-xl border text-xs space-y-1 ${
              isFirstPartition
                ? 'bg-blue-950/50 border-blue-800/80 text-blue-200'
                : 'bg-amber-950/50 border-amber-800/80 text-amber-200'
            }`}>
              <div className="flex items-center justify-between font-semibold">
                <span>{isFirstPartition ? 'Total Disk Space Available:' : 'Remaining Total Unallocated Space:'}</span>
                <span className="font-mono font-bold text-white text-sm">
                  {availableUnallocatedMB.toLocaleString()} MB ({(availableUnallocatedMB / 1024).toFixed(1)} GB)
                </span>
              </div>
              <p className="text-[11px] opacity-80">
                {isFirstPartition
                  ? `Whole drive size: ${task.diskSizeGB} GB. Enter how much space to allocate for this partition.`
                  : `Creating partition from remaining unallocated space (${(availableUnallocatedMB / 1024).toFixed(1)} GB remaining).`}
              </p>
            </div>

            {/* Size Input Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <label className="font-medium">Partition Size (MB):</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setInputMB(availableUnallocatedMB)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-cyan-300 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
                    title="Use all available space"
                  >
                    Max ({availableUnallocatedMB.toLocaleString()} MB)
                  </button>
                  {task.partitionReq.primarySizeGB * 1024 <= availableUnallocatedMB && (
                    <button
                      type="button"
                      onClick={() => setInputMB(task.partitionReq.primarySizeGB * 1024)}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
                      title="Set to Task required size"
                    >
                      Task ({task.partitionReq.primarySizeGB} GB)
                    </button>
                  )}
                </div>
              </div>

              <input
                type="number"
                min={100}
                max={availableUnallocatedMB}
                value={inputMB || ''}
                onChange={(e) => setInputMB(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-base text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                placeholder="Enter size in MB"
                autoFocus
              />

              {/* Dynamic Preview Calculation */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                <div>
                  <span className="text-slate-400 block">New Partition Size:</span>
                  <strong className="text-emerald-400 font-mono text-xs">
                    {((inputMB || 0) / 1024).toFixed(1)} GB ({(inputMB || 0).toLocaleString()} MB)
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Remaining Unallocated:</span>
                  <strong className="text-amber-400 font-mono text-xs">
                    {(remainingAfterInput / 1024).toFixed(1)} GB ({remainingAfterInput.toLocaleString()} MB)
                  </strong>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreatePartition}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Reserved Partitions Notice Modal */}
      {showSystemPrompt && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              Windows Setup Notice
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              To ensure that all Windows features work correctly, Windows might create additional partitions for system files (System Reserved / EFI System / MSR).
            </p>
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => executePartitionCreation(true)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
