import { ChainType } from "@lifi/widget";

export const REGISTRY = {
  chains: {
    ETH: 1,
    HYPEREVM: 999,
    SOL: 1151111081099710,
    BTC: 20000000000001,
  },

  tokens: {
    ETC: {
      POLYGON: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      OPTIMISM: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    },
    SOL: {
      POLYGON:
      

    },
    BTC: {
  },
} as const;


export type ChainKey = keyof typeof REGISTRY.chains;
export type ChainId = (typeof REGISTRY.chains)[ChainKey];
export type TokenSymbol = keyof typeof REGISTRY.tokens;
