import { FeatureBox } from "../../../FeatureGrid/FeatureBox";
import { FeatureGrid } from "../../../FeatureGrid/FeatureGrid";
import StepCard, { type StepCardProps } from "../StepCard/StepCard";
import s from "./HowItWorks.module.css";
import dogImage from "../../../../../public/smth.png";

export default function HowItWorks() {
  const steps: Array<StepCardProps> = [
    {
      step: 1,
      image: dogImage,
      title: "Connect your wallet",
      description: "Click get started to connect a wallet of your choice.",
    },
    {
      step: 2,
      image: dogImage,
      title: "Deposit your crypto",
      description: "Select a token of your choosing.",
    },
    {
      step: 3,
      image: dogImage,
      title: "Earn",
      description: "Relax. We'll take care of the rest.",
    },
  ];
  return (
    <div style={{ alignSelf: "start", width: "100%" }}>
      <section>
        <FeatureGrid layout={["2fr", "1fr"]}>
          <FeatureBox
            title="How It Works"
            description="Turn any coin into a stable coin in 3? clicks"
            rootClassNames={s.rootClassNameOverride}
          />
          <FeatureBox title="" rootClassNames={s.rootClassNameOverride} />
        </FeatureGrid>
        <FeatureGrid>
          {steps.map((step, i) => (
            <StepCard
              key={i}
              step={step.step}
              image={step.image}
              title={step.title}
              description={step.description}
            />
          ))}
        </FeatureGrid>
      </section>
    </div>
  );
}
