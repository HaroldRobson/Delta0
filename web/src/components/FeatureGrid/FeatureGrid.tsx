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
  /**
   * Direction of the grid layout.
   * - "horizontal": items arranged in columns (default)
   * - "vertical": items stacked in rows
   */
  direction?: "horizontal" | "vertical";
  /**
   * Hide the horizontal and vertical divider lines.
   */
  hideLines?: boolean;
};

export function FeatureGrid({
  children,
  layout,
  direction = "horizontal",
  hideLines = false,
}: FeatureGridProps) {
  const childArray = Children.toArray(children);
  const isVertical = direction === "vertical";

  let gridTemplate: string;
  if (Array.isArray(layout)) {
    gridTemplate = layout.join(" ");
  } else {
    const count = layout ?? childArray.length;
    gridTemplate = `repeat(${count}, 1fr)`;
  }

  const gridStyle = isVertical
    ? { gridTemplateRows: gridTemplate }
    : { gridTemplateColumns: gridTemplate };

  return (
    <div className={s.gridWrapper} data-direction={direction} data-hide-lines={hideLines || undefined}>
      <div className={s.grid} style={gridStyle}>
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
