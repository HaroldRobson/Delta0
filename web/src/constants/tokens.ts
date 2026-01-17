import { ChainId } from "@lifi/widget";

type tickerAddressMap = Record<string, string>;

const TokenNameAdressMapping: Record<typeof ChainId.HYP, tickerAddressMap> = {
  [ChainId.HYP]: {
    UETH: "0xBe6727B535545C67d5cAa73dEa54865B92CF7907",
    UBTC: "0x9fdbda0a5e284c32744d2f17ee5c74b284993463",
    USOL: "0x068f321Fa8Fb9f0D135f290Ef6a3e2813e1c8A29",
    WHYPE: "0x5555555555555555555555555555555555555555",
  },
} as const;

export default TokenNameAdressMapping;
