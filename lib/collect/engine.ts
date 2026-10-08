// 엑셀 취합 엔진 (AI 없음, 규칙 기반). 브라우저 안에서만 돌아가요.
import type { Cell, Workbook, Worksheet } from "exceljs";
import {
  LEVELS,
  type Analyzed,
  type Grid,
  type Issue,
  type Item,
  type Level,
  type OutCell,
  type OutSource,
  type Parsed,
  type Project,
  type School,
  type StatusRow,
} from "./types";

export async function loadExcelJS() {
  const m = await import("exceljs");
  return (m.default ?? m) as typeof import("exceljs");
}

export async function readWorkbook(buf: ArrayBuffer): Promise<Workbook> {
  const ExcelJS = await loadExcelJS();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  return wb;
}

// ---------- 글자·값 도우미 ----------
export const norm = (s: unknown) =>
  String(s ?? "")
    .replace(/\s+/g, "")
    .replace(/[()（）]/g, "");

/* eslint-disable @typescript-eslint/no-explicit-any */
/** 셀 값을 단순 값으로. 수식은 계산 결과, 결과가 없으면 undefined */
export function prim(v: any): any {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v;
  if (typeof v === "object") {
    if (v.error) return { error: v.error };
    if ("formula" in v || "sharedFormula" in v)
      return "result" in v ? prim(v.result) : undefined;
    if (v.richText) return v.richText.map((t: any) => t.text).join("");
    if ("text" in v) return v.text;
    return null;
  }
  return v;
}

const text = (cell: Cell): string => {
  const v = prim(cell.value);
  return typeof v === "string" ? v : "";
};

const R_ = (c: Cell) => Number(c.row);
const C_ = (c: Cell) => Number(c.col);

const isSlave = (cell: Cell) =>
  cell.isMerged && cell.master && cell.master.address !== cell.address;

// ---------- 병합 칸 ----------
type Range = { r1: number; c1: number; r2: number; c2: number };

function colToNum(s: string) {
  let n = 0;
  for (const ch of s) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}
export function numToCol(n: number) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
export const addrOf = (r: number, c: number) => `${numToCol(c)}${r}`;
export function parseAddr(a: string) {
  const m = /^([A-Z]+)(\d+)$/.exec(a);
  return m ? { r: Number(m[2]), c: colToNum(m[1]) } : null;
}

export function mergeRanges(ws: Worksheet): Range[] {
  const list: string[] = (ws.model as any).merges ?? [];
  const out: Range[] = [];
  for (const m of list) {
    const p = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(m);
    if (p)
      out.push({
        c1: colToNum(p[1]),
        r1: Number(p[2]),
        c2: colToNum(p[3]),
        r2: Number(p[4]),
      });
  }
  return out;
}

/** 이름 칸 바로 오른쪽 칸 (이름 칸이 병합돼 있으면 병합 끝 다음 칸) */
function rightOf(ws: Worksheet, cell: Cell): Cell {
  const rg = mergeRanges(ws).find(
    (g) => R_(cell) >= g.r1 && R_(cell) <= g.r2 && C_(cell) >= g.c1 && C_(cell) <= g.c2,
  );
  return ws.getCell(R_(cell), (rg ? rg.c2 : C_(cell)) + 1);
}

// ---------- 화면용 표 ----------
export function toGrid(ws: Worksheet, maxRows = 80, maxCols = 26): Grid {
  const rows = Math.min(Math.max(ws.rowCount, 1), maxRows);
  const cols = Math.min(Math.max(ws.columnCount, 1), maxCols);
  const cells: string[][] = [];
  const formula: boolean[][] = [];
  for (let r = 1; r <= rows; r++) {
    const rowCells: string[] = [];
    const rowF: boolean[] = [];
    for (let c = 1; c <= cols; c++) {
      const cell = ws.getCell(r, c);
      const raw: any = cell.value;
      const isF = !!raw && typeof raw === "object" && ("formula" in raw || "sharedFormula" in raw);
      const v = prim(raw);
      let t = "";
      if (v instanceof Date) t = v.toISOString().slice(0, 10);
      else if (v && typeof v === "object" && "error" in v) t = String(v.error);
      else if (v === undefined) t = "(수식)";
      else if (v !== null) t = String(v);
      rowCells.push(t);
      rowF.push(isF);
    }
    cells.push(rowCells);
    formula.push(rowF);
  }
  const merges = mergeRanges(ws)
    .filter((g) => g.r1 <= rows && g.c1 <= cols)
    .map((g) => ({ ...g, r2: Math.min(g.r2, rows), c2: Math.min(g.c2, cols) }));
  return { rows, cols, cells, formula, merges };
}

