import s from "./CurrentYield.module.css";

type YieldData = {
  apy: number;
  dailyYield: number;
  weeklyYield: number;
  monthlyYield: number;
  tvl: string;
  hedgeRatio: number;
  lastUpdate: string;
};

type Props = {
  data?: YieldData;
  isLoading?: boolean;
};

const mockData: YieldData = {
  apy: 8.42,
  dailyYield: 0.023,
  weeklyYield: 0.161,
  monthlyYield: 0.702,
  tvl: "$4.2M",
  hedgeRatio: 98.5,
  lastUpdate: "2 mins ago",
};

export default function CurrentYield({ data = mockData, isLoading = false }: Props) {
  return (
    <section className={s.card}>
      <div className={s.header}>
        <h2 className={s.title}>Current Yield</h2>
        <span className={s.badge}>Delta Neutral</span>
      </div>

      <div className={s.apySection}>
        <div className={s.apyLabel}>Annual Percentage Yield</div>
        <div className={s.apyValue}>
          {isLoading ? (
            <span className={s.skeleton} />
          ) : (
            <>
              <span className={s.apyNumber}>{data.apy.toFixed(2)}</span>
              <span className={s.apyPercent}>%</span>
            </>
          )}
        </div>
      </div>

      <div className={s.metricsGrid}>
        <MetricCard
          label="Daily"
          value={`+${data.dailyYield.toFixed(3)}%`}
          isLoading={isLoading}
        />
        <MetricCard
          label="Weekly"
          value={`+${data.weeklyYield.toFixed(3)}%`}
          isLoading={isLoading}
        />
        <MetricCard
          label="Monthly"
          value={`+${data.monthlyYield.toFixed(3)}%`}
          isLoading={isLoading}
        />
      </div>

      <div className={s.divider} />

      <div className={s.statsRow}>
        <div className={s.stat}>
          <span className={s.statLabel}>TVL</span>
          <span className={s.statValue}>{isLoading ? "—" : data.tvl}</span>
        </div>
        <div className={s.stat}>
          <span className={s.statLabel}>Hedge Ratio</span>
          <span className={s.statValue}>
            {isLoading ? "—" : `${data.hedgeRatio}%`}
          </span>
        </div>
        <div className={s.stat}>
          <span className={s.statLabel}>Updated</span>
          <span className={s.statValue}>{isLoading ? "—" : data.lastUpdate}</span>
        </div>
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
