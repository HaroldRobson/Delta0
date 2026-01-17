import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { chainWhitelist } from "@constants/chains";
import {
  getTokens,
  ChainType,
  ChainId,
  type Token,
  getTokenBalances,
  type BaseToken,
} from "@lifi/sdk";

import { useActiveAccount } from "thirdweb/react";

export default function useGetUserTokensQuery() {
  const account = useActiveAccount();

  const { data: availableTokens } = useQuery({
    queryKey: ["tokens"],
    queryFn: async () => {
      const response = await getTokens({
        chainTypes: [ChainType.EVM, ChainType.SVM, ChainType.MVM],
      });
      const tokensByChain: Partial<Record<ChainId, Token[]>> = {};
      for (const chainId of chainWhitelist) {
        tokensByChain[chainId] = response.tokens[chainId] ?? [];
      }
      return tokensByChain;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: userBalances = [] } = useQuery({
    queryKey: ["balances", account?.address],
    queryFn: async () => {
      const promises = chainWhitelist
        .filter((chainId) => availableTokens?.[chainId]?.length)
        .map((chainId) =>
          getTokenBalances(account!.address, availableTokens![chainId]!).catch(
            () => [],
          ),
        );
      return (await Promise.all(promises)).flat();
    },
    enabled: !!account && !!availableTokens,
    staleTime: 60 * 1000, // Cache for 1 minute
  });

  const widgetTokenConfig = useMemo<Array<BaseToken>>(() => {
    return userBalances
      .filter((t) => t.amount && t.amount > 0)
      .map((t) => ({ address: t.address, chainId: t.chainId }));
  }, [userBalances]);

  return { availableTokens, widgetTokenConfig };
}