// ---------- 항목 등록 ----------
let seq = 0;
export const newId = (p: string) => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

/** 같은 줄 왼쪽에서 가장 가까운 글자 칸 */
function nearestLeft(ws: Worksheet, r: number, c: number): string {
  for (let x = c - 1; x >= 1; x--) {
    const t = text(ws.getCell(r, x)).trim();
    if (t) return t;
  }
  return "";
}
/** 같은 열 위쪽에서 가장 가까운 글자 칸 */
function nearestUp(ws: Worksheet, r: number, c: number, stopAtBlank = false): string {
  for (let y = r - 1; y >= 1; y--) {
    // 표와 표 사이의 빈 줄을 넘어가지 않기
    if (stopAtBlank && !ws.getRow(y).hasValues) return "";
    const t = text(ws.getCell(y, c)).trim();
    if (t) return t;
  }
  return "";
}

/** 칸을 눌렀을 때 항목으로 바꾸기 */
export function deriveItem(
  ws: Worksheet,
  r: number,
  c: number,
  mode: "table" | "pair",
): { item?: Item; error?: string } {
  // 병합 칸이면 왼쪽 위 칸 기준
  const rg = mergeRanges(ws).find((g) => r >= g.r1 && r <= g.r2 && c >= g.c1 && c <= g.c2);
  if (rg) {
    r = rg.r1;
    c = rg.c1;
  }
  const addr = addrOf(r, c);
  if (mode === "pair") {
    const label = nearestLeft(ws, r, c);
    if (!label) return { error: "왼쪽에 이름 칸이 없어요. 이름 바로 옆 칸을 눌러 주세요." };
    return {
      item: { id: newId("i"), name: label, kind: "pair", label, role: "value", sheet: ws.name, addr },
    };
  }
  const rowLabel = nearestLeft(ws, r, c);
  const colLabel = nearestUp(ws, r, c);
  if (!rowLabel || !colLabel)
    return { error: "표 안의 칸이 아니에요. 왼쪽에 행 이름, 위쪽에 열 이름이 있는 칸을 눌러 주세요." };
  return {
    item: {
      id: newId("i"),
      name: `${rowLabel} · ${colLabel}`,
      kind: "table",
      rowLabel,
      colLabel,
      role: "value",
      sheet: ws.name,
      addr,
    },
  };
}

// ---------- 학교 파일에서 항목 찾기 ----------
type Found = { cell: Cell } | { missing: true } | { many: Cell[] };

function sheetsFor(wb: Workbook, name: string): Worksheet[] {
  const first = wb.worksheets.filter((s) => s.name === name);
  return [...first, ...wb.worksheets.filter((s) => s.name !== name)];
}

function cellsWithText(ws: Worksheet, want: string): Cell[] {
  const w = norm(want);
  const out: Cell[] = [];
  ws.eachRow({ includeEmpty: false }, (row) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      if (isSlave(cell)) return;
      const t = text(cell);
      if (t && norm(t) === w) out.push(cell);
    });
  });
  return out;
}

