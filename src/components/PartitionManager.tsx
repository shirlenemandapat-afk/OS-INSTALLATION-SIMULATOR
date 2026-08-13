import React, { useState } from 'react';
import { OSType, PartitionItem, TaskRequirement } from '../types';
import { HardDrive, Plus, Trash2, RefreshCw, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [inputMB, setInputMB] = useState<number>(task.partitionReq.primarySizeGB * 1024);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const totalDriveMB = task.diskSizeGB * 1024;

  const handleSelectPartition = (id: string) => {
    onUpdatePartitions(partitions, id);
    setErrorMsg('');
  };

  const handleCreatePartition = () => {
    if (inputMB <= 0) return;

    // Find unallocated space
    const unallocated = partitions.find(p => p.type === 'unallocated');
    if (!unallocated || inputMB > unallocated.sizeMB) {
      setErrorMsg('Specified partition size exceeds total available unallocated space.');
      return;
    }

    const hasSystemPart = partitions.some(p => p.type === 'system' || p.type === 'recovery');
    if (!hasSystemPart) {
      // First time creating a partition -> Trigger system prompt!
      setShowNewModal(false);
      setShowSystemPrompt(true);
    } else {
      executePartitionCreation(false);
    }
  };

  const executePartitionCreation = (createSystemPartitions: boolean) => {
    const unallocated = partitions.find(p => p.type === 'unallocated');
    if (!unallocated) return;

    const newPartitionsList: PartitionItem[] = [];
    let remainingMB = unallocated.sizeMB;

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
        // Win 10 / 11 creates Recovery (500MB) & EFI System (100MB) & MSR (16MB)
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

    if (remainingMB > 50) {
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

    // Recalculate unallocated
    const unallocated = filtered.find(p => p.type === 'unallocated');
    if (unallocated) {
      unallocated.sizeMB += freedMB;
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

    onUpdatePartitions(filtered, null);
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
      setErrorMsg('Cannot install Windows on unallocated space. Create a partition first.');
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
              return (
                <tr
                  key={p.id}
                  onClick={() => handleSelectPartition(p.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-600/30 text-white font-semibold border-l-4 border-l-blue-500'
                      : 'hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <td className="px-4 py-3 flex items-center gap-2">
                    <HardDrive className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span>{p.name}</span>
                  </td>
                  <td className="px-4 py-3">{sizeGB} GB ({p.sizeMB.toLocaleString()} MB)</td>
                  <td className="px-4 py-3">{sizeGB} GB</td>
                  <td className="px-4 py-3">
                    <span className={`uppercase text-[10px] font-bold px-2 py-0.5 rounded ${
                      p.type === 'primary'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : p.type === 'unallocated'
                        ? 'bg-slate-800 text-slate-400'
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
            onClick={() => {
              setShowNewModal(true);
              setErrorMsg('');
            }}
            disabled={!partitions.some(p => p.type === 'unallocated')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>New</span>
          </button>

          {/* Delete Partition Button */}
          <button
            onClick={() => selectedPartitionId && handleDeletePartition(selectedPartitionId)}
            disabled={!selectedPart || selectedPart.type === 'unallocated'}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Delete</span>
          </button>

          {/* Format Partition Button */}
          <button
            onClick={() => selectedPartitionId && handleFormatPartition(selectedPartitionId)}
            disabled={!selectedPart || selectedPart.type !== 'primary'}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Format</span>
          </button>
        </div>

        {/* Proceed Next Button */}
        <button
          onClick={handleProceedNext}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          Next &rarr;
        </button>
      </div>

      {/* Modal: New Partition Size Input */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-slate-100">
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Create New Partition
            </h4>
            <p className="text-xs text-slate-400">
              Enter size in Megabytes (MB) for new partition.
              (1 GB = 1,024 MB). Task Target: <strong className="text-amber-400">{task.partitionReq.primarySizeGB} GB ({task.partitionReq.primarySizeGB * 1024} MB)</strong>
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Size (MB):</label>
              <input
                type="number"
                value={inputMB}
                onChange={(e) => setInputMB(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Approx = <strong className="text-emerald-400">{(inputMB / 1024).toFixed(1)} GB</strong>
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewModal(false)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePartition}
                className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs shadow"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Reserved Partitions Notice Modal */}
      {showSystemPrompt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-100">
            <h4 className="font-bold text-sm text-slate-100">Windows Installer Notice</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              To ensure that all Windows features work correctly, Windows might create additional partitions for system files (System Reserved / EFI System / MSR).
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => executePartitionCreation(true)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg"
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
