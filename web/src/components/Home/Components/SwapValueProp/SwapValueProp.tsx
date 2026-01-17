import { FeatureBox } from "@components/FeatureGrid/FeatureBox";
import { FeatureGrid } from "@components/FeatureGrid/FeatureGrid";
import { useNavigate } from "react-router-dom";
import Button from "@components/Button/Button";
import s from "./SwapValueProp.module.css";
import { MdOutlineArrowOutward } from "react-icons/md";

function BridgeButton() {
  const swapLabel = "Bridge Now";
  const navigate = useNavigate();
  return (
    <Button
      color="var(--accent-green)"
      bgColor="var(--bg-dark)"
      onClick={() => navigate("/bridge")}
      label={swapLabel}
      icon={<MdOutlineArrowOutward />}
    />
  );
}

export default function SwapValueProp() {
  const heading = "Transparent Cross-Chain Swaps";
  const subheading =
    "Our bridging portal displays the best routes to both swap and bridge at once - and we update you at every step along the way.";

  return (
    <div style={{ alignSelf: "start", width: "100%" }}>
      <section>
        <FeatureGrid layout={["1fr", "1fr"]}>
          {/**/}
          <FeatureGrid direction="vertical" layout={["3fr", "1fr"]}>
            <FeatureBox title={heading} description={subheading}></FeatureBox>
            <div className={s.buttonContainer}>
              <BridgeButton />
            </div>
          </FeatureGrid>
          {/**/}
          <div className={s.wrapper}>
            <img src="/valueprop.png" />
          </div>
          {/**/}
        </FeatureGrid>
      </section>
    </div>
  );
}
