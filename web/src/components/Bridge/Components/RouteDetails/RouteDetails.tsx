import type { RouteInfo } from "../../types";
import s from "./RouteDetails.module.css";

interface RouteDetailsProps {
  route?: RouteInfo;
}

export default function RouteDetails({ route }: RouteDetailsProps) {
  if (!route) {
    return (
      <div className={s.routeContainer}>
        <h3 className={s.routeTitle}>Route Details</h3>
        <p className={s.routeEmpty}>
          Route details will appear once you get a quote.
        </p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
      return remainingSeconds > 0
        ? `${minutes}m ${remainingSeconds}s`
        : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className={s.routeContainer}>
      <h3 className={s.routeTitle}>Route Details</h3>

      <div className={s.routeGrid}>
        <div className={s.routeItem}>
          <span className={s.routeLabel}>From</span>
          <span className={s.routeValue}>
            {route.fromAmount} {route.fromToken}
          </span>
          <span className={s.routeChain}>{route.fromChain}</span>
        </div>

        <div className={s.routeArrow}>&darr;</div>

        <div className={s.routeItem}>
          <span className={s.routeLabel}>To</span>
          <span className={s.routeValue}>
            {route.toAmount} {route.toToken}
          </span>
          <span className={s.routeChain}>{route.toChain}</span>
        </div>
      </div>

      <div className={s.routeStats}>
        <div className={s.routeStat}>
          <span className={s.routeStatLabel}>Estimated Time</span>
          <span className={s.routeStatValue}>
            {formatTime(route.estimatedTime)}
          </span>
        </div>
        <div className={s.routeStat}>
          <span className={s.routeStatLabel}>Gas Cost</span>
          <span className={s.routeStatValue}>
            ${parseFloat(route.gasCostUSD).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
