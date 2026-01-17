import { useState, useCallback } from "react";
import { useActiveAccount } from "thirdweb/react";
import client from "../../util/client";
import HyperBridgeWidget from "./Components/HyperBridgeWidget/HyperBridgeWidget";
import RouteDetails from "./Components/RouteDetails/RouteDetails";
import { useWidgetEventHandler } from "./hooks/useWidgetEventHandler";
import {
  useBridgeStatus,
  createInitialBridgeState,
} from "./hooks/useBridgeStatus";
import type { BridgeState, BridgeStep } from "./types";
import s from "./HyperBridge.module.css";
import ConnectButton from "./Components/ConnectButton/ConnectButton";
import BridgeProgress from "./Components/BrigeProgress/BridgeProgress";

function HyperBridgeContent() {
  const [bridgeState, setBridgeState] = useState<BridgeState>(
    createInitialBridgeState,
  );

  const handleStateChange = useCallback(
    (updater: (prev: BridgeState) => BridgeState) => {
      setBridgeState(updater);
    },
    [],
  );

  const handleStepsUpdate = useCallback((steps: BridgeStep[]) => {
    setBridgeState((prev) => ({
      ...prev,
      steps,
    }));
  }, []);

  const handleStatusChange = useCallback((status: "completed" | "failed") => {
    setBridgeState((prev) => ({
      ...prev,
      status,
      steps: prev.steps.map((step) => ({
        ...step,
        status:
          status === "completed" && step.status !== "failed"
            ? "completed"
            : step.status,
      })),
    }));
  }, []);

  // Subscribe to widget events
  useWidgetEventHandler({ onStateChange: handleStateChange });

  // Poll status API for detailed step tracking
  useBridgeStatus({
    txHash: bridgeState.txHash,
    isExecuting: bridgeState.status === "executing",
    onStepsUpdate: handleStepsUpdate,
    onStatusChange: handleStatusChange,
  });

  return (
    <div className={s.grid}>
      <div
        className={s.widgetColumn}
        style={{ height: "auto", maxHeight: "none" }}
      >
        <HyperBridgeWidget />
      </div>
      <div className={s.infoColumn}>
        <BridgeProgress
          status={bridgeState.status}
          steps={bridgeState.steps}
          currentStep={bridgeState.currentStep}
          error={bridgeState.error}
        />
        <RouteDetails route={bridgeState.route} />
      </div>
    </div>
  );
}

export default function Bridge() {
  const account = useActiveAccount();

  if (!account) {
    return (
      <div className={s.container}>
        <div className={s.connectGate}>
          <h1 className={s.connectTitle}>Bridge to HyperEVM</h1>
          <p className={s.connectSub}>
            Connect your wallet to bridge tokens from any chain to HyperEVM.
          </p>
          <ConnectButton client={client} />
        </div>
      </div>
    );
  }

  return (
    <div className={s.container}>
      <h1 className={s.title}>Bridge to HyperEVM</h1>
      <p className={s.subtitle}>
        Bridge tokens from any chain to HyperEVM (Chain ID 999)
      </p>
      <HyperBridgeContent />
    </div>
  );
}
