import GetStarted from "../GetStarted/GetStarted";
import s from "./CallToAction.module.css";

export default function CallToAction() {
  const heading = "Ready to earn?";
  const subheading =
    "Join the hedging revolution and start earning Delta0 yield now.";
  return (
    <div className={s.wrapper}>
      <p className={s.heading}>{heading}</p>
      <p className={s.subheading}>{subheading}</p>
      <GetStarted />
    </div>
  );
}
