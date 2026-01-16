import type { ReactNode } from "react";
import classNames from "classnames";
import s from "./Button.module.css";

type Props = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  glow?: boolean;
  color?: string;
  bgColor?: string;
  disabled?: boolean;
};

export default function Button({
  label,
  onClick,
  icon,
  glow = false,
  color,
  bgColor,
  disabled = false,
}: Props) {
  return (
    <button
      className={classNames(s.button, { [s.glow]: glow })}
      style={{
        color: color,
        backgroundColor: bgColor,
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
      {icon}
    </button>
  );
}
