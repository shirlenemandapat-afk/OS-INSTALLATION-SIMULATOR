export type OSType = 'win7' | 'win10' | 'win11';

export interface StudentInfo {
  name: string;
  section: string;
}

export interface TaskRequirement {
  id: string;
  title: string;
  os: OSType;
  diskSizeGB: number; // e.g. 250, 500, 1000
  biosReq: {
    bootOrder: 'usb_first' | 'hdd_first' | 'cd_first';
    bootMode: 'uefi' | 'legacy';
    sataMode: 'ahci' | 'ide';
    secureBoot: boolean;
    tpmEnabled: boolean;
  };
  partitionReq: {
    primarySizeGB: number; // e.g. 100
    primaryToleranceGB: number; // e.g. 5 (allows 95-105 GB)
    secondPartitionRequired: boolean;
    secondPartitionSizeGB?: number;
    formatTargetPartition: boolean;
    targetPartitionIndex: number; // e.g. 1 or 2
  };
  description: string;
}

export interface RubricItem {
  id: string;
  category: string;
  maxPoints: number;
  description: string;
}

export interface BiosConfig {
  bootOrder: string[]; // ['usb', 'hdd', 'cd']
  bootMode: 'uefi' | 'legacy';
  sataMode: 'ahci' | 'ide';
  secureBoot: boolean;
  tpmEnabled: boolean;
  savedAndExited: boolean;
}

export interface PartitionItem {
  id: string;
  driveNumber: number;
  partitionNumber: number | null; // null if unallocated
  name: string;
  sizeMB: number;
  type: 'system' | 'msr' | 'recovery' | 'primary' | 'unallocated';
  formatted: boolean;
}

export interface SimulationState {
  step: 'portal' | 'desktop' | 'rebooting' | 'powered_off' | 'bios' | 'installer_language' | 'installer_welcome' | 'installer_key' | 'installer_edition' | 'installer_type' | 'installer_partition' | 'installer_copying' | 'oobe' | 'complete_desktop' | 'evaluation';
  student: StudentInfo;
  selectedOS: OSType;
  assignedTask: TaskRequirement;
  biosConfig: BiosConfig;
  partitions: PartitionItem[];
  selectedPartitionId: string | null;
  installedPartitionId: string | null;
  startTime: number | null;
  endTime: number | null;
  rebootCount: number;
  biosAccessed: boolean;
}

export interface ScoreDetail {
  category: string;
  item: string;
  earned: number;
  max: number;
  passed: boolean;
  feedback: string;
}

export interface EvaluationResult {
  student: StudentInfo;
  task: TaskRequirement;
  selectedOS: OSType;
  scoreDetails: ScoreDetail[];
  totalEarned: number;
  totalMax: number;
  percentage: number;
  grade: string;
  passed: boolean;
  completionTimeSeconds: number;
  timestamp: string;
}
