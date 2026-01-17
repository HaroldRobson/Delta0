export type BridgeStatus = 'idle' | 'executing' | 'completed' | 'failed';

export type StepStatus = 'pending' | 'active' | 'completed' | 'failed';

export interface BridgeStep {
  id: string;
  type: 'swap' | 'bridge' | 'approval' | 'unknown';
  tool: string;
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  status: StepStatus;
  txHash?: string;
}

export interface RouteInfo {
  fromAmount: string;
  toAmount: string;
  fromToken: string;
  toToken: string;
  fromChain: string;
  toChain: string;
  estimatedTime: number;
  gasCostUSD: string;
}

export interface BridgeState {
  status: BridgeStatus;
  currentStep: number;
  steps: BridgeStep[];
  route?: RouteInfo;
  txHash?: string;
  error?: string;
}

// LI.FI Status API response types
export interface LiFiStatusStep {
  id: string;
  type: string;
  tool: string;
  action: {
    fromChainId: number;
    toChainId: number;
    fromToken: { symbol: string };
    toToken: { symbol: string };
  };
  execution?: {
    status: 'NOT_STARTED' | 'PENDING' | 'DONE' | 'FAILED';
    txHash?: string;
  };
}

export interface LiFiStatusResponse {
  status: 'NOT_FOUND' | 'PENDING' | 'DONE' | 'FAILED';
  substatus?: string;
  includedSteps?: LiFiStatusStep[];
  sending?: { txHash?: string };
  receiving?: { txHash?: string };
}
