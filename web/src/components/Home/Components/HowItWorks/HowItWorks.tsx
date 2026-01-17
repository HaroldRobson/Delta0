import s from "./HowItWorks.module.css";

const stepImage = "/stepplaceholder.png";

type Step = {
  step: number;
  title: string;
  description: string;
};

export default function HowItWorks() {
  const steps: Step[] = [
    {
      step: 1,
      title: "Connect your wallet",
      description: "Click get started to connect a wallet of your choice in seconds.",
    },
    {
      step: 2,
      title: "Deposit your crypto",
      description: "Choose an asset and deposit into your vault.",
    },
    {
      step: 3,
      title: "Earn",
      description: "Relax. We'll take care of the rest.",
    },
  ];

  return (
    <section className={s.section}>
      <div className={s.bgGlow} />

      <div className={s.header}>
        <h2 className={s.title}>How it works?</h2>
        <p className={s.subtitle}>
          Turn any coin into a stable coin in 3 clicks; embedded throughout the
          Hyperliquid ecosystem.
        </p>
      </div>

      <div className={s.timeline}>
        <div className={s.line} />
        <div className={s.cards}>
          {steps.map((x) => (
            <article key={x.step} className={s.card}>
              <div className={s.cardInner}>
                <div className={s.iconStage}>
                  <div
                    className={[
                      s.iconWrap,
                      x.step === 2 ? s.ring1 : "",
                      x.step === 3 ? s.ring2 : "",
                    ].join(" ")}
                  >
                    <div className={s.iconCircle}>
                      <img className={s.iconImg} src={stepImage} alt="" />
                    </div>
                  </div>
                </div>

                <div className={s.meta}>
                  <div className={s.cardTitle}>{x.title}</div>
                  <p className={s.desc}>{x.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
