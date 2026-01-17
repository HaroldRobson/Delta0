import { getBalance } from "@wagmi/core";
import { formatEther } from "viem";
import { config } from "../config/wagmi";

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

export function getChainName(chainId: number): string {
  const chainNames: Record<number, string> = {
    1: "Ethereum",
    10: "Optimism",
    56: "BNB Chain",
    137: "Polygon",
    42161: "Arbitrum",
    43114: "Avalanche",
    999: "HyperEVM",
    1151111081099710: "Solana",
  };
  return chainNames[chainId] || `Chain ${chainId}`;
}