function findInSheet(ws: Worksheet, item: Item): Found {
  if (item.kind === "pair") {
    const hits = cellsWithText(ws, item.label ?? "");
    if (!hits.length) return { missing: true };
    return { cell: rightOf(ws, hits[0]) };
  }
  const heads = cellsWithText(ws, item.colLabel ?? "");
  const rows = cellsWithText(ws, item.rowLabel ?? "");
  if (!heads.length || !rows.length) return { missing: true };
  // 행 이름 칸마다, 바로 위에서 가장 가까운 열 이름 칸을 짝지음
  const pairs: { head: Cell; row: Cell }[] = [];
  for (const rc of rows) {
    let best: Cell | null = null;
    for (const h of heads) {
      if (R_(h) >= R_(rc) || C_(h) <= C_(rc)) continue;
      if (!best || R_(h) > R_(best)) best = h;
    }
    if (best) pairs.push({ head: best, row: rc });
  }
  if (!pairs.length) return { missing: true };
  // 가장 가까운 짝 하나. 서로 다른 칸이 여러 개면 알려 줌
  pairs.sort((a, b) => R_(a.row) - R_(a.head) - (R_(b.row) - R_(b.head)));
  const cells = pairs.map((p) => ws.getCell(R_(p.row), C_(p.head)));
  const uniq = new Set(cells.map((c) => c.address));
  if (uniq.size > 1) {
    const vals = new Set(cells.map((c) => JSON.stringify(prim(c.value))));
    if (vals.size > 1) return { many: cells };
  }
  return { cell: cells[0] };
}

function find(wb: Workbook, item: Item): Found {
  let many: Found | null = null;
  for (const ws of sheetsFor(wb, item.sheet)) {
    const f = findInSheet(ws, item);
    if ("cell" in f) return f;
    if ("many" in f && !many) many = f;
  }
  return many ?? { missing: true };
}

type Bag = Record<"blank" | "nocalc" | "neg" | "frac" | "textnum" | "bad", string[]>;

function readNum(raw: any, where: string, bag: Bag): number {
  if (raw === null || raw === "") {
    bag.blank.push(where);
    return 0;
  }
  if (raw === undefined) {
    bag.nocalc.push(where);
    return 0;
  }
  if (typeof raw === "number") {
    if (!Number.isFinite(raw) || raw < 0) {
      bag.neg.push(`${where}(${raw})`);
      return 0;
    }
    if (!Number.isInteger(raw)) {
      bag.frac.push(`${where}(${raw})`);
      return 0;
    }
    return raw;
  }
  if (typeof raw === "string") {
    const t = raw.trim();
    if (/^\d+$/.test(t)) {
      bag.textnum.push(where);
      return Number(t);
    }
    bag.bad.push(`${where}('${t}')`);
    return 0;
  }
  bag.bad.push(`${where}(${JSON.stringify(raw)})`);
  return 0;
}

