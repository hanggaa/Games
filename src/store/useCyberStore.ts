import { create } from 'zustand';
import { CyberTarget, CyberStatus } from '../types/cyber.types';
import { CYBER_TARGETS, generateMatrix, generateTargetSequence } from '../engine/cyber/cyberEngine';
import { sound } from '../engine/audio/soundEngine';
import { useBankrollStore } from './useBankrollStore';

interface CyberState {
  status: CyberStatus;
  currentTarget: CyberTarget;
  matrix: string[][];
  targetSequence: string[];
  currentInputSequence: string[];
  currentRow: number | null;
  currentCol: number | null;
  isRowActive: boolean; // toggle between picking row vs col
  tracePercent: number;
  proxyHopsLeft: number;
  iceBreakersLeft: number;
  isFrozen: boolean;
  terminalLogs: string[];

  // Actions
  initGame: () => void;
  selectTarget: (target: CyberTarget) => void;
  selectCell: (row: number, col: number) => void;
  useProxyHop: () => void;
  useIceBreaker: () => void;
  tickTrace: () => void;
}

export const useCyberStore = create<CyberState>()((set, get) => ({
  status: 'target-select',
  currentTarget: CYBER_TARGETS[0],
  matrix: [],
  targetSequence: [],
  currentInputSequence: [],
  currentRow: 0,
  currentCol: null,
  isRowActive: true,
  tracePercent: 0,
  proxyHopsLeft: 2,
  iceBreakersLeft: 1,
  isFrozen: false,
  terminalLogs: [],

  initGame: () => {
    set({ status: 'target-select', terminalLogs: ['Awaiting remote uplink target selection...'] });
  },

  selectTarget: (target: CyberTarget) => {
    sound.playHackerBeep(true);
    const matrix = generateMatrix(target.matrixSize);
    const targetSequence = generateTargetSequence(matrix, target.sequenceLength);

    set({
      status: 'infiltrating',
      currentTarget: target,
      matrix,
      targetSequence,
      currentInputSequence: [],
      currentRow: 0,
      currentCol: null,
      isRowActive: true,
      tracePercent: 0,
      proxyHopsLeft: 2,
      iceBreakersLeft: 1,
      isFrozen: false,
      terminalLogs: [
        `[AUTH] Connected to ${target.name}.`,
        `[ALERT] Intrusion Detection System active. Match buffer sequence.`,
      ],
    });
  },

  selectCell: (row: number, col: number) => {
    const { status, matrix, targetSequence, currentInputSequence, isRowActive, currentRow, currentCol, currentTarget } = get();
    if (status !== 'infiltrating') return;

    // Validate constraint (must be in active row or active column)
    if (isRowActive && row !== currentRow) return;
    if (!isRowActive && col !== currentCol) return;

    const val = matrix[row][col];
    sound.playHackerBeep(true);

    const nextInput = [...currentInputSequence, val];

    // Check if input sequence matched so far
    const isMatching = nextInput.every((v, i) => v === targetSequence[i]);

    if (!isMatching) {
      sound.playHackerBeep(false);
      set({
        currentInputSequence: [],
        currentRow: row,
        currentCol: col,
        isRowActive: !isRowActive,
        terminalLogs: [`[ERROR] Buffer mismatch on '${val}'. Sequence reset.`, ...get().terminalLogs],
      });
      return;
    }

    // Check if full sequence matched!
    if (nextInput.length === targetSequence.length) {
      sound.playWinFanfare();
      useBankrollStore.getState().addChips(currentTarget.rewardChips);
      set({
        status: 'breached',
        currentInputSequence: nextInput,
        terminalLogs: [
          `[SUCCESS] Security Matrix Decrypted!`,
          `[EXTRACT] Extracted payload. Bounty: +$${currentTarget.rewardChips} chips!`,
          ...get().terminalLogs,
        ],
      });
      return;
    }

    set({
      currentInputSequence: nextInput,
      currentRow: row,
      currentCol: col,
      isRowActive: !isRowActive,
      terminalLogs: [`[DATA] Buffer byte accepted: '${val}'.`, ...get().terminalLogs],
    });
  },

  useProxyHop: () => {
    const { proxyHopsLeft, tracePercent, status } = get();
    if (status !== 'infiltrating' || proxyHopsLeft <= 0) return;

    sound.playButtonClick();
    set({
      proxyHopsLeft: proxyHopsLeft - 1,
      tracePercent: Math.max(0, tracePercent - 30),
      terminalLogs: [`[COUNTERMEASURE] Proxy Hop executed. Trace reduced by 30%.`, ...get().terminalLogs],
    });
  },

  useIceBreaker: () => {
    const { iceBreakersLeft, status } = get();
    if (status !== 'infiltrating' || iceBreakersLeft <= 0) return;

    sound.playButtonClick();
    set({
      iceBreakersLeft: iceBreakersLeft - 1,
      isFrozen: true,
      terminalLogs: [`[COUNTERMEASURE] ICE Breaker deployed. Trace frozen for 6s.`, ...get().terminalLogs],
    });

    setTimeout(() => {
      useCyberStore.setState({ isFrozen: false });
    }, 6000);
  },

  tickTrace: () => {
    const { status, tracePercent, currentTarget, isFrozen } = get();
    if (status !== 'infiltrating' || isFrozen) return;

    const newTrace = tracePercent + currentTarget.traceSpeed * 0.2;
    if (newTrace >= 100) {
      sound.playBust();
      set({
        status: 'compromised',
        tracePercent: 100,
        terminalLogs: [`[CRITICAL] Trace complete. Host connection terminated.`, ...get().terminalLogs],
      });
    } else {
      set({ tracePercent: newTrace });
    }
  },
}));
