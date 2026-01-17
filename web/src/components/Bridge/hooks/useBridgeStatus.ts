import { useEffect, useRef } from "react";
import {
  fetchBridgeStatus,
  parseStatusToSteps,
  isTerminalStatus,
} from "../utils/statusApi";
import type { BridgeState, BridgeStep } from "../types";
import { STATUS_POLL_INTERVAL } from "@constants/hyperbridge";

// Hook to poll LI.FI Status API for detailed step-by-step bridge progress
// Docs: https://docs.li.fi/introduction/user-flows-and-examples/status-tracking
interface UseBridgeStatusProps {
  txHash?: string;
  isExecuting: boolean;
  onStepsUpdate: (steps: BridgeStep[]) => void;
  onStatusChange: (status: "completed" | "failed") => void;
}

export function useBridgeStatus({
  txHash,
  isExecuting,
  onStepsUpdate,
  onStatusChange,
}: UseBridgeStatusProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!txHash || !isExecuting) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const pollStatus = async () => {
      try {
        const response = await fetchBridgeStatus(txHash);

        // Update steps from the status response
        const steps = parseStatusToSteps(response);
        if (steps.length > 0) {
          onStepsUpdate(steps);
        }

        // Check if we've reached a terminal state
        if (isTerminalStatus(response.status)) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          onStatusChange(response.status === "DONE" ? "completed" : "failed");
        }
      } catch (error) {
        console.error("Failed to fetch bridge status:", error);
      }
    };

    // Initial poll
    pollStatus();

    // Set up interval polling
    intervalRef.current = setInterval(pollStatus, STATUS_POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [txHash, isExecuting, onStepsUpdate, onStatusChange]);
}

export function createInitialBridgeState(): BridgeState {
  return {
    status: "idle",
    currentStep: 0,
    steps: [],
  };
}
