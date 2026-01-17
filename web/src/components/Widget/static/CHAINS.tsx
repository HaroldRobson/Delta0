export const CHAINS = {
  ETH: 1,
  HYPEREVM: 999,
  SOL: 1151111081099710,
  BTC: 20000000000001,
} as const;

export type ChainKey = keyof typeof CHAINS;
export type ChainId = (typeof CHAINS)[ChainKey];