/** 학교 파일 하나 읽기 */
export function parseCollected(
  wb: Workbook,
  items: Item[],
  meta: { file: string; mtime: number },
): Parsed {
  const res: Parsed = {
    key: meta.file,
    file: meta.file,
    mtime: meta.mtime,
    declared: null,
    declaredLevel: null,
    values: {},
    issues: [],
    ok: false,
  };
  const err = (m: string) => res.issues.push({ level: "error", msg: m });
  const warn = (m: string) => res.issues.push({ level: "warn", msg: m });
  const bag: Bag = { blank: [], nocalc: [], neg: [], frac: [], textnum: [], bad: [] };
  const missing: string[] = [];
  const many: string[] = [];

  for (const it of items) {
    const f = find(wb, it);
    if ("missing" in f) {
      if (it.role === "value") missing.push(it.name);
      else if (it.role === "school") err("양식 인식 실패: 학교명 칸을 찾지 못함");
      continue;
    }
    if ("many" in f) {
      many.push(it.name);
      continue;
    }
    const v = prim(f.cell.value);
    if (it.role === "school") {
      res.declared = String(v ?? "").trim();
    } else if (it.role === "level") {
      res.declaredLevel = String(v ?? "").trim();
    } else {
      res.values[it.id] = readNum(v, it.name, bag);
    }
  }

  if (missing.length) err("양식 인식 실패: 항목을 찾지 못함 - " + missing.join(", "));
  if (many.length)
    err("같은 이름의 칸이 여러 곳에 있고 값이 달라 정할 수 없음 - " + many.join(", "));
  if (bag.bad.length) err("숫자가 아닌 값: " + bag.bad.join(", "));
  if (bag.neg.length) err("음수 값: " + bag.neg.join(", "));
  if (bag.frac.length) err("소수 값: " + bag.frac.join(", "));
  if (bag.nocalc.length)
    warn("수식 결과가 저장되어 있지 않아 0으로 계산: " + bag.nocalc.join(", "));
  if (bag.blank.length) warn(`빈칸 ${bag.blank.length}곳을 0으로 계산: ` + bag.blank.join(", "));
  if (bag.textnum.length) warn("문자로 입력된 숫자를 변환: " + bag.textnum.join(", "));

  // 합계 검산: 같은 열 이름의 표 항목을 더해, 파일에 적힌 '합계' 줄과 비교
  if (!res.issues.some((i) => i.level === "error")) {
    const byCol = new Map<string, Item[]>();
    for (const it of items)
      if (it.kind === "table" && it.role === "value" && it.colLabel)
        byCol.set(it.colLabel, [...(byCol.get(it.colLabel) ?? []), it]);
    for (const [colLabel, list] of byCol) {
      if (list.length < 2) continue;
      for (const totalName of ["합계", "계", "총계"]) {
        if (list.some((it) => norm(it.rowLabel) === norm(totalName))) continue;
        const probe: Item = { ...list[0], id: "_t", rowLabel: totalName, colLabel };
        const f = find(wb, probe);
        if (!("cell" in f)) continue;
        const typed = prim(f.cell.value);
        if (typeof typed === "number") {
          const sum = list.reduce((a, it) => a + (res.values[it.id] ?? 0), 0);
          if (typed !== sum)
            warn(`합계 불일치(${colLabel}): 파일에 적힌 값 ${typed} / 직접 계산 ${sum} → 계산값 사용`);
        }
        break;
      }
    }
  }
  res.ok = true; // 파일을 열어 읽는 데까지는 성공
  return res;
}

// ---------- 학교 연결 ----------
type SchoolKey = School & { full: string; core: string; short: string };

function keyed(schools: School[]): SchoolKey[] {
  return schools.map((s) => {
    const full = norm(s.name);
    const core = full.replace(/(초등학교|중학교|고등학교|통합학교|통합반|학교)$/, "");
    const short = core + (s.level === "통합" ? "통합" : s.level[0]);
    return { ...s, full, core, short };
  });
}

type Match = { school?: SchoolKey; loose?: boolean; ambiguous?: SchoolKey[] };

function matchName(t: string, ks: SchoolKey[]): Match {
  const x = norm(t);
  if (!x) return {};
  const exact = ks.filter((s) => s.full === x || s.short === x);
  if (exact.length === 1) return { school: exact[0] };
  const core = ks.filter((s) => s.core === x);
  if (core.length === 1) return { school: core[0], loose: true };
  if (core.length > 1) return { ambiguous: core };
  return {};
}

function matchFileName(file: string, ks: SchoolKey[]): Match {
  const stem = norm(file.replace(/\.[^.]+$/, ""));
  const hits = ks.filter((s) => stem.includes(s.full) || stem.includes(s.short));
  if (hits.length === 1) return { school: hits[0] };
  if (hits.length > 1) return { ambiguous: hits };
  return {};
}

export function guessLevel(name: string): Level {
  if (/초등|초$/.test(name)) return "초등";
  if (/고등|고$/.test(name)) return "고등";
  if (/중학|중$/.test(name)) return "중등";
  return "통합";
}

// ---------- 전체 분석 ----------
export type Analysis = {
  files: Analyzed[];
  status: StatusRow[];
  targetSchools: School[];
};

