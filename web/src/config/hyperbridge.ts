import { type WidgetConfig } from "@lifi/widget";
import { HYPER_EVM, INTEGRATOR } from "../constants/hyperbridge";

// Docs: https://docs.li.fi/widget/configure-widget
const widgetConfig: WidgetConfig = {
  integrator: INTEGRATOR,
  toChain: HYPER_EVM.chainId,
  chains: {
    deny: [], // Allow all chains as source
  },
  // Docs: https://docs.li.fi/widget/configuration/widget-configuration#hidden-ui
  // hiddenUI: ["toAddress"], // Hide toAddress since we auto-set it
  appearance: "dark",
  variant: "wide",
  // https://docs.li.fi/widget/select-widget-variants
  subvariant: "default",
  // Docs: https://docs.li.fi/widget/configure-widget/widget-configuration#theme
  theme: {
    palette: {
      primary: { main: "#00c853" },
      secondary: { main: "#7c3aed" },
    },
    container: {
      boxShadow: "none",
      borderRadius: "16px",
      // Remove default max height to allow full expansion
      maxHeight: "none",
      height: "auto",
    },
  },
};

export default widgetConfig;
