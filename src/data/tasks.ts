import { OSType, TaskRequirement, RubricItem, SimulationState, ScoreDetail, EvaluationResult } from '../types';

export const DEFAULT_RUBRICS: RubricItem[] = [
  {
    id: 'rubric_bios',
    category: 'BIOS/UEFI Configuration',
    maxPoints: 30,
    description: 'Configure Boot Device Priority (USB first), Boot Mode (UEFI/Legacy), SATA Mode (AHCI/IDE), and Secure Boot/TPM as required by the assigned OS task.'
  },
  {
    id: 'rubric_partition',
    category: 'Disk Partitioning Accuracy',
    maxPoints: 40,
    description: 'Create the primary OS partition with specified size (in MB/GB), configure secondary data partitions if requested, and format the target volume.'
  },
  {
    id: 'rubric_os_install',
    category: 'OS Selection & Setup',
    maxPoints: 20,
    description: 'Select the correct Operating System version, choose Custom Installation, and install Windows onto the designated partition.'
  },
  {
    id: 'rubric_workflow',
    category: 'System Workflow & Reboot',
    maxPoints: 10,
    description: 'Properly restart the system desktop, save BIOS settings (F10), and complete the Windows installation wizard successfully.'
  }
];

export const PRESET_TASKS: Record<OSType, TaskRequirement[]> = {
  win7: [
    {
      id: 'task_win7_1',
      title: 'Windows 7 Legacy Installation & Dual Partition',
      os: 'win7',
      diskSizeGB: 250,
      biosReq: {
        bootOrder: 'usb_first',
        bootMode: 'legacy',
        sataMode: 'ahci',
        secureBoot: false,
        tpmEnabled: false
      },
      partitionReq: {
        primarySizeGB: 100,
        primaryToleranceGB: 5,
        secondPartitionRequired: true,
        secondPartitionSizeGB: 150,
        formatTargetPartition: true,
        targetPartitionIndex: 1
      },
      description: 'Configure BIOS for Legacy Boot with USB as 1st boot device and SATA AHCI mode. Create a 100 GB Primary C: Drive partition for Windows 7 Ultimate and allocate the remaining space (~150 GB) for Data D: Drive. Format C: and install OS on it.'
    },
    {
      id: 'task_win7_2',
      title: 'Windows 7 Basic Setup with IDE Compatibility',
      os: 'win7',
      diskSizeGB: 320,
      biosReq: {
        bootOrder: 'usb_first',
        bootMode: 'legacy',
        sataMode: 'ide',
        secureBoot: false,
        tpmEnabled: false
      },
      partitionReq: {
        primarySizeGB: 120,
        primaryToleranceGB: 5,
        secondPartitionRequired: false,
        formatTargetPartition: true,
        targetPartitionIndex: 1
      },
      description: 'Configure Legacy BIOS with SATA Mode set to IDE Compatibility mode and USB as 1st boot device. Create a single 120 GB primary partition for Windows 7 Professional, format it, and proceed with installation.'
    }
  ],
  win10: [
    {
      id: 'task_win10_1',
      title: 'Windows 10 UEFI & Custom 150GB Partitioning',
      os: 'win10',
      diskSizeGB: 500,
      biosReq: {
        bootOrder: 'usb_first',
        bootMode: 'uefi',
        sataMode: 'ahci',
        secureBoot: true,
        tpmEnabled: false
      },
      partitionReq: {
        primarySizeGB: 150,
        primaryToleranceGB: 10,
        secondPartitionRequired: true,
        secondPartitionSizeGB: 300,
        formatTargetPartition: true,
        targetPartitionIndex: 1
      },
      description: 'Configure UEFI Boot Mode with Secure Boot ENABLED and SATA AHCI mode. Set UEFI USB as 1st Boot Device. Create a 150 GB System Partition for Windows 10 Pro and a 300 GB Data Partition. Format the 150 GB partition and install Windows 10.'
    },
    {
      id: 'task_win10_2',
      title: 'Windows 10 Workstation Setup (200GB OS)',
      os: 'win10',
      diskSizeGB: 1000,
      biosReq: {
        bootOrder: 'usb_first',
        bootMode: 'uefi',
        sataMode: 'ahci',
        secureBoot: true,
        tpmEnabled: true
      },
      partitionReq: {
        primarySizeGB: 200,
        primaryToleranceGB: 10,
        secondPartitionRequired: true,
        secondPartitionSizeGB: 500,
        formatTargetPartition: true,
        targetPartitionIndex: 1
      },
      description: 'Configure UEFI BIOS with Secure Boot & TPM Enabled, USB 1st Boot Device. Partition Drive 0: Create 200 GB OS Partition, 500 GB Work Partition. Format the OS Partition and install Windows 10 Pro.'
    }
  ],
  win11: [
    {
      id: 'task_win11_1',
      title: 'Windows 11 Strict Hardware Requirement Setup',
      os: 'win11',
      diskSizeGB: 1000,
      biosReq: {
        bootOrder: 'usb_first',
        bootMode: 'uefi',
        sataMode: 'ahci',
        secureBoot: true,
        tpmEnabled: true
      },
      partitionReq: {
        primarySizeGB: 250,
        primaryToleranceGB: 15,
        secondPartitionRequired: true,
        secondPartitionSizeGB: 500,
        formatTargetPartition: true,
        targetPartitionIndex: 1
      },
      description: 'Windows 11 requires pure UEFI Mode, Secure Boot ENABLED, and TPM 2.0 / PTT ENABLED in BIOS. Set USB as 1st boot device. In Windows Setup, create a 250 GB OS Partition and a 500 GB Storage Partition. Format C: drive and install Windows 11 Pro.'
    },
    {
      id: 'task_win11_2',
      title: 'Windows 11 Enterprise Disk Split (300GB System)',
      os: 'win11',
      diskSizeGB: 500,
      biosReq: {
        bootOrder: 'usb_first',
        bootMode: 'uefi',
        sataMode: 'ahci',
        secureBoot: true,
        tpmEnabled: true
      },
      partitionReq: {
        primarySizeGB: 300,
        primaryToleranceGB: 10,
        secondPartitionRequired: false,
        formatTargetPartition: true,
        targetPartitionIndex: 1
      },
      description: 'Configure modern UEFI with Secure Boot & TPM 2.0 Enabled. USB set to top boot priority. Create a 300 GB System Partition on Drive 0, format it, and install Windows 11 Enterprise.'
    }
  ]
};