export function analyze(
  parsed: Parsed[],
  project: Pick<Project, "schools" | "targetLevels">,
  assign: Record<string, string>,
  excluded: Set<string>,
): Analysis {
  const ks = keyed(project.schools);
  const levels = project.targetLevels;

  const files: Analyzed[] = parsed.map((p) => {
    const a: Analyzed = {
      ...p,
      school: null,
      matchBy: null,
      cands: [],
      allIssues: [...p.issues],
      status: "정상",
      included: false,
    };
    const pick = (s: SchoolKey, by: string) => {
      a.school = { name: s.name, level: s.level };
      a.matchBy = by;
    };
    if (assign[p.key]) {
      const s = ks.find((x) => x.name === assign[p.key]);
      if (s) pick(s, "직접 지정");
      else a.allIssues.push({ level: "error", msg: `직접 지정한 학교를 목록에서 찾지 못함: ${assign[p.key]}` });
    }
    if (!a.school && p.declared !== null && p.declared !== "") {
      const m = matchName(p.declared, ks);
      if (m.school) pick(m.school, m.loose ? "파일 안 학교명(약칭)" : "파일 안 학교명");
      else if (m.ambiguous) a.cands.push(...m.ambiguous.map((s) => s.name));
    }
    if (!a.school) {
      const m = matchFileName(p.file, ks);
      if (m.school) pick(m.school, "파일 이름");
      else if (m.ambiguous) a.cands.push(...m.ambiguous.map((s) => s.name));
    }
    if (!a.school) {
      if (p.ok)
        a.allIssues.push({
          level: "error",
          msg: a.cands.length
            ? `학교를 하나로 정할 수 없음 (입력 '${p.declared}', 후보: ${[...new Set(a.cands)].join(" / ")}) → 직접 지정 필요`
            : `학교 목록에 없음 (입력 '${p.declared ?? ""}')`,
        });
    } else {
      if (p.declaredLevel && p.declaredLevel !== a.school.level)
        a.allIssues.push({
          level: "warn",
          msg: `파일의 학교급(${p.declaredLevel})이 목록(${a.school.level})과 다름 → 목록 기준 사용`,
        });
      if (a.matchBy === "파일 안 학교명(약칭)")
        a.allIssues.push({
          level: "warn",
          msg: `학교명을 줄여서 입력('${p.declared}') → ${a.school.name}으로 연결`,
        });
    }
    return a;
  });

  const skip = (a: Analyzed) => !!a.school && !levels.includes(a.school.level);
  const dup = new Set<string>();
  const bySchool: Record<string, Analyzed[]> = {};
  for (const a of files)
    if (a.school && !skip(a) && !excluded.has(a.key)) (bySchool[a.school.name] ||= []).push(a);
  for (const arr of Object.values(bySchool)) {
    if (arr.length < 2) continue;
    arr.sort((x, y) => y.mtime - x.mtime);
    arr[0].allIssues.push({
      level: "warn",
      msg: `같은 학교 파일이 ${arr.length}개 → 가장 최근 파일 사용 (제외: ${arr
        .slice(1)
        .map((x) => x.file)
        .join(", ")})`,
    });
    arr.slice(1).forEach((x) => dup.add(x.key));
  }

  for (const a of files) {
    const hasErr = a.allIssues.some((i) => i.level === "error");
    const hasWarn = a.allIssues.some((i) => i.level === "warn");
    a.status = skip(a)
      ? "대상 아님"
      : dup.has(a.key)
        ? "중복(제외)"
        : hasErr
          ? "오류"
          : hasWarn
            ? "경고"
            : "정상";
    a.included = !skip(a) && !dup.has(a.key) && !excluded.has(a.key) && !hasErr && a.ok;
  }

  const targetSchools = project.schools.filter((s) => levels.includes(s.level));
  const status: StatusRow[] = targetSchools.map((s) => {
    const mine = files.filter((a) => a.school?.name === s.name && !dup.has(a.key));
    const used = mine[0];
    if (!used) {
      const hint = files.filter((a) => !a.school && a.cands.includes(s.name)).map((a) => a.file);
      return {
        school: s.name,
        level: s.level,
        state: "미제출",
        file: "",
        memo: hint.length ? `연결 안 된 파일 있음: ${hint.join(", ")}` : "",
      };
    }
    return {
      school: s.name,
      level: s.level,
      state: excluded.has(used.key) ? "제외" : used.status,
      file: used.file,
      memo: used.allIssues.map((i) => i.msg).join(" / "),
    };
  });
  return { files, status, targetSchools };
}

