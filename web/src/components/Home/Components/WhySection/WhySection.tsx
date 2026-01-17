import s from "./WhySection.module.css";
import { FeatureGrid } from "@components/FeatureGrid/FeatureGrid";
import {
  type FeatureBoxProps,
  FeatureBox,
} from "@components/FeatureGrid/FeatureBox";
import { MdSecurity, MdSavings, MdVerified, MdSwapHoriz } from "react-icons/md";

export default function WhySection() {
  const featureBoxes: Array<FeatureBoxProps> = [
    {
      icon: <MdSecurity />,
      title: "Delta-neutral",
      description:
        "Positions are automatically hedged in real time to maintain delta neutrality and control market risk.",
    },
    {
      icon: <MdSavings />,
      title: "Yield Generation",
      description: "Consistent yield generation on current balances.",
    },
    {
      icon: <MdVerified />,
      title: "Fully On-chain",
      description:
        "All executions, hedging and yield generation run transparently on-chain and verifiable supported by HyperCore and HyperEVM. No hidden fees or opaque strategies.",
    },
    {
      icon: <MdSwapHoriz />,
      title: "One-click Cross-chain Swaps",
      description:
        "Bridge from any chain and token into your chosen HyperEVM asset in one seamless flow.",
    },
  ];

  return (
    <section className={s.section}>
      <div className={s.bgGlow} />

      <div className={s.header}>
        <h2 className={s.title}>Why Delta0?</h2>
        <p className={s.subtitle}>
          Stable yields through delta-neutral hedging strategies
        </p>
      </div>

      <FeatureGrid layout={featureBoxes.length} hideLines>
        {featureBoxes.map((box, idx) => (
          <div key={idx} className={s.card}>
            <FeatureBox
              icon={box.icon}
              title={box.title}
              description={box.description}
            />
          </div>
        ))}
      </FeatureGrid>
    </section>
  );
}
