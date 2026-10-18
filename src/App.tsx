import React, { useState } from 'react';
import { SimulationState, StudentInfo, TeacherAccount, OSType, TaskRequirement, PartitionItem, EvaluationResult } from './types';
import { getTaskForStudent, evaluateStudentConfig } from './data/tasks';
import { saveStudentScoreToSupabase } from './lib/supabase';
import { SignInDashboard } from './components/SignInDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentPortal } from './components/StudentPortal';
import { DesktopSimulator } from './components/DesktopSimulator';
import { BiosSimulator } from './components/BiosSimulator';
import { RebootSplashScreen } from './components/RebootSplashScreen';
import { PoweredOffScreen } from './components/PoweredOffScreen';
import { WindowsInstaller } from './components/WindowsInstaller';
import { OobeSimulator } from './components/OobeSimulator';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { InstructorLogsModal } from './components/InstructorLogsModal';

type AppRole = 'signin' | 'student' | 'teacher';

export default function App() {
  const [showInstructorLogs, setShowInstructorLogs] = useState(false);
  const [evaluationData, setEvaluationData] = useState<EvaluationResult | null>(null);

  // Active Role & User Session State - Always display Sign In Dashboard first!
  const [currentRole, setCurrentRole] = useState<AppRole>('signin');

  const [currentStudent, setCurrentStudent] = useState<StudentInfo | null>(() => {
    try {
      const saved = localStorage.getItem('depedqc_active_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'student' && parsed.student) return parsed.student;
      }
    } catch (e) {}
    return null;
  });

  const [currentTeacher, setCurrentTeacher] = useState<TeacherAccount | null>(() => {
    try {
      const saved = localStorage.getItem('depedqc_active_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'teacher' && parsed.teacher) return parsed.teacher;
      }
    } catch (e) {}
    return null;
  });

  // Simulation State
  const [state, setState] = useState<SimulationState>(() => {
    const student = currentStudent || { name: '', section: '' };
    return {
      step: 'portal',
      student,
      selectedOS: 'win10',
      assignedTask: getTaskForStudent(student.name, student.section, 'win10'),
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
    };
  });

  // STUDENT SIGN IN HANDLER
  const handleStudentSignIn = (student: StudentInfo) => {
    setCurrentStudent(student);
    setCurrentTeacher(null);
    setCurrentRole('student');
    localStorage.setItem('depedqc_active_session', JSON.stringify({ role: 'student', student }));

    setState((prev) => ({
      ...prev,
      step: 'portal',
      student,
      assignedTask: getTaskForStudent(student.name, student.section, prev.selectedOS)
    }));
  };

  // TEACHER SIGN IN / REGISTRATION HANDLER
  const handleTeacherSignIn = (teacher: TeacherAccount) => {
    setCurrentTeacher(teacher);
    setCurrentStudent(null);
    setCurrentRole('teacher');
    localStorage.setItem('depedqc_active_session', JSON.stringify({ role: 'teacher', teacher }));
  };

  // TEACHER LAUNCH LAB SIMULATOR DEMO
  const handleTeacherLaunchDemo = () => {
    const demoStudent: StudentInfo = {
      studentId: 'DEMO-INSTRUCTOR',
      name: `${currentTeacher?.fullName || 'Teacher'} (Faculty Demo)`,
      section: 'DepEd QC Faculty Preview',
      teacherId: currentTeacher?.id,
      teacherName: currentTeacher?.fullName,
      teacherEmail: currentTeacher?.email
    };
    setCurrentStudent(demoStudent);
    setCurrentRole('student');
    setState((prev) => ({
      ...prev,
      step: 'portal',
      student: demoStudent,
      assignedTask: getTaskForStudent(demoStudent.name, demoStudent.section, 'win10')
    }));
  };

  // SIGN OUT / SWITCH USER
  const handleSignOut = () => {
    localStorage.removeItem('depedqc_active_session');
    setCurrentStudent(null);
    setCurrentTeacher(null);
    setCurrentRole('signin');
    setEvaluationData(null);
    setState((prev) => ({
      ...prev,
      step: 'portal',
      student: { name: '', section: '' }
    }));
  };

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

  // 1. SIGN IN DASHBOARD (Initial Entrypoint)
  if (currentRole === 'signin') {
    return (
      <SignInDashboard
        onStudentSignIn={handleStudentSignIn}
        onTeacherSignIn={handleTeacherSignIn}
      />
    );
  }

  // 2. TEACHER DASHBOARD
  if (currentRole === 'teacher' && currentTeacher) {
    return (
      <TeacherDashboard
        teacher={currentTeacher}
        onLogout={handleSignOut}
        onLaunchSimulator={handleTeacherLaunchDemo}
      />
    );
  }

  // 3. STUDENT SIMULATION WORKSPACE
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* 1. Portal Step (Exact Interface Before Simulation) */}
      {state.step === 'portal' && (
        <StudentPortal
          currentStudent={currentStudent || undefined}
          onStartSimulator={handleStartSimulator}
          onOpenInstructorLogs={() => setShowInstructorLogs(true)}
          onSignOut={handleSignOut}
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

      {/* 4. Rebooting / BIOS Splash Screen (Enforces Keyboard & Touch Navigation) */}
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

      {/* 7. Out-Of-Box Experience (OOBE) */}
      {state.step === 'oobe' && (
        <OobeSimulator
          os={state.selectedOS}
          student={state.student}
          onFinishOobe={handleFinishOobe}
        />
      )}

      {/* 8. Evaluation & Feedback Dashboard */}
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
