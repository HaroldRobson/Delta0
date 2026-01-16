 import { useMemo } from "react";
import s from "./VaultBalances.module.css";

/**
 * Replace this with real data from:
 * - on-chain reads (wagmi readContract / multicall), OR
 * - your backend/indexer (recommended if you need prices, symbols, decimals, etc.)
 */
type VaultTokenBalance = {
  symbol: string;
  address: `0x${string}`;
  amount: string; 
};

type Props = {
  isLoading?: boolean;
  error?: string | null;
  tokens?: VaultTokenBalance[];
  onRefresh?: () => void;
};

export default function VaultBalances({
  isLoading = false,
  error = null,
  tokens = [],
  onRefresh,
}: Props) {
  const hasTokens = tokens.length > 0;

  const subtitle = useMemo(() => {
    if (isLoading) return "Loading balances…";
    if (error) return "Couldn’t load balances";
    if (!hasTokens) return "No tokens in vault yet";
    return "Your vault holdings";
  }, [isLoading, error, hasTokens]);

  return (
    <section className={s.card}>
      <div className={s.header}>
        <div>
          <h2 className={s.title}>Vault</h2>
          <p className={s.subtitle}>{subtitle}</p>
        </div>

        {onRefresh && (
          <button className={s.refreshBtn} onClick={onRefresh} disabled={isLoading}>
            Refresh
          </button>
        )}
      </div>

      {error && <div className={s.error}>{error}</div>}

      {!error && (
        <div className={s.list}>
          {isLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : hasTokens ? (
            tokens.map((t) => (
              <div key={t.address} className={s.row}>
                <div className={s.left}>
                  <div className={s.symbol}>{t.symbol}</div>
                  <div className={s.address}>
                    {t.address.slice(0, 6)}…{t.address.slice(-4)}
                  </div>
                </div>
                <div className={s.amount}>{t.amount}</div>
              </div>
            ))
          ) : (
            <div className={s.empty}>
              Deposit funds to see them here.
              <div className={s.emptyHint}>Tip: show a “Deposit” button next.</div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SkeletonRow() {
  return (
    <div className={s.row}>
      <div className={s.left}>
        <div className={s.skelLineLg} />
        <div className={s.skelLineSm} />
      </div>
      <div className={s.skelLineMd} />
    </div>
  );
}
