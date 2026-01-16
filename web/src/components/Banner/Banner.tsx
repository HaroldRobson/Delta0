import { useEffect, useState } from "react";
import Button from "../../Button/Button";
import s from "./banner.module.css";

function ConnectButton() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {}, []);
  const connectWallet = () => {
    if (connected) {
      return;
    }
    setConnected(true);
  };

  return (
    <div className={s.connectBtn}>
      <Button onClick={connectWallet} label={"Connect"} size={"M"} rounded />
    </div>
  );
}

export default function Banner() {
  return (
    <nav className={s.banner}>
      <p>banner elem 1</p>
      <p>Banner elem 2</p>
      <ConnectButton />
    </nav>
  );
}
