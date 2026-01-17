import { type WidgetConfig, ChainId, type BaseToken } from "@lifi/widget";
import { INTEGRATOR } from "../constants/hyperbridge";
//import { TestnetChainId } from "../constants/chains";
import TokenNameAddressMapping from "@constants/tokens";
import TokenNameAdressMapping from "@constants/tokens";
/*
 *
 * To chains:
 *  - HYPER_EVM (mainnet test net), usol, eth, ubtc,
 *  -
 * */

const tokenWhitelist: BaseToken[] = [
  {
    address: TokenNameAddressMapping[ChainId.HYP].UETH,
    chainId: ChainId.HYP,
  },
  {
    address: TokenNameAddressMapping[ChainId.HYP].USOL,
    chainId: ChainId.HYP,
  },
  {
    address: TokenNameAdressMapping[ChainId.HYP].UBTC,
    chainId: ChainId.HYP,
  },
  {
    address: TokenNameAdressMapping[ChainId.HYP].WHYPE,
    chainId: ChainId.HYP,
  },
];

// Docs: https://docs.li.fi/widget/configure-widget
const widgetConfig: WidgetConfig = {
  integrator: INTEGRATOR,
  toChain: ChainId.HYP,
  chains: {
    allow: [],
    deny: [],
  },
  tokens: {
    // allow to eth, btc, sol on HYP
    to: {
      allow: tokenWhitelist,
    },
    from: {
      allow: [...tokenWhitelist],
    },
  },
  // Docs: https://docs.li.fi/widget/configuration/widget-configuration#hidden-ui
  appearance: "dark",
  variant: "compact",
  // https://docs.li.fi/widget/select-widget-variants
  subvariant: "default",
  // Docs: https://docs.li.fi/widget/configure-widget/widget-configuration#theme
  theme: {
    palette: {
      primary: { main: "#78FFDC" },
      secondary: { main: "#0d1210" },
      background: {
        default: "#070b09",
        paper: "#0d1210",
      },
      text: {
        primary: "#fafafa",
        secondary: "#8a8d8b",
      },
    },
    typography: {
      fontFamily: "'Unbounded', system-ui, -apple-system, sans-serif",
    },
    container: {
      boxShadow: "none",
      borderRadius: "16px",
      maxHeight: "none",
      height: "auto",
    },
  },
};

export default widgetConfig;
