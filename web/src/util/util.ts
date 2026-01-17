import { getBalance } from "@wagmi/core";
import { config } from "@/web/src/config/wagmi";
import { formatEther } from "viem";

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
