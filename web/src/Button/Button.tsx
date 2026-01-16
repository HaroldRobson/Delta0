import classNames from "classnames";
import s from "./Button.module.css";

type Props = {
  rounded?: boolean;
  size?: "S" | "M";
  onClick: () => void;
  label: string;
};

export default function Button({
  rounded = false,
  size = "M",
  onClick,
  label,
}: Props) {
  return (
    <button
      className={classNames(s.button, {
        [s.rounded]: rounded,
        [s.sm]: size === "S",
        [s.m]: size === "M",
      })}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
