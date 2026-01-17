import s from "./Home.module.css";
import GetStarted from "./Components/GetStarted/GetStarted";
import WhySection from "./Components/WhySection/WhySection";
import HowItWorks from "./Components/HowItWorks/HowItWorks";

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
      <WhySection />
      <HowItWorks />
    </div>
  );
}
