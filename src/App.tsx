import React, { useState } from 'react';
import { SimulationState, StudentInfo, OSType, TaskRequirement, PartitionItem, EvaluationResult } from './types';
import { getTaskForStudent, evaluateStudentConfig } from './data/tasks';
import { saveStudentScoreToSupabase } from './lib/supabase';
import { StudentPortal } from './components/StudentPortal';
import { DesktopSimulator } from './components/DesktopSimulator';
import { BiosSimulator } from './components/BiosSimulator';
import { RebootSplashScreen } from './components/RebootSplashScreen';
import { PoweredOffScreen } from './components/PoweredOffScreen';
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

  // Restart Computer action from Desktop or Installer
  const handleRestartComputer = () => {
    setState((prev) => ({
      ...prev,
      step: 'rebooting',
      rebootCount: prev.rebootCount + 1
    }));
  };

  // Shut Down Computer action
  const handleShutdownComputer = () => {
    setState((prev) => ({
      ...prev,
      step: 'powered_off'
    }));
  };

  // Power On Computer from Powered Off state
  const handlePowerOnComputer = () => {
    setState((prev) => ({
      ...prev,
      step: 'rebooting'
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

  // Finish OOBE and direct student to Desktop
  const handleFinishOobe = () => {
    const endTime = Date.now();
    const finalState = { ...state, endTime };
    const result = evaluateStudentConfig(finalState);
    setEvaluationData(result);
    // Directly save evaluation result to Supabase database
    saveStudentScoreToSupabase(result);
    setState((prev) => ({
      ...prev,
      endTime,
      step: 'complete_desktop'
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

      {/* 2. Desktop Simulator Step (Pre-Install or Post-Install) */}
      {(state.step === 'desktop' || state.step === 'complete_desktop') && (
        <DesktopSimulator
          os={state.selectedOS}
          student={state.student}
          task={state.assignedTask}
          simulationState={state.step === 'complete_desktop' ? state : undefined}
          onRestartComputer={handleRestartComputer}
          onShutdownComputer={handleShutdownComputer}
          onBackToPortal={() => setState((prev) => ({ ...prev, step: 'portal' }))}
          onViewFullEvaluation={() => {
            if (!evaluationData) {
              setEvaluationData(evaluateStudentConfig(state));
            }
            setState((prev) => ({ ...prev, step: 'evaluation' }));
          }}
        />
      )}

      {/* 3. Powered Off State */}
      {state.step === 'powered_off' && (
        <PoweredOffScreen
          onPowerOn={handlePowerOnComputer}
        />
      )}

      {/* 4. Rebooting / BIOS Splash Screen (Enforces Keyboard Only Navigation) */}
      {state.step === 'rebooting' && (
        <RebootSplashScreen
          diskSizeGB={state.assignedTask.diskSizeGB}
          biosConfig={state.biosConfig}
          selectedOS={state.selectedOS}
          onEnterBios={handleEnterBios}
          onBootInstaller={handleBootInstallerDirectly}
        />
      )}

      {/* 5. BIOS Setup Utility */}
      {state.step === 'bios' && (
        <BiosSimulator
          os={state.selectedOS}
          task={state.assignedTask}
          biosConfig={state.biosConfig}
          onSaveBios={handleSaveBios}
        />
      )}

      {/* 6. Windows Installer Steps */}
      {state.step.startsWith('installer_') && (
        <WindowsInstaller
          os={state.selectedOS}
          task={state.assignedTask}
          state={state}
          onUpdateState={handleUpdateSimulationState}
          onCompleteInstallation={handleCompleteInstaller}
          onRestartComputer={handleRestartComputer}
          onShutdownComputer={handleShutdownComputer}
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
      {state.step === 'evaluation' && (
        <EvaluationDashboard
          result={evaluationData || evaluateStudentConfig(state)}
          onRestartTask={() => setState((prev) => ({ ...prev, step: 'portal' }))}
          onBackToDesktop={() => setState((prev) => ({ ...prev, step: 'complete_desktop' }))}
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
