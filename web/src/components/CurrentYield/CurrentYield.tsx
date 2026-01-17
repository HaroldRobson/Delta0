import { useEffect, useState } from "react";
import s from "./CurrentYield.module.css";
import { HttpTransport } from "@nktkas/hyperliquid";
import { fundingHistory } from "@nktkas/hyperliquid/api/info";

type Asset = "BTC" | "ETH" | "SOL" | "AAVE" | "XMR";

type YieldData = {
  apy: number;
  dailyYield: number;
  weeklyYield: number;
  monthlyYield: number;
  tvl: string;
  hedgeRatio: number;

  fundingRate: number;
  fundingTimeMs: number | null;
};

type Props = {
  refreshMs?: number;
  isLoading?: boolean;
};

const ASSETS: Asset[] = ["BTC", "ETH", "SOL", "AAVE", "XMR"];

const transport = new HttpTransport();

const BASE: Record<Asset, YieldData> = {
  BTC: {
    apy: 5.12,
    dailyYield: 0.014,
    weeklyYield: 0.098,
    monthlyYield: 0.412,
    tvl: "$6.8M",
    hedgeRatio: 99.1,
    fundingRate: 0,
    fundingTimeMs: null,
  },
  ETH: {
    apy: 7.86,
    dailyYield: 0.021,
    weeklyYield: 0.148,
    monthlyYield: 0.643,
    tvl: "$12.4M",
    hedgeRatio: 98.7,
    fundingRate: 0,
    fundingTimeMs: null,
  },
  SOL: {
    apy: 10.34,
    dailyYield: 0.028,
    weeklyYield: 0.195,
    monthlyYield: 0.821,
    tvl: "$3.1M",
    hedgeRatio: 97.9,
    fundingRate: 0,
    fundingTimeMs: null,
  },
  AAVE: {
    apy: 6.42,
    dailyYield: 0.018,
    weeklyYield: 0.126,
    monthlyYield: 0.541,
    tvl: "$1.9M",
    hedgeRatio: 98.2,
    fundingRate: 0,
    fundingTimeMs: null,
  },
  XMR: {
    apy: 4.88,
    dailyYield: 0.013,
    weeklyYield: 0.091,
    monthlyYield: 0.395,
    tvl: "$1.1M",
    hedgeRatio: 97.6,
    fundingRate: 0,
    fundingTimeMs: null,
  },
};

function formatAgo(diffMs: number) {
  const s = Math.max(0, Math.floor(diffMs / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function CurrentYield({ refreshMs = 10_000, isLoading: extLoading = false }: Props) {
  const [dataByAsset, setDataByAsset] = useState<Record<Asset, YieldData>>(BASE);
  const [isPolling, setIsPolling] = useState(false);
  const isLoading = extLoading || isPolling;

  useEffect(() => {
    let cancelled = false;

    async function refreshFunding() {
      setIsPolling(true);
      try {
        const endTime = Date.now();
        const startTime = endTime - 1000 * 60 * 60 * 24 * 7;

        const results = await Promise.all(
          ASSETS.map(async (coin) => {
            const rows = await fundingHistory({ transport }, { coin, startTime, endTime });

            let latestTime = -Infinity;
            let latestRate: number | null = null;

            for (const r of rows) {
              const rateNum = Number(r.fundingRate);
              if (!Number.isFinite(rateNum)) continue;
              if (r.time > latestTime) {
                latestTime = r.time;
                latestRate = rateNum;
              }
            }

            return [coin, latestRate, latestTime > 0 ? latestTime : null] as const;
          })
        );

        if (cancelled) return;

        setDataByAsset((prev) => {
          const next: Record<Asset, YieldData> = { ...prev };
          for (const [coin, rate, timeMs] of results) {
            if (rate == null) continue;
            next[coin] = {
              ...next[coin],
              fundingRate: rate,
              fundingTimeMs: timeMs,
            };
          }
          return next;
        });
      } catch (e) {
        console.error("fundingHistory fetch failed:", e);
      } finally {
        if (!cancelled) setIsPolling(false);
      }
    }

    refreshFunding();
    const id = window.setInterval(refreshFunding, refreshMs);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [refreshMs]);

  return (
    <section className={s.card}>
      <div className={s.header}>
        <h2 className={s.title}>Current Yield</h2>
        <span className={s.badge}>Delta Neutral</span>
      </div>

      <div className={s.assetsGrid}>
        {ASSETS.map((asset) => {
          const d = dataByAsset[asset];

          const funding1hPct = d.fundingRate * 100;
          const funding8hPct = funding1hPct * 8;
          const funding1dPct = funding1hPct * 24;
          const funding1wPct = funding1dPct * 7;
          const funding1mPct = funding1dPct * 30;
          const funding1yPct = funding1mPct * 12;

          const updated =
            d.fundingTimeMs == null ? "—" : formatAgo(Date.now() - d.fundingTimeMs);

          return (
            <div key={asset} className={s.assetCard}>
              <div className={s.assetHeader}>
                <span className={s.assetBadge}>{asset}</span>
                <span className={s.assetUpdatedRight}>
                  {isLoading ? "—" : updated}
                </span>
              </div>

              <div className={s.assetApyRow}>
                <span className={s.apyLabel}>Funding (8h)</span>
                <span className={s.apyValue}>
                  {isLoading ? (
                    <span className={s.skeletonSm} />
                  ) : (
                    <>
                      <span className={s.apyNumber}>
                        {funding8hPct >= 0 ? "+" : ""}
                        {funding8hPct.toFixed(4)}
                      </span>
                      <span className={s.apyPercent}>%</span>
                      <span style={{ marginLeft: 10, opacity: 0.7, fontSize: 12 }}>
                        (1h: {funding1hPct >= 0 ? "+" : ""}
                        {funding1hPct.toFixed(5)}%)
                      </span>
                    </>
                  )}
                </span>
                <div className={s.metricsGrid}>
                  <MetricCard
                    label="Daily"
                    value={`+${funding1dPct.toFixed(3)}%`}
                    isLoading={isLoading}
                  />
                  <MetricCard
                    label="Weekly"
                    value={`+${funding1wPct.toFixed(3)}%`}
                    isLoading={isLoading}
                  />
                  <MetricCard
                    label="Monthly"
                    value={`+${funding1mPct.toFixed(3)}%`}
                    isLoading={isLoading}
                  />
                </div>
              </div>

              <div className={s.statsRow}>
                <Stat label="TVL" value={d.tvl} isLoading={isLoading} />
                <Stat label="Hedge" value={`${d.hedgeRatio}%`} isLoading={isLoading} />
                <Stat label="APY" value={`${funding1yPct.toFixed(2)}%`} isLoading={isLoading} />
              </div>

              <div className={s.divider} />
            </div>
          );
        })}
      </div>

      <div className={s.strategyInfo}>
        <p className={s.strategyText}>
          Yield is generated through delta-neutral hedging strategies, minimizing
          directional exposure while capturing funding rates and basis spreads.
        </p>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: string;
  isLoading: boolean;
}) {
  return (
    <div className={s.metricCard}>
      <span className={s.metricLabel}>{label}</span>
      <span className={s.metricValue}>
        {isLoading ? <span className={s.skeletonSm} /> : value}
      </span>
    </div>
  );
}

function Stat({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: string;
  isLoading: boolean;
}) {
  return (
    <div className={s.stat}>
      <span className={s.statLabel}>{label}</span>
      <span className={s.statValue}>{isLoading ? "—" : value}</span>
    </div>
  );
}
