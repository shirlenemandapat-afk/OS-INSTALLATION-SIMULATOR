import React, { useState } from 'react';
import { SimulationState, StudentInfo, OSType, TaskRequirement, PartitionItem, EvaluationResult } from './types';
import { getTaskForStudent, evaluateStudentConfig } from './data/tasks';
import { StudentPortal } from './components/StudentPortal';
import { DesktopSimulator } from './components/DesktopSimulator';
import { BiosSimulator } from './components/BiosSimulator';
import { WindowsInstaller } from './components/WindowsInstaller';
import { OobeSimulator } from './components/OobeSimulator';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { InstructorLogsModal } from './components/InstructorLogsModal';
import { HelpCircle, Monitor, Loader2, Power } from 'lucide-react';

export default function App() {
  const [showInstructorLogs, setShowInstructorLogs] = useState(false);
  const [evaluationData, setEvaluationData] = useState<EvaluationResult | null>(null);

  const [state, setState] = useState<SimulationState>({
    step: 'portal',
    student: { name: '', section: '' },
    selectedOS: 'win10',
    assignedTask: getTaskForStudent('', '', 'win10'),
    biosConfig: {
      bootOrder: ['hdd', 'usb', 'cd'], // default incorrect boot order so student must configure USB first!
      bootMode: 'legacy',
      sataMode: 'ide',
      secureBoot: false,
      tpmEnabled: false,
      savedAndExited: false
    },
    partitions: [],
    selectedPartitionId: null,
    installedPartitionId: null,
    startTime: null,
    endTime: null,
    rebootCount: 0,
    biosAccessed: false
  });

  // Start simulation from portal
  const handleStartSimulator = (student: StudentInfo, os: OSType, task: TaskRequirement) => {
    const initialPartitions: PartitionItem[] = [
      {
        id: 'part_unallocated_initial',
        driveNumber: 0,
        partitionNumber: null,
        name: 'Drive 0 Unallocated Space',
        sizeMB: task.diskSizeGB * 1024,
        type: 'unallocated',
        formatted: false
      }
    ];

    setState({
      step: 'desktop',
      student,
      selectedOS: os,
      assignedTask: task,
      biosConfig: {
        bootOrder: ['hdd', 'usb', 'cd'],
        bootMode: 'legacy',
        sataMode: 'ide',
        secureBoot: false,
        tpmEnabled: false,
        savedAndExited: false
      },
      partitions: initialPartitions,
      selectedPartitionId: null,
      installedPartitionId: null,
      startTime: Date.now(),
      endTime: null,
      rebootCount: 0,
      biosAccessed: false
    });
  };

  // Restart Computer action from Desktop
  const handleRestartComputer = () => {
    setState((prev) => ({
      ...prev,
      step: 'rebooting',
      rebootCount: prev.rebootCount + 1
    }));
  };

  // Enter BIOS Setup Utility
  const handleEnterBios = () => {
    setState((prev) => ({
      ...prev,
      step: 'bios',
      biosAccessed: true
    }));
  };

  // Skip directly to installer if student didn't press BIOS key
  const handleBootInstallerDirectly = () => {
    setState((prev) => ({
      ...prev,
      step: 'installer_language'
    }));
  };

  // Save BIOS configuration
  const handleSaveBios = (updatedBios) => {
    setState((prev) => ({
      ...prev,
      biosConfig: updatedBios,
      step: 'installer_language'
    }));
  };

  // Update simulation state from installer
  const handleUpdateSimulationState = (updates: Partial<SimulationState>) => {
    setState((prev) => ({
      ...prev,
      ...updates
    }));
  };

  // Complete installation and move to OOBE
  const handleCompleteInstaller = () => {
    setState((prev) => ({
      ...prev,
      step: 'oobe'
    }));
  };

  // Finish OOBE and evaluate
  const handleFinishOobe = () => {
    const endTime = Date.now();
    const finalState = { ...state, endTime };
    const result = evaluateStudentConfig(finalState);
    setEvaluationData(result);
    setState((prev) => ({
      ...prev,
      endTime,
      step: 'evaluation'
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* 1. Portal Step */}
      {state.step === 'portal' && (
        <StudentPortal
          onStartSimulator={handleStartSimulator}
          onOpenInstructorLogs={() => setShowInstructorLogs(true)}
        />
      )}

      {/* 2. Desktop Simulator Step */}
      {state.step === 'desktop' && (
        <DesktopSimulator
          os={state.selectedOS}
          student={state.student}
          task={state.assignedTask}
          onRestartComputer={handleRestartComputer}
          onBackToPortal={() => setState((prev) => ({ ...prev, step: 'portal' }))}
        />
      )}

      {/* 3. Rebooting / BIOS Splash Screen */}
      {state.step === 'rebooting' && (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-between p-8 text-slate-100 z-50 font-mono select-none">
          <div className="w-full text-xs text-slate-400 space-y-1">
            <p>Main Processor: Intel Core i7-11700K @ 3.60GHz</p>
            <p>Memory Testing: 16384K OK</p>
            <p>Primary Master: SSD 0 ({state.assignedTask.diskSizeGB} GB)</p>
            <p>USB Storage Device: Virtual Bootable Installer USB Flash Drive</p>
          </div>

          <div className="text-center space-y-6 my-auto">
            <Loader2 className="w-12 h-12 text-amber-400 mx-auto animate-spin" />
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-amber-300">SYSTEM REBOOTING...</h2>
              <p className="text-xs text-slate-300">
                Press <kbd className="bg-slate-800 text-amber-300 px-2 py-1 rounded border border-slate-700 font-bold">DEL</kbd> or <kbd className="bg-slate-800 text-amber-300 px-2 py-1 rounded border border-slate-700 font-bold">F2</kbd> now to enter BIOS / UEFI Setup Utility.
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={handleEnterBios}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
              >
                [DEL / F2] Enter BIOS Setup
              </button>

              <button
                onClick={handleBootInstallerDirectly}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all"
              >
                Skip BIOS & Boot OS Media Direct
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Press DEL to run Setup | Press F12 for BBS Boot Menu
          </div>
        </div>
      )}

      {/* 4. BIOS Setup Utility */}
      {state.step === 'bios' && (
        <BiosSimulator
          os={state.selectedOS}
          task={state.assignedTask}
          biosConfig={state.biosConfig}
          onSaveBios={handleSaveBios}
        />
      )}

      {/* 5. Windows Installer Steps */}
      {state.step.startsWith('installer_') && (
        <WindowsInstaller
          os={state.selectedOS}
          task={state.assignedTask}
          state={state}
          onUpdateState={handleUpdateSimulationState}
          onCompleteInstallation={handleCompleteInstaller}
        />
      )}

      {/* 6. Out-Of-Box Experience (OOBE) */}
      {state.step === 'oobe' && (
        <OobeSimulator
          os={state.selectedOS}
          student={state.student}
          onFinishOobe={handleFinishOobe}
        />
      )}

      {/* 7. Evaluation & Feedback Dashboard */}
      {state.step === 'evaluation' && evaluationData && (
        <EvaluationDashboard
          result={evaluationData}
          onRestartTask={() => setState((prev) => ({ ...prev, step: 'portal' }))}
          onOpenInstructorLogs={() => setShowInstructorLogs(true)}
        />
      )}

      {/* Instructor Logs & Gradebook Modal */}
      <InstructorLogsModal
        isOpen={showInstructorLogs}
        onClose={() => setShowInstructorLogs(false)}
      />
    </div>
  );
}
