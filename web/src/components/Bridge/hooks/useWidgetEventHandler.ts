import { useEffect } from "react";
// Docs: https://docs.li.fi/widget/widget-events
import { useWidgetEvents, WidgetEvent } from "@lifi/widget";
import type { LiFiStep, WidgetEvents } from "@lifi/widget";
import type { BridgeState, BridgeStep, RouteInfo, StepStatus } from "../types";
import { getChainNameFromId } from "@util/util";

// Widget event types from WidgetEvents
// Docs: https://docs.li.fi/widget/widget-events#available-events
type Route = WidgetEvents["routeExecutionStarted"];
type RouteExecutionUpdate = WidgetEvents["routeExecutionUpdated"];

// Partial type definition for route steps
interface RouteStep {
  id: string;
  type: string;
  tool: string;
  action: {
    fromChainId: number;
    toChainId: number;
    fromToken: { symbol: string };
    toToken: { symbol: string };
  };
  estimate?: {
    approvalAddress?: string;
    executionDuration?: number;
  };
  execution?: {
    status: string;
    txHash?: string;
  };
}

function extractRouteInfo(route: Route): RouteInfo {
  const steps = route.steps;
  return {
    fromAmount: route.fromAmount,
    toAmount: route.toAmount,
    fromToken: route.fromToken?.symbol || "Unknown",
    toToken: route.toToken?.symbol || "Unknown",
    fromChain: getChainNameFromId(route.fromChainId),
    toChain: getChainNameFromId(route.toChainId),
    estimatedTime: steps.reduce(
      (acc: number, step: RouteStep) =>
        acc + (step.estimate?.executionDuration || 0),
      0,
    ),
    gasCostUSD: route.gasCostUSD || "0",
  };
}

function extractStepsFromRoute(route: Route): BridgeStep[] {
  const bridgeSteps: BridgeStep[] = [];
  const steps: Array<LiFiStep> = route.steps;

  steps.forEach((step: RouteStep, index: number) => {
    // Add approval step if needed
    if (step.estimate?.approvalAddress) {
      bridgeSteps.push({
        id: `${step.id}-approval`,
        type: "approval",
        tool: step.tool,
        fromChain: getChainNameFromId(step.action.fromChainId),
        toChain: getChainNameFromId(step.action.fromChainId),
        fromToken: step.action.fromToken.symbol,
        toToken: step.action.fromToken.symbol,
        status: "pending",
      });
    }

    // Add the main step
    bridgeSteps.push({
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
      status: "pending",
    });
  });

  return bridgeSteps;
}

interface UseWidgetEventHandlerProps {
  onStateChange: (updater: (prev: BridgeState) => BridgeState) => void;
}

export function useWidgetEventHandler({
  onStateChange,
}: UseWidgetEventHandlerProps) {
  const widgetEvents = useWidgetEvents();

  useEffect(() => {
    const handleRouteExecutionStarted = (route: Route) => {
      const steps = extractStepsFromRoute(route);
      const routeInfo = extractRouteInfo(route);

      onStateChange((prev) => ({
        ...prev,
        status: "executing",
        currentStep: 0,
        steps: steps.map((step, idx) => ({
          ...step,
          status: idx === 0 ? "active" : "pending",
        })),
        route: routeInfo,
        error: undefined,
      }));
    };

    const handleRouteExecutionUpdated = (update: RouteExecutionUpdate) => {
      const { route, process } = update;
      const steps: Array<RouteStep> = route.steps;

      onStateChange((prev) => {
        const updatedSteps = [...prev.steps];
        let currentStepIndex = prev.currentStep;
        let txHash = prev.txHash || process?.txHash;

        // Update steps based on route execution state
        steps.forEach((step: RouteStep) => {
          if (!step.execution) {
            return;
          }
          const stepIndex = updatedSteps.findIndex((s) => s.id === step.id);
          if (stepIndex === -1) {
            return;
          }
          const execStatus = step.execution.status;
          let stepExecStatus: StepStatus = "pending";
          if (execStatus === "DONE") {
            stepExecStatus = "completed";
          }
          if (execStatus === "FAILED") {
            stepExecStatus = "failed";
          }
          if (execStatus === "PENDING") {
            stepExecStatus = "active";
          }

          updatedSteps[stepIndex] = {
            ...updatedSteps[stepIndex],
            status: stepExecStatus,
            txHash: step.execution.txHash || updatedSteps[stepIndex].txHash,
          };

          if (execStatus === "DONE" && stepIndex >= currentStepIndex) {
            currentStepIndex = stepIndex + 1;
          }

          // step tx has completed ?
          if (!txHash && step.execution.txHash) {
            txHash = step.execution.txHash;
          }
        });

        // Mark the next pending step as active
        if (
          currentStepIndex < updatedSteps.length &&
          updatedSteps[currentStepIndex].status === "pending"
        ) {
          updatedSteps[currentStepIndex] = {
            ...updatedSteps[currentStepIndex],
            status: "active",
          };
        }

        return {
          ...prev,
          steps: updatedSteps,
          currentStep: currentStepIndex,
          txHash,
        };
      });
    };

    const handleRouteExecutionCompleted = (route: Route) => {
      onStateChange((prev) => ({
        ...prev,
        status: "completed",
        steps: prev.steps.map((step) => ({
          ...step,
          status: step.status === "failed" ? "failed" : "completed",
        })),
        route: extractRouteInfo(route),
      }));
    };

    const handleRouteExecutionFailed = (_update: RouteExecutionUpdate) => {
      onStateChange((prev) => ({
        ...prev,
        status: "failed",
        error: "Bridge transaction failed",
      }));
    };

    widgetEvents.on(
      WidgetEvent.RouteExecutionStarted,
      handleRouteExecutionStarted,
    );
    widgetEvents.on(
      WidgetEvent.RouteExecutionUpdated,
      handleRouteExecutionUpdated,
    );
    widgetEvents.on(
      WidgetEvent.RouteExecutionCompleted,
      handleRouteExecutionCompleted,
    );
    widgetEvents.on(
      WidgetEvent.RouteExecutionFailed,
      handleRouteExecutionFailed,
    );

    return () => {
      widgetEvents.off(
        WidgetEvent.RouteExecutionStarted,
        handleRouteExecutionStarted,
      );
      widgetEvents.off(
        WidgetEvent.RouteExecutionUpdated,
        handleRouteExecutionUpdated,
      );
      widgetEvents.off(
        WidgetEvent.RouteExecutionCompleted,
        handleRouteExecutionCompleted,
      );
      widgetEvents.off(
        WidgetEvent.RouteExecutionFailed,
        handleRouteExecutionFailed,
      );
    };
  }, [widgetEvents, onStateChange]);
}
