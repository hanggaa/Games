export interface CyberTarget {
  id: string;
  name: string;
  securityLevel: number;
  rewardChips: number;
  description: string;
  matrixSize: number;
  sequenceLength: number;
  traceSpeed: number; // trace % per second
}

export type CyberStatus = 'target-select' | 'infiltrating' | 'breached' | 'compromised';
