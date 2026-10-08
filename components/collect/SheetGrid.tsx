"use client";

import { addrOf, numToCol } from "@/lib/collect/engine";
import type { Grid } from "@/lib/collect/types";
import styles from "./collect.module.css";

type Props = {
  grid: Grid;
  /** 칸 주소 -> 표시 종류 */
  marks?: Record<string, "picked" | "out" | "sel">;
  onPick?: (r: number, c: number) => void;
};

export default function SheetGrid({ grid, marks = {}, onPick }: Props) {
  // 병합된 칸 처리: 왼쪽 위 칸만 그리고 나머지는 건너뜀
  const head = new Map<string, { rs: number; cs: number }>();
  const skip = new Set<string>();
  for (const g of grid.merges) {
    head.set(`${g.r1},${g.c1}`, { rs: g.r2 - g.r1 + 1, cs: g.c2 - g.c1 + 1 });
    for (let r = g.r1; r <= g.r2; r++)
      for (let c = g.c1; c <= g.c2; c++) if (r !== g.r1 || c !== g.c1) skip.add(`${r},${c}`);
  }

  return (
    <div className={styles.gridWrap}>
      <table className={styles.grid}>
        <thead>
          <tr>
            <th className={styles.corner} />
            {Array.from({ length: grid.cols }, (_, i) => (
              <th key={i}>{numToCol(i + 1)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: grid.rows }, (_, ri) => {
            const r = ri + 1;
            return (
              <tr key={r}>
                <th>{r}</th>
                {Array.from({ length: grid.cols }, (_, ci) => {
                  const c = ci + 1;
                  const k = `${r},${c}`;
                  if (skip.has(k)) return null;
                  const span = head.get(k);
                  const mark = marks[addrOf(r, c)];
                  const cls = [
                    styles.cell,
                    onPick ? styles.pickable : "",
                    grid.formula[ri][ci] ? styles.formula : "",
                    mark ? styles[mark] : "",
                  ].join(" ");
                  return (
                    <td
                      key={k}
                      className={cls}
                      rowSpan={span?.rs}
                      colSpan={span?.cs}
                      onClick={onPick ? () => onPick(r, c) : undefined}
                      title={addrOf(r, c)}
                    >
                      {grid.cells[ri][ci]}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
