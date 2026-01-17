import type { LiFiStatusResponse, BridgeStep, StepStatus } from "../types";
import { getChainNameFromId } from "@util/util";

// LI.FI Status API for tracking bridge transaction progress
// Docs: https://docs.li.fi/introduction/user-flows-and-examples/status-tracking
const STATUS_API_URL = "https://li.quest/v1/status";

// Fetch transaction status from LI.FI Status API
// Docs: https://docs.li.fi/li.fi-api/li.fi-api/checking-the-status-of-a-transfer
export async function fetchBridgeStatus(
  txHash: string,
): Promise<LiFiStatusResponse> {
  const response = await fetch(`${STATUS_API_URL}?txHash=${txHash}`);
  if (!response.ok) {
    throw new Error(`Status API error: ${response.status}`);
  }
  return response.json();
}

function mapExecutionStatus(status?: string): StepStatus {
  switch (status) {
    case "DONE":
      return "completed";
    case "FAILED":
      return "failed";
    case "PENDING":
      return "active";
    default:
      return "pending";
  }
}

export function parseStatusToSteps(response: LiFiStatusResponse): BridgeStep[] {
  if (!response.includedSteps) {
    return [];
  }

  return response.includedSteps.map((step, index) => ({
    id: step.id || `step-${index}`,
    type:
      step.type === "swap"
        ? "swap"
        : step.type === "cross"
          ? "bridge"
          : "unknown",
    tool: step.tool,
    fromChain: getChainNameFromId(step.action.fromChainId),
    toChain: getChainNameFromId(step.action.toChainId),
    fromToken: step.action.fromToken.symbol,
    toToken: step.action.toToken.symbol,
    status: mapExecutionStatus(step.execution?.status),
    txHash: step.execution?.txHash,
  }));
}

export function isTerminalStatus(status: string): boolean {
  return status === "DONE" || status === "FAILED";
}
