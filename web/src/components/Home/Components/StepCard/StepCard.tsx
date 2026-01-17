import s from "./StepCard.module.css";

export type StepCardProps = {
  step: number;
  image: string;
  title: string;
  description: string;
};

export default function StepCard({
  step,
  image,
  title,
  description,
}: StepCardProps) {
  const gradient =
    "linear-gradient(to top, var(--bg-dark) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)";

  return (
    <div className={s.cardWrapper}>
      <div className={s.card}>
        <div
          className={s.bgImage}
          style={{ backgroundImage: `url(${image})` }}
        />
        <div
          className={s.imageOverlayGradient}
          style={{ background: gradient }}
        />
        <div className={s.stepBadge}>{step}</div>
        <div className={s.container}>
          <h3 className={s.title}>{title}</h3>
          <p className={s.description}>{description}</p>
        </div>
      </div>
    </div>
  );
}
