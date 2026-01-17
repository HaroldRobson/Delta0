import { useMemo, useState } from "react";
import { MdArrowDownward, MdArrowUpward, MdOutlineArrowOutward } from "react-icons/md";
import { useActiveWallet, useConnectModal } from "thirdweb/react";
import client from "../../util/client";

import VaultBalances from "../VaultBalances/VaultBalances";
import CurrentYield from "../CurrentYield/CurrentYield";
import ExchangeChart from "../ExchangeChart";
import Button from "../Button/Button";
import s from "./Account.module.css";

type VaultToken = {
  symbol: string;
  address: `0x${string}`;
  amount: number;
};

const TOKEN_CATALOG: Array<{ symbol: string; address: `0x${string}` }> = [
  { symbol: "SOL", address: "0x1111111111111111111111111111111111111111" },
  { symbol: "ETH", address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" },
  { symbol: "BTC", address: "0xBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" },
];

const formatAmount = (x: number) => x.toLocaleString(undefined, { maximumFractionDigits: 6 });

export default function Account() {
  const wallet = useActiveWallet();
  const { connect, isConnecting } = useConnectModal();

  const handleConnect = async () => {
    const w = await connect({ client });
    console.log("connected to", w);
  };

  if (!wallet) {
    return (
      <div className={s.container}>
        <div className={s.connectGate}>
          <h2 className={s.connectTitle}>Connect your wallet</h2>
          <p className={s.connectSub}>
            You’ll need to connect a crypto wallet before you can deposit, withdraw, or view your yields and balances.
          </p>

          <Button
            color="var(--bg-dark)"
            bgColor="var(--accent-green)"
            disabled={isConnecting}
            onClick={() => void handleConnect()}
            label={isConnecting ? "Connecting..." : "Connect Wallet"}
            icon={<MdOutlineArrowOutward />}
            glow
          />
        </div>
      </div>
    );
  }

  return <AccountAuthed />;
}

function AccountAuthed() {
  const [isLoading, setIsLoading] = useState(false);

  const [vaultHoldings, setVaultHoldings] = useState<VaultToken[]>([
    {
      symbol: "SOL (in USDC)",
      address: "0x1111111111111111111111111111111111111111",
      amount: 1234.56,
    },
    {
      symbol: "ETH (in USDC)",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      amount: 0.42,
    },
    {
      symbol: "BTC (in USDC)",
      address: "0xBbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      amount: 345.89,
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [selectedSymbol, setSelectedSymbol] = useState(TOKEN_CATALOG[0].symbol);
  const [amountStr, setAmountStr] = useState("0");

  const totalUsdcValue = useMemo(
    () => vaultHoldings.reduce((sum, t) => sum + t.amount, 0),
    [vaultHoldings],
  );

  const tokensForDisplay = useMemo(
    () =>
      vaultHoldings.map((t) => ({
        symbol: t.symbol,
        address: t.address,
        amount: formatAmount(t.amount),
      })),
    [vaultHoldings],
  );

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  const openModal = (nextMode: "deposit" | "withdraw") => {
    setMode(nextMode);
    setModalOpen(true);
    setAmountStr("0");
    setSelectedSymbol(TOKEN_CATALOG[0].symbol);
  };

  const handleDeposit = () => openModal("deposit");
  const handleWithdraw = () => openModal("withdraw");
  const handleCloseModal = () => setModalOpen(false);

  const handleApplyAction = () => {
    const amt = Number(amountStr);
    if (!Number.isFinite(amt) || amt <= 0) return;

    const tokenMeta = TOKEN_CATALOG.find((t) => t.symbol === selectedSymbol);
    if (!tokenMeta) return;

    setVaultHoldings((prev) => {
      const idx = prev.findIndex((x) => x.symbol === tokenMeta.symbol);
      const next = [...prev];

      if (mode === "deposit") {
        if (idx >= 0) {
          next[idx] = { ...next[idx], amount: next[idx].amount + amt };
        } else {
          next.push({ symbol: tokenMeta.symbol, address: tokenMeta.address, amount: amt });
        }
        return next;
      }

      if (idx < 0) return prev;

      const current = next[idx].amount;
      const newAmt = current - amt;

      if (newAmt > 0) {
        next[idx] = { ...next[idx], amount: newAmt };
        return next;
      }

      next.splice(idx, 1);
      return next;
    });

    handleCloseModal();
  };

  const handleSymbolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSymbol(e.target.value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountStr(e.target.value);
  };

  const modalTitle = mode === "deposit" ? "Deposit to Vault" : "Withdraw from Vault";
  const actionLabel = mode === "deposit" ? "Confirm Deposit" : "Confirm Withdraw";

  const depositLabel = "Deposit";
  const withdrawLabel = "Withdraw";
  const isAmountInvalid = !Number.isFinite(Number(amountStr)) || Number(amountStr) <= 0;

  return (
    <div className={s.container}>
      <div className={s.buttonRow}>
        <Button
          color="var(--bg-dark)"
          bgColor="var(--accent-green)"
          onClick={handleDeposit}
          label={depositLabel}
          icon={<MdArrowDownward />}
          glow
        />
        <Button
          color="var(--accent-green)"
          bgColor="var(--bg-dark)"
          onClick={handleWithdraw}
          label={withdrawLabel}
          icon={<MdArrowUpward />}
          glow
        />
      </div>

      <div className={s.grid}>
        <div className={s.left}>
          <CurrentYield isLoading={isLoading} />
        </div>

        <div className={s.right}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", minHeight: 0 }}>
            <VaultBalances
              isLoading={isLoading}
              tokens={tokensForDisplay}
              totalValue={totalUsdcValue}
              onRefresh={handleRefresh}
            />

            <div
              style={{
                width: "100%",
                minHeight: 520,
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(148,163,184,0.12)",
                background: "#06131c",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              }}
            >
              <ExchangeChart />
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className={s.modalBackdrop} onMouseDown={handleCloseModal}>
          <div className={s.modalCard} onMouseDown={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3 className={s.modalTitle}>{modalTitle}</h3>
              <button className={s.iconBtn} onClick={handleCloseModal} aria-label="Close">
                ✕
              </button>
            </div>

            <div className={s.formRow}>
              <label className={s.label}>Token</label>
              <select className={s.select} value={selectedSymbol} onChange={handleSymbolChange}>
                {TOKEN_CATALOG.map((t) => (
                  <option key={t.symbol} value={t.symbol}>
                    {t.symbol}
                  </option>
                ))}
              </select>
            </div>

            <div className={s.formRow}>
              <label className={s.label}>Amount</label>
              <input
                className={s.input}
                inputMode="decimal"
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0.0"
              />
            </div>

            <div className={s.modalActions}>
              <button className={s.ghostBtn} onClick={handleCloseModal}>
                Cancel
              </button>
              <button
                className={mode === "deposit" ? s.primaryBtn : s.secondaryBtn}
                onClick={handleApplyAction}
                disabled={isAmountInvalid}
              >
                {actionLabel}
              </button>
            </div>

            <div className={s.modalHint}>Mock mode: updates UI only (no smart contract hooked up yet).</div>
          </div>
        </div>
      )}
    </div>
  );
}
