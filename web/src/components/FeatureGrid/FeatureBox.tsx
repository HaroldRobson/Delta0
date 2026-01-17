import classNames from "classnames";
import s from "./FeatureBox.module.css";

export type FeatureBoxProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  rootClassNames?: string;
  titleClassNames?: string;
};

export function FeatureBox({
  icon,
  title,
  description,
  rootClassNames,
  titleClassNames,
}: FeatureBoxProps) {
  return (
    <div className={classNames(s.featureBox, rootClassNames)}>
      {icon && <div className={s.iconWrapper}>{icon}</div>}
      <h3 className={classNames(s.featureTitle, titleClassNames)}>{title}</h3>
      {description && <p className={s.featureDescription}>{description}</p>}
    </div>
  );
}
