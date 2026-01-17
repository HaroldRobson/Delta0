import { useRef, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { LiFiWidget, ChainType, type FormState } from "@lifi/widget";
import { INTEGRATOR, HYPER_EVM } from "../../../../constants/hyperbridge";
import widgetConfig from "../../../../config/hyperbridge";

export default function HyperBridgeWidget() {
  // Docs: https://docs.li.fi/widget/configuration/form-management
  const formRef = useRef<FormState | null>(null);
  const account = useActiveAccount();

  useEffect(() => {
    if (!account) {
      return;
    }
    // Auto-set destination address to connected wallet
    formRef.current?.setFieldValue(
      "toAddress",
      { address: account.address, chainType: ChainType.EVM },
      { setUrlSearchParam: true },
    );

    // Lock destination chain to HyperEVM
    formRef.current?.setFieldValue("toChain", HYPER_EVM.chainId, {
      setUrlSearchParam: true,
    });
  }, [account]);

  return (
    <LiFiWidget
      integrator={INTEGRATOR}
      config={widgetConfig}
      formRef={formRef}
    />
  );
}
