import { FeatureBox } from "../../../FeatureGrid/FeatureBox";
import { FeatureGrid } from "../../../FeatureGrid/FeatureGrid";
import s from "./HowItWorks.module.css";

export default function HowItWorks() {
  return (
    <section>
      <FeatureGrid layout={["2fr", "1fr"]}>
        <FeatureBox
          title="wehfwieohf"
          rootClassNames={s.rootClassNameOverride}
        />
      </FeatureGrid>
    </section>
  );
}
