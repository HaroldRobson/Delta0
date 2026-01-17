import s from "./Home.module.css";
import GetStarted from "./Components/GetStarted/GetStarted";
import WhySection from "./Components/WhySection/WhySection";
import HowItWorks from "./Components/HowItWorks/HowItWorks";
import CallToAction from "./Components/CallToAction/CallToAction";
import DAppDisplay from "./Components/DAppDisplay/DAppDisplay";
import SwapValueProp from "./Components/SwapValueProp/SwapValueProp";

function HomeCopy() {
  const title = "Seamless DeFi, Simplified";
  const tagline = "Experience seamless, secure digital asset management.";
  return (
    <div className={s.copyWrapper}>
      <p className={s.title}>{title}</p>
      <p className={s.tagline}>{tagline}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className={s.homeWrapper}>
      <HomeCopy />
      <GetStarted />
      <DAppDisplay />
      <WhySection />
      <HowItWorks />
      <SwapValueProp />
      <CallToAction />
    </div>
  );
}
