import React, { useState } from 'react';
import { TaskRequirement, RubricItem } from '../types';
import { DEFAULT_RUBRICS } from '../data/tasks';
import { FileText, HelpCircle, X, Shield, Cpu, HardDrive, CheckCircle2 } from 'lucide-react';

interface HelpRubricModalProps {
  task: TaskRequirement;
  selectedOS: string;
}

export const HelpRubricModal: React.FC<HelpRubricModalProps> = ({ task, selectedOS }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'task' | 'rubrics'>('task');

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-3 right-3 z-50 bg-slate-900/90 hover:bg-slate-800 text-slate-100 px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-700 shadow-xl flex items-center gap-2 backdrop-blur-md transition-all hover:scale-105"
        title="View Assigned Task Instructions & Rubrics"
      >
        <HelpCircle className="w-4 h-4 text-amber-400" />
        <span>Task & Rubrics</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-slate-100">Student Task Reference</h3>
                  <p className="text-xs text-slate-400">Target OS: <span className="uppercase text-blue-400 font-semibold">{selectedOS}</span></p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-2">
              <button
                onClick={() => setActiveTab('task')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'task'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Assigned Task Instructions
              </button>
              <button
                onClick={() => setActiveTab('rubrics')}
                className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'rubrics'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Grading Rubrics (100 pts)
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
              {activeTab === 'task' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-950/30 border border-blue-800/40 rounded-xl space-y-2">
                    <h4 className="font-semibold text-blue-300 text-sm">{task.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* BIOS checklist */}
                    <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-slate-200 border-b border-slate-800 pb-1.5">
                        <Cpu className="w-4 h-4 text-indigo-400" />
                        <span>BIOS / UEFI Checklist</span>
                      </div>
                      <ul className="space-y-1.5 text-slate-300">
                        <li className="flex items-center justify-between">
                          <span className="text-slate-400">Boot Order:</span>
                          <span className="font-medium text-amber-400">USB First</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-slate-400">Boot Mode:</span>
                          <span className="font-semibold text-slate-200 uppercase">{task.biosReq.bootMode}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-slate-400">SATA Controller:</span>
                          <span className="font-semibold text-slate-200 uppercase">{task.biosReq.sataMode}</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-slate-400">Secure Boot:</span>
                          <span className={`font-semibold ${task.biosReq.secureBoot ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {task.biosReq.secureBoot ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-slate-400">TPM 2.0 / PTT:</span>
                          <span className={`font-semibold ${task.biosReq.tpmEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {task.biosReq.tpmEnabled ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* Disk checklist */}
                    <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-slate-200 border-b border-slate-800 pb-1.5">
                        <HardDrive className="w-4 h-4 text-emerald-400" />
                        <span>Disk Partitioning Checklist</span>
                      </div>
                      <ul className="space-y-1.5 text-slate-300">
                        <li className="flex items-center justify-between">
                          <span className="text-slate-400">Drive Capacity:</span>
                          <span className="font-medium text-slate-200">{task.diskSizeGB} GB</span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-slate-400">Primary C: Drive:</span>
                          <span className="font-semibold text-emerald-400">
                            {task.partitionReq.primarySizeGB} GB ({task.partitionReq.primarySizeGB * 1024} MB)
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-slate-400">Secondary Data Drive:</span>
                          <span className="font-medium text-slate-300">
                            {task.partitionReq.secondPartitionRequired ? 'Required' : 'Optional / Single Partition'}
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span className="text-slate-400">Format Target:</span>
                          <span className="font-semibold text-cyan-400">Required before Next</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {DEFAULT_RUBRICS.map((rubric) => (
                    <div key={rubric.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-100">{rubric.category}</span>
                          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {rubric.maxPoints} pts
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{rubric.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                Close Reference
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
