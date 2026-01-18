import { getContract } from "thirdweb";
import client from "../util/client";
import { hyperEVM, hyperEVMTestnet } from "../config/chains";

// TODO: Replace this placeholder ABI with the actual ABI from Foundry output.
// After running `forge build`, copy the "abi" array from:
//   out/YourContract.sol/YourContract.json
// Ensure you keep `as const` at the end for TypeScript type inference.
//
export type ContractSymbol = "ETH";

export const VAULT_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "Name", type: "string", internalType: "string" },
      { name: "Ticker", type: "string", internalType: "string" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "ACCOUNT_MARGIN_SUMMARY_PRECOMPILE_ADDRESS",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "BBO_PRECOMPILE_ADDRESS",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "Owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "POSITION_PRECOMPILE_ADDRESS",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "RouterAddress",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "Token",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IERC20" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "accountMarginSummary",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Delta0_ETH.AccountMarginSummary",
        components: [
          { name: "accountValue", type: "int64", internalType: "int64" },
          { name: "marginUsed", type: "uint64", internalType: "uint64" },
          { name: "ntlPos", type: "uint64", internalType: "uint64" },
          { name: "rawUsd", type: "int64", internalType: "int64" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address", internalType: "address" },
      { name: "spender", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "amountLongOnHyperEVM",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "amountShortOnHyperCore",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "coreValueUSDC",
    inputs: [],
    outputs: [{ name: "", type: "uint64", internalType: "uint64" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deposit",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getTokenBalance",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "name",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nextRebalanceisA",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "position",
    inputs: [
      { name: "user", type: "address", internalType: "address" },
      { name: "perp", type: "uint16", internalType: "uint16" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Delta0_ETH.Position",
        components: [
          { name: "szi", type: "int64", internalType: "int64" },
          { name: "entryNtl", type: "uint64", internalType: "uint64" },
          { name: "isolatedRawUsd", type: "int64", internalType: "int64" },
          { name: "leverage", type: "uint32", internalType: "uint32" },
          { name: "isIsolated", type: "bool", internalType: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rebalance",
    inputs: [
      { name: "leverageNumerator", type: "uint256", internalType: "uint256" },
      { name: "leverageDenominator", type: "uint256", internalType: "uint256" },
    ],
    outputs: [
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "", type: "bool", internalType: "bool" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "sendToHyperCore",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "shouldIncreaseCollateral",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "symbol",
    inputs: [],
    outputs: [{ name: "", type: "string", internalType: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "takeFromHyperCore",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalUSDCValueStoredInToken",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalUSDCValueUnderManagement",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "transfer",
    inputs: [
      { name: "to", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "transferFrom",
    inputs: [
      { name: "from", type: "address", internalType: "address" },
      { name: "to", type: "address", internalType: "address" },
      { name: "value", type: "uint256", internalType: "uint256" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "valueLockedByUser",
    inputs: [{ name: "user", type: "address", internalType: "address" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "valueOfTokenUsdc",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdrawalMultiplier",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "yieldMultiplier",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "Approval",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "spender",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true, internalType: "address" },
      { name: "to", type: "address", indexed: true, internalType: "address" },
      {
        name: "value",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  { type: "error", name: "CoreWriterLib__CannotSelfTransfer", inputs: [] },
  {
    type: "error",
    name: "CoreWriterLib__CoreAmountTooLarge",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
  },
  {
    type: "error",
    name: "CoreWriterLib__EvmAmountTooSmall",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
  },
  { type: "error", name: "CoreWriterLib__HypeTransferFailed", inputs: [] },
  {
    type: "error",
    name: "ERC20InsufficientAllowance",
    inputs: [
      { name: "spender", type: "address", internalType: "address" },
      { name: "allowance", type: "uint256", internalType: "uint256" },
      { name: "needed", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "ERC20InsufficientBalance",
    inputs: [
      { name: "sender", type: "address", internalType: "address" },
      { name: "balance", type: "uint256", internalType: "uint256" },
      { name: "needed", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "ERC20InvalidApprover",
    inputs: [{ name: "approver", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "ERC20InvalidReceiver",
    inputs: [{ name: "receiver", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "ERC20InvalidSender",
    inputs: [{ name: "sender", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "ERC20InvalidSpender",
    inputs: [{ name: "spender", type: "address", internalType: "address" }],
  },
  {
    type: "error",
    name: "HLConversions__InvalidToken",
    inputs: [{ name: "token", type: "uint64", internalType: "uint64" }],
  },
  {
    type: "error",
    name: "PrecompileLib__AccountMarginSummaryPrecompileFailed",
    inputs: [],
  },
  { type: "error", name: "PrecompileLib__MarkPxPrecompileFailed", inputs: [] },
  {
    type: "error",
    name: "PrecompileLib__PerpAssetInfoPrecompileFailed",
    inputs: [],
  },
  {
    type: "error",
    name: "PrecompileLib__PositionPrecompileFailed",
    inputs: [],
  },
  {
    type: "error",
    name: "PrecompileLib__SpotBalancePrecompileFailed",
    inputs: [],
  },
  {
    type: "error",
    name: "PrecompileLib__TokenInfoPrecompileFailed",
    inputs: [],
  },
  {
    type: "error",
    name: "SafeCastOverflowedUintDowncast",
    inputs: [
      { name: "bits", type: "uint8", internalType: "uint8" },
      { name: "value", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "SafeERC20FailedOperation",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
  },
] as const;

// TODO: Replace these placeholder addresses with actual deployed contract addresses.
// After deploying via Foundry (`forge create` or `forge script`), paste the addresses here.
export const VAULT_ADDRESSES: Record<
  number,
  Record<ContractSymbol, `0x${string}`>
> = {
  // smart contract address
  [hyperEVM.id]: {
    ["ETH"]: "0x20A34185e9eD4f1D1be2B00874A3dB51BFfE63Aa",
  },
  // TODO: Set testnet address after deploying to HyperEVM testnet (chain ID 998)
  [hyperEVMTestnet.id]: {
    ["ETH"]: "0x3D1C434D77754bF4324541B685C60cEff8C97A64",
  },
};

export function getVaultContract(chainId: number, symbol: ContractSymbol) {
  const chain = chainId === hyperEVMTestnet.id ? hyperEVMTestnet : hyperEVM;
  const address = VAULT_ADDRESSES[chainId][symbol];
  console.log(`using ${chain} ${address}`);

  if (!address) {
    throw new Error(`No vault address configured for chain ${chainId}`);
  }

  return getContract({
    client,
    chain,
    address,
    abi: VAULT_ABI,
  });
}
