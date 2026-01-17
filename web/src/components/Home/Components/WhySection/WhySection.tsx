import s from "./WhySection.module.css";
import { FeatureGrid } from "../../../FeatureGrid/FeatureGrid";
import {
  type FeatureBoxProps,
  FeatureBox,
} from "../../../FeatureGrid/FeatureBox";
import {
  MdShield,
  MdSpeed,
  MdShowChart,
  MdAccountBalance,
} from "react-icons/md";

export default function WhySection() {
  const featureBoxes: Array<FeatureBoxProps> = [
    {
      icon: <MdShield />,
      title: "Delta Neutral",
      description:
        "Your position is fully hedged, eliminating directional market risk while generating consistent yield.",
    },
    {
      icon: <MdSpeed />,
      title: "Real-Time Hedging",
      description:
        "Automated rebalancing ensures your position stays neutral as market conditions change.",
    },
    {
      icon: <MdShowChart />,
      title: "Transparent Yields",
      description:
        "All yield sources are on-chain and verifiable. No hidden fees or opaque strategies.",
    },
    {
      icon: <MdAccountBalance />,
      title: "Institutional Grade",
      description:
        "Battle-tested smart contracts with comprehensive audits and proven security measures.",
    },
  ];

  return (
    <section className={s.whySection}>
      <h2 className={s.whyTitle}>Why Delta0?</h2>
      <p className={s.whySubtitle}>
        Stable yields through delta-neutral hedging strategies
      </p>
      <FeatureGrid layout={featureBoxes.length}>
        {featureBoxes.map((box, idx) => (
          <FeatureBox
            key={idx}
            icon={box.icon}
            title={box.title}
            description={box.description}
          />
        ))}
      </FeatureGrid>
    </section>
  );
}
