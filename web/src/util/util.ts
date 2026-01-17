import { getBalance } from "@wagmi/core";
import { formatEther } from "viem";
import { config } from "../config/wagmi";
import { ChainId } from "@lifi/widget";
import { TestnetChainId } from "@constants/chains";
const magic = 1096;

export async function calculateYield({
  address,
  fundingRate,
  totalLiquidity,
}: {
  address: string;
  fundingRate: number;
  totalLiquidity: number;
}) {
  const addressEthBal = await getBalance(config, {
    address: `0x${address}`,
  });
  const ethValue = Number(formatEther(addressEthBal.value));
  const result = (fundingRate * ethValue) / totalLiquidity;
  return result * magic;
}

export function getChainNameFromId(chainId: ChainId | TestnetChainId): string {
  const chainIdNameMapping: Partial<Record<ChainId | TestnetChainId, string>> =
    {
      [ChainId.ETH]: "Ethereum",
      [ChainId.POL]: "Polygon",
      [ChainId.BSC]: "BNB Chain",
      [ChainId.ARB]: "Arbitrum",
      [ChainId.OPT]: "Optimism",
      [ChainId.BAS]: "Base",
      [ChainId.AVA]: "Avalanche",
      [ChainId.LNA]: "Linea",
      [ChainId.ERA]: "zkSync Era",
      [ChainId.SCL]: "Scroll",
      [ChainId.BLS]: "Blast",
      [ChainId.MNT]: "Mantle",
      [ChainId.DAI]: "Gnosis",
      [ChainId.HYP]: "HyperEVM",
      [ChainId.SOL]: "Solana",
      [ChainId.BTC]: "Bitcoin",
      [ChainId.SUI]: "Sui",
      [TestnetChainId.HYPE_T]: "Hyperliquid EVM Testnet",
      [TestnetChainId.SEP]: "Sepolia ETH Testnet",
    };
  return chainIdNameMapping[chainId] || `Chain ${chainId}`;
}
