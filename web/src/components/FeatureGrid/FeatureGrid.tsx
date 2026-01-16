import type { ReactNode } from "react";
import { Children } from "react";
import s from "./FeatureGrid.module.css";

type FeatureGridProps = {
  children: ReactNode;
  /**
   * Define column layout. Can be:
   * - number: equal columns (e.g., 4 = four equal columns)
   * - string[]: custom fractions (e.g., ["2fr", "1fr"] for 2/3 + 1/3)
   * - undefined: auto-detect from children count (equal widths)
   */
  layout?: number | string[];
};

export function FeatureGrid({ children, layout }: FeatureGridProps) {
  const childArray = Children.toArray(children);

  let gridTemplateColumns: string;
  if (Array.isArray(layout)) {
    gridTemplateColumns = layout.join(" ");
  } else {
    const columnCount = layout ?? childArray.length;
    gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
  }

  return (
    <div className={s.gridWrapper}>
      <div className={s.grid} style={{ gridTemplateColumns }}>
        {childArray.map((child, index) => (
          <div
            key={index}
            className={s.gridItem}
            data-last={index === childArray.length - 1 ? "true" : undefined}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