// Generates a task deterministic to student name & section & OS
export function getTaskForStudent(name: string, section: string, os: OSType): TaskRequirement {
  const osTasks = PRESET_TASKS[os];
  if (!name.trim() && !section.trim()) {
    return osTasks[0];
  }
  const str = (name + section + os).toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % osTasks.length;
  return osTasks[index];
}

export function evaluateStudentConfig(state: SimulationState): EvaluationResult {
  const task = state.assignedTask;
  const details: ScoreDetail[] = [];

  // 1. Workflow & Reboot (10 pts)
  const restartEarned = state.rebootCount > 0 ? 5 : 0;
  details.push({
    category: 'Workflow & System Control',
    item: 'Restart Computer Simulator',
    earned: restartEarned,
    max: 5,
    passed: restartEarned === 5,
    feedback: restartEarned === 5 ? 'System properly restarted from desktop.' : 'Did not restart simulator computer.'
  });

  const biosSaveEarned = state.biosConfig.savedAndExited ? 5 : 0;
  details.push({
    category: 'Workflow & System Control',
    item: 'Save BIOS Configuration (F10)',
    earned: biosSaveEarned,
    max: 5,
    passed: biosSaveEarned === 5,
    feedback: biosSaveEarned === 5 ? 'Saved BIOS settings before exiting.' : 'Exited BIOS without saving settings.'
  });

  // 2. BIOS / UEFI Configuration (30 pts)
  // Boot Order (10 pts)
  const isUsbFirst = state.biosConfig.bootOrder[0] === 'usb';
  const bootOrderEarned = isUsbFirst ? 10 : 0;
  details.push({
    category: 'BIOS / UEFI Configuration',
    item: 'Boot Device Priority',
    earned: bootOrderEarned,
    max: 10,
    passed: isUsbFirst,
    feedback: isUsbFirst ? 'USB Flash Drive correctly set as 1st Boot Device.' : `1st Boot Device set to ${state.biosConfig.bootOrder[0]?.toUpperCase() || 'HDD'} instead of USB.`
  });

  // Boot Mode (8 pts)
  const bootModePassed = state.biosConfig.bootMode === task.biosReq.bootMode;
  const bootModeEarned = bootModePassed ? 8 : 0;
  details.push({
    category: 'BIOS / UEFI Configuration',
    item: 'Boot Mode (UEFI vs Legacy)',
    earned: bootModeEarned,
    max: 8,
    passed: bootModePassed,
    feedback: bootModePassed ? `Boot mode correctly set to ${task.biosReq.bootMode.toUpperCase()}.` : `Selected ${state.biosConfig.bootMode.toUpperCase()} mode; task requested ${task.biosReq.bootMode.toUpperCase()}.`
  });

  // SATA Controller Mode (6 pts)
  const sataPassed = state.biosConfig.sataMode === task.biosReq.sataMode;
  const sataEarned = sataPassed ? 6 : 0;
  details.push({
    category: 'BIOS / UEFI Configuration',
    item: 'SATA Controller Mode',
    earned: sataEarned,
    max: 6,
    passed: sataPassed,
    feedback: sataPassed ? `SATA mode correctly configured as ${task.biosReq.sataMode.toUpperCase()}.` : `SATA mode set to ${state.biosConfig.sataMode.toUpperCase()}; expected ${task.biosReq.sataMode.toUpperCase()}.`
  });

  // Secure Boot & TPM (6 pts)
  const secureBootPassed = state.biosConfig.secureBoot === task.biosReq.secureBoot;
  const tpmPassed = state.biosConfig.tpmEnabled === task.biosReq.tpmEnabled;
  const secEarned = (secureBootPassed ? 3 : 0) + (tpmPassed ? 3 : 0);
  details.push({
    category: 'BIOS / UEFI Configuration',
    item: 'Secure Boot & TPM 2.0 Configuration',
    earned: secEarned,
    max: 6,
    passed: secEarned === 6,
    feedback: secEarned === 6
      ? 'Secure Boot and TPM 2.0 matched requirements.'
      : `Secure Boot: ${state.biosConfig.secureBoot ? 'ON' : 'OFF'} (req: ${task.biosReq.secureBoot ? 'ON' : 'OFF'}), TPM: ${state.biosConfig.tpmEnabled ? 'ON' : 'OFF'} (req: ${task.biosReq.tpmEnabled ? 'ON' : 'OFF'}).`
  });

  // 3. Disk Partitioning Accuracy (40 pts)
  const primaryPart = state.partitions.find(p => p.type === 'primary');
  const targetMB = task.partitionReq.primarySizeGB * 1024;
  const toleranceMB = task.partitionReq.primaryToleranceGB * 1024;

  let partSizeEarned = 0;
  let partSizeFeedback = 'No primary partition created.';
  if (primaryPart) {
    const diff = Math.abs(primaryPart.sizeMB - targetMB);
    if (diff <= toleranceMB) {
      partSizeEarned = 20;
      partSizeFeedback = `Primary partition size (${(primaryPart.sizeMB / 1024).toFixed(1)} GB) matches task requirement (${task.partitionReq.primarySizeGB} GB).`;
    } else if (diff <= toleranceMB * 2) {
      partSizeEarned = 10;
      partSizeFeedback = `Primary partition size (${(primaryPart.sizeMB / 1024).toFixed(1)} GB) is close but slightly outside preferred range (${task.partitionReq.primarySizeGB} GB ±${task.partitionReq.primaryToleranceGB} GB).`;
    } else {
      partSizeFeedback = `Primary partition size was ${(primaryPart.sizeMB / 1024).toFixed(1)} GB; expected approx ${task.partitionReq.primarySizeGB} GB.`;
    }
  }
  details.push({
    category: 'Disk Partitioning',
    item: 'Primary Partition Size Allocation',
    earned: partSizeEarned,
    max: 20,
    passed: partSizeEarned >= 15,
    feedback: partSizeFeedback
  });

  // Second partition check (10 pts)
  let secPartEarned = 0;
  let secPartFeedback = '';
  const primaryPartitionsCount = state.partitions.filter(p => p.type === 'primary').length;
  if (task.partitionReq.secondPartitionRequired) {
    if (primaryPartitionsCount >= 2) {
      secPartEarned = 10;
      secPartFeedback = 'Secondary Data partition created as requested.';
    } else {
      secPartFeedback = 'Task required a secondary data partition, but only 1 primary partition was created.';
    }
  } else {
    secPartEarned = 10;
    secPartFeedback = 'Single partition configuration appropriate as required.';
  }
  details.push({
    category: 'Disk Partitioning',
    item: 'Secondary Partition Allocation',
    earned: secPartEarned,
    max: 10,
    passed: secPartEarned === 10,
    feedback: secPartFeedback
  });

  // Formatting (10 pts)
  let formatEarned = 0;
  let formatFeedback = 'Partition was not formatted before selection.';
  const installedPart = state.partitions.find(p => p.id === state.installedPartitionId);
  if (installedPart && installedPart.formatted) {
    formatEarned = 10;
    formatFeedback = 'Target OS partition was formatted correctly.';
  } else if (installedPart) {
    formatFeedback = 'Installed OS without explicit Quick Format step on target partition.';
  }
  details.push({
    category: 'Disk Partitioning',
    item: 'Partition Format',
    earned: formatEarned,
    max: 10,
    passed: formatEarned === 10,
    feedback: formatFeedback
  });

  // 4. OS Selection & Installation (20 pts)
  const osMatch = state.selectedOS === task.os;
  const osMatchEarned = osMatch ? 10 : 0;
  details.push({
    category: 'OS Setup',
    item: 'Correct OS Selection',
    earned: osMatchEarned,
    max: 10,
    passed: osMatch,
    feedback: osMatch ? `Installed correct OS (${task.os.toUpperCase()}).` : `Installed ${state.selectedOS.toUpperCase()} when assigned task specified ${task.os.toUpperCase()}.`
  });

  const correctTargetEarned = (installedPart && installedPart.type === 'primary') ? 10 : 0;
  details.push({
    category: 'OS Setup',
    item: 'Target Partition OS Installation',
    earned: correctTargetEarned,
    max: 10,
    passed: correctTargetEarned === 10,
    feedback: correctTargetEarned === 10 ? 'Windows installed onto primary system partition.' : 'Windows installed onto invalid or non-primary partition (e.g. system reserved).'
  });

  const totalEarned = details.reduce((acc, d) => acc + d.earned, 0);
  const totalMax = details.reduce((acc, d) => acc + d.max, 0);
  const percentage = Math.round((totalEarned / totalMax) * 100);

  let grade = 'F';
  if (percentage >= 90) grade = 'A (Excellent)';
  else if (percentage >= 80) grade = 'B (Proficient)';
  else if (percentage >= 70) grade = 'C (Satisfactory)';
  else if (percentage >= 60) grade = 'D (Needs Improvement)';

  const startTime = state.startTime || Date.now();
  const endTime = state.endTime || Date.now();
  const completionTimeSeconds = Math.max(1, Math.round((endTime - startTime) / 1000));

  return {
    student: state.student,
    task,
    selectedOS: state.selectedOS,
    scoreDetails: details,
    totalEarned,
    totalMax,
    percentage,
    grade,
    passed: percentage >= 70,
    completionTimeSeconds,
    timestamp: new Date().toLocaleString()
  };
}