// ---------- 집계 ----------
export function compute(src: OutSource, an: Analysis, project: Pick<Project, "targetLevels">, dateText: string): number | string {
  const inLevel = (lv: Level, want: "all" | Level) => want === "all" || lv === want;
  switch (src.type) {
    case "levels":
      return project.targetLevels.join(", ");
    case "date":
      return dateText;
    case "target":
      return an.targetSchools.filter((s) => inLevel(s.level, src.level)).length;
    case "submitted":
      return an.files.filter((a) => a.included && a.school && inLevel(a.school.level, src.level)).length;
    case "sum": {
      let t = 0;
      for (const a of an.files) {
        if (!a.included || !a.school || !inLevel(a.school.level, src.level)) continue;
        for (const id of src.itemIds) t += a.values[id] ?? 0;
      }
      return t;
    }
  }
}

/** 제출 양식에 값을 채워 파일로 */
export async function fillTemplate(
  templateBuf: ArrayBuffer,
  outputs: OutCell[],
  an: Analysis,
  project: Pick<Project, "targetLevels">,
  dateText: string,
): Promise<{ blob: Blob; skipped: string[] }> {
  const wb = await readWorkbook(templateBuf);
  const skipped: string[] = [];
  for (const o of outputs) {
    const ws = wb.getWorksheet(o.sheet) ?? wb.worksheets[0];
    const src = o.src;
    // 이번 대상이 아닌 학교급 줄은 비워 둠
    if ("level" in src && src.level !== "all" && !project.targetLevels.includes(src.level)) continue;
    const p = parseAddr(o.addr);
    if (!p) {
      skipped.push(o.addr);
      continue;
    }
    ws.getCell(p.r, p.c).value = compute(src, an, project, dateText);
  }
  wb.calcProperties.fullCalcOnLoad = true; // 열 때 합계 수식을 다시 계산
  const buf = await wb.xlsx.writeBuffer();
  return {
    blob: new Blob([buf as ArrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    skipped,
  };
}

/** 수합 현황 점검용 엑셀 */
export async function buildReport(an: Analysis): Promise<Blob> {
  const ExcelJS = await loadExcelJS();
  const rep = new ExcelJS.Workbook();
  const style = (ws: Worksheet) => {
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } };
    ws.views = [{ state: "frozen", ySplit: 1 }];
  };
  const w1 = rep.addWorksheet("제출현황");
  w1.columns = [
    { header: "학교", width: 18 },
    { header: "학교급", width: 8 },
    { header: "상태", width: 10 },
    { header: "사용 파일", width: 26 },
    { header: "메모", width: 90 },
  ];
  an.status.forEach((s) => w1.addRow([s.school, s.level, s.state, s.file, s.memo]));
  style(w1);
  const w2 = rep.addWorksheet("점검목록");
  w2.columns = [
    { header: "파일", width: 26 },
    { header: "연결된 학교", width: 18 },
    { header: "연결 방법", width: 18 },
    { header: "상태", width: 10 },
    { header: "수준", width: 8 },
    { header: "내용", width: 90 },
  ];
  for (const a of an.files) {
    if (!a.allIssues.length) w2.addRow([a.file, a.school?.name ?? "", a.matchBy ?? "", a.status, "", ""]);
    a.allIssues.forEach((i: Issue) =>
      w2.addRow([a.file, a.school?.name ?? "", a.matchBy ?? "", a.status, i.level === "error" ? "오류" : "경고", i.msg]),
    );
  }
  style(w2);
  const buf = await rep.xlsx.writeBuffer();
  return new Blob([buf as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

// ---------- 제출 양식 자동 제안 ----------
const levelOf = (t: string): Level | null => {
  const x = norm(t);
  return (LEVELS as readonly string[]).includes(x) ? (x as Level) : null;
};

export function suggestOutputs(ws: Worksheet, items: Item[]): OutCell[] {
  const out: OutCell[] = [];
  const merges = mergeRanges(ws);
  const covered = (r: number, c: number) =>
    merges.some((g) => r >= g.r1 && r <= g.r2 && c >= g.c1 && c <= g.c2 && !(r === g.r1 && c === g.c1));
  const values = items.filter((i) => i.role === "value");
  const rows = Math.min(ws.rowCount, 200);
  const cols = Math.min(ws.columnCount, 40);

  for (let r = 1; r <= rows; r++) {
    for (let c = 2; c <= cols; c++) {
      if (covered(r, c)) continue;
      const cell = ws.getCell(r, c);
      const raw: any = cell.value;
      const empty = raw === null || raw === undefined || raw === "";
      const num = typeof raw === "number";
      if (!empty && !num) continue;
      const addr = addrOf(r, c);
      const mk = (src: OutSource) => out.push({ addr, sheet: ws.name, src });

      // 이름 칸 바로 오른쪽 글자 칸: 대상 학교급 / 작성일
      const left = ws.getCell(r, c - 1);
      const lt = norm(text(left));
      if (lt && empty) {
        if (/수합대상|대상학교급|학교급/.test(lt) && !levelOf(lt)) { mk({ type: "levels" }); continue; }
        if (/작성일|제출일|날짜|일자/.test(lt)) { mk({ type: "date" }); continue; }
      }

      const R = nearestLeft(ws, r, c);
      const C = nearestUp(ws, r, c, true);
      if (!R || !C) continue;
      const lv = levelOf(R);
      const level: "all" | Level = lv ?? "all";
      const cn = norm(C);

      if (/대상/.test(cn) && /교|학교|수/.test(cn)) { mk({ type: "target", level }); continue; }
      if (/제출/.test(cn) && /교|학교|수/.test(cn)) { mk({ type: "submitted", level }); continue; }

      // 1) 이름 옆 칸 항목과 열 이름이 같을 때
      const pair = values.filter((i) => i.kind === "pair" && norm(i.name) === cn);
      if (pair.length) { mk({ type: "sum", itemIds: pair.map((i) => i.id), level }); continue; }

      // 2) 표 항목: 열 이름이 서로 포함될 때 (행 이름이 학교급이 아니면 행 이름도 같아야 함)
      const tbl = values.filter((i) => {
        if (i.kind !== "table") return false;
        const ic = norm(i.colLabel);
        const colOk = ic === cn || (cn.length >= 3 && ic.includes(cn)) || (ic.length >= 3 && cn.includes(ic));
        if (!colOk) return false;
        return lv ? true : norm(i.rowLabel) === norm(R);
      });
      if (tbl.length) { mk({ type: "sum", itemIds: tbl.map((i) => i.id), level }); continue; }
    }
  }
  return out;
}

export function describeSrc(src: OutSource, items: Item[]): string {
  const lv = (l: "all" | Level) => (l === "all" ? "전체" : l);
  switch (src.type) {
    case "levels":
      return "수합 대상 학교급";
    case "date":
      return "작성일";
    case "target":
      return `대상 학교 수 (${lv(src.level)})`;
    case "submitted":
      return `제출 학교 수 (${lv(src.level)})`;
    case "sum": {
      const picked = src.itemIds.map((id) => items.find((i) => i.id === id));
      const cols = new Set(picked.map((i) => i?.colLabel));
      if (picked.length > 2 && cols.size === 1 && picked[0]?.colLabel)
        return `${picked[0].colLabel} 합계 (${lv(src.level)})`;
      const names = src.itemIds.map((id) => items.find((i) => i.id === id)?.name ?? "(없는 항목)");
      const shown = names.length > 2 ? `${names[0]} 외 ${names.length - 1}개` : names.join(" + ");
      return `${shown} 합계 (${lv(src.level)})`;
    }
  }
}
