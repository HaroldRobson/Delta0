import { useEffect, useMemo, useState } from "react";
import { chainWhitelist } from "@constants/chains";
import {
  getTokens,
  ChainType,
  ChainId,
  type Token,
  type TokenAmount,
  getTokenBalances,
  type BaseToken,
} from "@lifi/sdk";
import { useActiveAccount } from "thirdweb/react";
import { getChainNameFromId } from "@util/util";

export default function useGetUserTokens() {
  const [availableTokens, setAvailableTokens] =
    useState<Partial<Record<ChainId, Token[]>>>();
  const [userBalances, setUserBalances] = useState<TokenAmount[]>([]);
  const account = useActiveAccount();

  // Fetch all available tokens by chain
  useEffect(() => {
    const fetchTokens = async () => {
      const response = await getTokens({
        chainTypes: [ChainType.EVM, ChainType.SVM, ChainType.MVM],
      });
      const tokensByChain: Partial<Record<ChainId, Token[]>> = {};
      for (const chainId of chainWhitelist) {
        tokensByChain[chainId] = response.tokens[chainId] ?? [];
      }
      setAvailableTokens(tokensByChain);
    };
    void fetchTokens();
  }, []);

  // Fetch user balances once we have tokens and account
  // Mighty need to manually add bitcoing since it isn't showing anything
  useEffect(() => {
    if (!account || !availableTokens) {
      return;
    }
    const controller = new AbortController();
    const fetchUserBalances = async () => {
      const balancePromises = chainWhitelist
        .filter((chainId) => availableTokens[chainId]?.length)
        .map((chainId) =>
          getTokenBalances(account.address, availableTokens[chainId]!).catch(
            (err) => {
              console.warn(`Failed: ${getChainNameFromId(chainId)}`, err);
              return [];
            },
          ),
        );
      const result = await Promise.all(balancePromises);
      if (!controller.signal.aborted) {
        setUserBalances(result.flat());
      }
    };
    void fetchUserBalances();
  }, [account, availableTokens]);

  const widgetTokenConfig = useMemo<Array<BaseToken>>(() => {
    return userBalances
      .filter((t) => t.amount && t.amount > 0)
      .map((t) => ({ address: t.address, chainId: t.chainId }));
  }, [userBalances]);

  return { availableTokens, widgetTokenConfig };
}