export function exportToCSV(result: EvaluationResult): void {
  const headers = [
    'Student Name',
    'Section',
    'Target OS',
    'Task Title',
    'Final Score (%)',
    'Letter Grade',
    'Pass/Fail',
    'Time Taken (s)',
    'Timestamp',
    'BIOS Boot Order',
    'BIOS Boot Mode',
    'SATA Mode',
    'Partitioning Status',
    'Detailed Feedback'
  ];

  const feedbackSummary = result.scoreDetails
    .map(d => `[${d.item}: ${d.earned}/${d.max} - ${d.feedback}]`)
    .join(' | ')
    .replace(/"/g, '""');

  const row = [
    `"${result.student.name}"`,
    `"${result.student.section}"`,
    `"${result.selectedOS.toUpperCase()}"`,
    `"${result.task.title.replace(/"/g, '""')}"`,
    `"${result.percentage}%"`,
    `"${result.grade}"`,
    `"${result.passed ? 'PASS' : 'FAIL'}"`,
    `"${result.completionTimeSeconds}"`,
    `"${result.timestamp}"`,
    `"${result.scoreDetails.find(d => d.item === 'Boot Device Priority')?.passed ? 'PASS' : 'FAIL'}"`,
    `"${result.scoreDetails.find(d => d.item.includes('Boot Mode'))?.passed ? 'PASS' : 'FAIL'}"`,
    `"${result.scoreDetails.find(d => d.item === 'SATA Controller Mode')?.passed ? 'PASS' : 'FAIL'}"`,
    `"${result.scoreDetails.find(d => d.item.includes('Primary Partition'))?.passed ? 'PASS' : 'FAIL'}"`,
    `"${feedbackSummary}"`
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), row.join(',')].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const cleanName = (result.student.name || 'Student').replace(/[^a-zA-Z0-0_]/g, '_');
  link.setAttribute('download', `OS_Installer_Result_${cleanName}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
