import { CyberTarget } from '../../types/cyber.types';

export const CYBER_TARGETS: CyberTarget[] = [
  {
    id: 'target-aegis',
    name: 'Aegis Robotics Node',
    securityLevel: 1,
    rewardChips: 100,
    description: 'Subnet terminal containing prototype drone schematics.',
    matrixSize: 4,
    sequenceLength: 3,
    traceSpeed: 2.5,
  },
  {
    id: 'target-neurolink',
    name: 'NeuroLink Datavault',
    securityLevel: 2,
    rewardChips: 250,
    description: 'Encrypted synaptic AI weights and biometric hashes.',
    matrixSize: 5,
    sequenceLength: 4,
    traceSpeed: 3.5,
  },
  {
    id: 'target-titan',
    name: 'Titan Orbital Defense',
    securityLevel: 3,
    rewardChips: 500,
    description: 'Classified military satellite uplink control grid.',
    matrixSize: 5,
    sequenceLength: 5,
    traceSpeed: 4.5,
  },
];

const HEX_CODES = ['1C', 'E9', '7A', '55', 'BD', 'FF', '2B', 'A0'];

export function generateMatrix(size: number): string[][] {
  const matrix: string[][] = [];
  for (let r = 0; r < size; r++) {
    const row: string[] = [];
    for (let c = 0; c < size; c++) {
      row.push(HEX_CODES[Math.floor(Math.random() * HEX_CODES.length)]);
    }
    matrix.push(row);
  }
  return matrix;
}

export function generateTargetSequence(matrix: string[][], length: number): string[] {
  const sequence: string[] = [];
  const flat = matrix.flat();
  for (let i = 0; i < length; i++) {
    sequence.push(flat[Math.floor(Math.random() * flat.length)]);
  }
  return sequence;
}
