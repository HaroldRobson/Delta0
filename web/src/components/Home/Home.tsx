import s from "./Home.module.css";
import GetStarted from "./Components/GetStarted/GetStarted";
import WhySection from "./Components/WhySection/WhySection";
import HowItWorks from "./Components/HowItWorks/HowItWorks";
import CallToAction from "./Components/CallToAction/CallToAction";
import DAppDisplay from "./Components/DAppDisplay/DAppDisplay";
function HomeCopy() {
  const title = "Delta0";
  const tagline =
    "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur";
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
      <CallToAction />
    </div>
  );
}
