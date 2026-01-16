import { useState } from "react";
import VaultBalances from "./components/VaultBalances/VaultBalances";
import CurrentYield from "./components/CurrentYield/CurrentYield";
import s from "./Trade.module.css";

export default function Trade() {
  const [isLoading, setIsLoading] = useState(false);

  //example tokens data
  const tokens = [
    {
      symbol: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      amount: "1,234.56",
    },
    {
      symbol: "ETH",
      address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
      amount: "0.4200",
    },
  ] as const;

  function refresh() {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  }

  return (
    <div className={s.container}>
      <h1 className={s.title}>Trade</h1>

      <div className={s.buttonRow}>
        <button className={s.primaryBtn}>Deposit</button>
        <button className={s.secondaryBtn}>Withdraw</button>
      </div>

      <div className={s.grid}>
        <div className={s.left}>
          <CurrentYield isLoading={isLoading} />
        </div>

        <div className={s.right}>
          <VaultBalances
            isLoading={isLoading}
            tokens={[...tokens]}
            onRefresh={refresh}
          />
        </div>
      </div>
    </div>
  );
}
