import type { BridgeStep, BridgeStatus } from "../../types";
import s from "./BridgeProgress.module.css";
import s_ from "../../HyperBridge.module.css";
interface BridgeProgressProps {
  status: BridgeStatus;
  steps: BridgeStep[];
  currentStep?: number;
  error?: string;
}

function StepIcon({ status }: { status: BridgeStep["status"] }) {
  switch (status) {
    case "completed":
      return <span className={s.stepIconCompleted}>&#10003;</span>;
    case "active":
      return <span className={s.stepIconActive}>&#8987;</span>;
    case "failed":
      return <span className={s.stepIconFailed}>&#10007;</span>;
    default:
      return <span className={s.stepIconPending}>&#9675;</span>;
  }
}

function StepTypeLabel({ type }: { type: BridgeStep["type"] }) {
  const labels: Record<string, string> = {
    swap: "Swap",
    bridge: "Bridge",
    approval: "Approve",
    unknown: "Step",
  };
  return <span className={s.stepType}>{labels[type] || "Step"}</span>;
}
export default function BridgeProgress({
  status,
  steps,
  error,
}: BridgeProgressProps) {
  if (status === "idle") {
    return (
      <div className={s.progressContainer}>
        <h3 className={s.progressTitle}>Bridge Progress</h3>
        <p className={s.progressEmpty}>
          Select tokens and initiate a bridge to see progress here.
        </p>
      </div>
    );
  }

  return (
    <div className={s.progressContainer}>
      <h3 className={s.progressTitle}>
        Bridge Progress
        {status === "completed" && (
          <span className={s.statusBadgeCompleted}>Complete</span>
        )}
        {status === "failed" && (
          <span className={s.statusBadgeFailed}>Failed</span>
        )}
        {status === "executing" && (
          <span className={s.statusBadgeExecuting}>In Progress</span>
        )}
      </h3>

      {error && <div className={s_.errorMessage}>{error}</div>}

      <div className={s.stepsList}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`${s.stepItem} ${s[`stepStatus_${step.status}`]}`}
          >
            <div className={s.stepIconWrapper}>
              <StepIcon status={step.status} />
              {index < steps.length - 1 && <div className={s.stepConnector} />}
            </div>

            <div className={s.stepContent}>
              <div className={s.stepHeader}>
                <StepTypeLabel type={step.type} />
                <span className={s.stepTool}>via {step.tool}</span>
              </div>

              <div className={s.stepDetails}>
                <span className={s.stepToken}>{step.fromToken}</span>
                <span className={s.stepArrow}>&rarr;</span>
                <span className={s.stepToken}>{step.toToken}</span>
              </div>

              <div className={s.stepChains}>
                {step.fromChain} &rarr; {step.toChain}
              </div>

              {step.txHash && (
                <a
                  href={`https://li.fi/tx/${step.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.txLink}
                >
                  View tx &rarr;
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {steps.length === 0 && status === "executing" && (
        <p className={s.progressLoading}>Loading steps...</p>
      )}
    </div>
  );
}
