import { useRef, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { LiFiWidget, ChainType, type FormState } from "@lifi/widget";
import { INTEGRATOR } from "../../../../constants/hyperbridge";
import widgetConfig from "../../../../config/hyperbridge";
import useGetUserTokensQuery from "../../../../hooks/useGetUserTokensQuery";

export default function HyperBridgeWidget() {
  // Docs: https://docs.li.fi/widget/configuration/form-management
  const formRef = useRef<FormState | null>(null);
  const { widgetTokenConfig } = useGetUserTokensQuery();
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
  }, [account]);

  return (
    <LiFiWidget
      integrator={INTEGRATOR}
      config={{
        ...widgetConfig,
        tokens: {
          to: { allow: widgetTokenConfig },
          from: { allow: widgetTokenConfig },
        },
      }}
      formRef={formRef}
    />
  );
}
