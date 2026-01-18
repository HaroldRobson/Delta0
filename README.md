# Delta0: Make any token a stablecoin!

Delta0 is a service that allows users to hedge any asset **entirely on chain**, making it **delta-neutral, instantly withdrawable, and yield-generating**. By utilizing Hyperliquid's HyperEVM and HyperCore infrastructure, Delta0 automates the management of long spot positions against short perpetual futures. It would be impossible to make on any other chain, but HyperCore + HyperEVM with CoreWriter facilitate derivatives purchasing, and so this "cash and carry" portfolio can exist entirely on blockchain. We've used Lifi's bridge to enable seamless transfers + trades from other chains to our protocol.

---
[D-App](https://www.delta0.xyz)<br>
[Slides (to explain how it works)](https://www.canva.com/design/DAG-vG2ugL0/fXzSz8sSBogkb4GwpLqmcw/edit)<br>
deployment address (HyperEVM LIVE NOT TESTNET!!!!!):<br>
0x20A34185e9eD4f1D1be2B00874A3dB51BFfE63Aa<br>

## Project Structure

* 
`backend/`: Off-chain logic for calculating optimal target leverage using Geometric Brownian Motion. Coming Soon.


* 
`delta0_contracts/`: Solidity smart contracts for HyperEVM, including the rebalancing logic and withdrawal curve logic. (Delta0_ETH.sol)


* 
`web/`: A React + Vite frontend for managing deposits, monitoring yields, and executing cross-chain swaps using LiFi.


* `lib/`: Shared dependencies and libraries.

---

## How It Works - deposit example

### 1. Instant Hedging

When a user deposits an asset (e.g., 1.0 BTC), the protocol keeps the majority on **HyperEVM** (e.g., 0.8 BTC) and bridges the remainder to **HyperCore**. This bridged portion is converted to USDC and used as collateral for a short perpetual contract, effectively neutralizing price exposure.

### 2. Yield Generation

Yield is primarily generated from the **funding rate**. As short holders, the contract collects premiums, which increases the Total USDC Value Under Management (AUM). This yield is reflected in the value of the issued ERC20 tokens, which appreciate relative to USDC over time.

### 3. Smart Rebalancing

Every EVM block, a `rebalance()` function is called. The protocol checks current spot and perp values and executes trades to maintain delta-neutrality based on a **Target Leverage** calculated off-chain, and passed in as a function parameter to rebalance().
this is in two stages - rebalanceA() which increases/decreases collateral, and changes short size. When rebalance() is called next, rebalanceB() executes, either bridging ETH back to HyperEVM (if increasing leverage), or transferring the class of previously bridged HyperCore USDC to be margin collateral (when de-leveraging).
### 4. Liquidity & Withdrawals

Users can withdraw their position at any time. To prevent "runs on the bank," Delta0 employs an **Anti-Run Withdrawal Curve**. If a withdrawal would dangerously deplete EVM liquidity, a "haircut" fee is applied to incentivize users to spread out withdrawals, and provide the protocol enough time to rebalance.

---

## Technical Features

* 
**Fully On-chain Execution**: Custody, trade logic, and execution are entirely decentralized.


* 
**One-Click Cross-Chain Swaps**: Integrated with **Li.Fi** to allow users to bridge and swap from any chain into a hedged position in a single step.


* 
**Stochastic Risk Management**: The off-chain backend optimizes target leverage to minimize liquidation probability using recent volatility () and drift () data.



---

## Development Summary

* **Total Build Time**: 48 Hours (Hyperliquid Hackathon).
* 
**Stack**: Solidity (Forge), React/Vite, Arch Linux, Neovim.


* 
**Smart Contracts**: ~800 lines of Solidity (No AI usage).


* 
**Frontend**: ~6000 lines of React (AI assisted).

