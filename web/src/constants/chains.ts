import { ChainId } from "@lifi/widget";

export const chainWhitelist: Array<ChainId> = [
  ChainId.ETH, // Ethereum
  ChainId.POL, // Polygon
  ChainId.BSC, // BNB Chain
  ChainId.ARB, // Arbitrum
  ChainId.OPT, // Optimism
  ChainId.BAS, // Base
  ChainId.AVA, // Avalanche
  ChainId.LNA, // Linea
  ChainId.ERA, // zkSync Era
  ChainId.SCL, // Scroll
  ChainId.BLS, // Blast
  ChainId.MNT, // Mantle
  ChainId.DAI, // Gnosis

  ChainId.HYP,

  // Non-EVM
  ChainId.SOL,
  ChainId.BTC,
  ChainId.SUI,
];

export const TestnetChainId = {
  SEP: 1115511,
  HYPE_T: 998,
} as const;

export type TestnetChainId =
  (typeof TestnetChainId)[keyof typeof TestnetChainId];
