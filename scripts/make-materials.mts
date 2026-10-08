// 자료실 PDF 5종을 만들어 public/materials/ 에 저장해요.
// 사용: npx tsx scripts/make-materials.mts   (playwright와 크롬이 필요해요)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { EMOTIONS, faceSvg } from "../lib/emotions.ts";
import { FACES2, faceSvg2 } from "../lib/emotionFaces2.ts";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "playwright");
const OUT = path.resolve("public/materials");
const FONT = `"Noto Sans CJK KR","Noto Sans KR","Malgun Gothic",sans-serif`;
const BASE = `
@page{margin:0}*{box-sizing:border-box;margin:0;padding:0}
body{font-family:${FONT};color:#000;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:297mm;padding:10mm;page-break-after:always;overflow:hidden}
.page.land{width:297mm;height:210mm}
.page:last-child{page-break-after:auto}
h1{font-size:20pt;text-align:center;margin-bottom:5mm}
.line{display:inline-block;border-bottom:.3mm solid #000;height:7mm}
`;

const pages: Record<string, { html: string; landscape?: boolean }> = {};

// 1) 감정 카드 인쇄판 (4종 × 12장, 한 쪽에 12장)
{
  const sets: [string, (i: number) => string][] = [
    ["동그라미 얼굴", (i) => faceSvg(EMOTIONS[i])],
    ["남자 어린이", (i) => faceSvg2(FACES2[i], undefined, "boy")],
    ["여자 어린이", (i) => faceSvg2(FACES2[i], undefined, "girl")],
    ["고양이", (i) => faceSvg2(FACES2[i], undefined, "cat")],
  ];
  const css = `${BASE}
.grid{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:0;height:calc(297mm - 28mm)}
.card{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2mm;border:.3mm dashed #666;padding:3mm}
.card svg{width:38mm;height:38mm}
.card b{font-size:17pt}
.cap{font-size:9pt;text-align:center;margin-top:3mm;color:#444}`;
  const body = sets
    .map(
      ([name, f]) => `<div class="page"><h1 style="font-size:14pt;margin-bottom:2mm">감정 카드 · ${name}</h1><div class="grid">${EMOTIONS.map((e, i) => `<div class="card">${f(i)}<b>${e.name}</b></div>`).join("")}</div><p class="cap">점선을 따라 잘라서 써요. 코팅하면 오래 써요.</p></div>`,
    )
    .join("");
  pages["emotion-cards.pdf"] = { html: `<style>${css}</style>${body}` };
}

// 2) 선 긋기·가위질 연습지 (2쪽)
{
  const W = 190;
  const row = (y: number, d: string, dash = "") =>
    `<path d="${d}" fill="none" stroke="#000" stroke-width="0.7" ${dash ? `stroke-dasharray="${dash}"` : ""} transform="translate(0 ${y})"/>`;
  const dot = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#000"/>`;
  const wave = (x0: number, x1: number, a: number, step: number) => {
    let d = `M${x0} 0`;
    for (let x = x0; x < x1; x += step * 2) d += ` q${step / 2} ${-a} ${step} 0 t${step} 0`;

    return d;
  };
  const zig = (x0: number, x1: number, a: number, step: number) => {
    let d = `M${x0} 0`;
    let up = true;

    for (let x = x0; x < x1; x += step) {
      d += ` L${x + step} ${up ? -a : 0}`;
      up = !up;
    }

    return d;
  };
  const lineP = (title: string, items: string[]) =>
    `<div class="page"><h1>${title}</h1><div class="nm">이름 <span class="line" style="width:60mm"></span> 날짜 <span class="line" style="width:40mm"></span></div>${items.join("")}</div>`;
  const strip = (label: string, svg: string) =>
    `<div class="strip"><span class="lab">${label}</span><svg viewBox="0 0 ${W} 16" width="${W}mm" height="16mm">${svg}</svg></div>`;
  const css = `${BASE}.nm{margin:0 0 5mm;font-size:12pt}.strip{margin-bottom:4.5mm}.lab{display:block;font-size:10pt;font-weight:bold;margin-bottom:1mm}`;
  const lines = lineP("선 긋기 연습", [
    strip("1. 가로선", `${dot(5, 8)}${dot(185, 8)}${row(8, "M5 0H185", "3 2.5")}`),
    strip("2. 세로선 (점에서 점까지 위에서 아래로)", [20, 50, 80, 110, 140, 170].map((x) => `${dot(x, 1.5)}${dot(x, 14.5)}<path d="M${x} 1.5V14.5" stroke="#000" stroke-width=".7" stroke-dasharray="2 1.8"/>`).join("")),
    strip("3. 물결선", `${row(10, wave(5, 185, 5, 10), "3 2.5")}`),
    strip("4. 지그재그", `${row(13, zig(5, 185, 10, 10), "3 2.5")}`),
    strip("5. 산 모양", `${row(13, "M5 0 L20 -11 L35 0 L50 -11 L65 0 L80 -11 L95 0 L110 -11 L125 0 L140 -11 L155 0 L170 -11 L185 0", "3 2.5")}`),
    strip("6. 동그라미", [18, 45, 72, 99, 126, 153].map((x) => `<circle cx="${x + 10}" cy="8" r="7" fill="none" stroke="#000" stroke-width=".7" stroke-dasharray="2.4 2.2"/>`).join("")),
    strip("7. 네모", [14, 45, 76, 107, 138].map((x) => `<rect x="${x}" y="2" width="12" height="12" fill="none" stroke="#000" stroke-width=".7" stroke-dasharray="2.4 2.2"/>`).join("")),
    strip("8. 세모", [14, 45, 76, 107, 138].map((x) => `<path d="M${x + 6} 2 L${x + 12} 14 L${x} 14 Z" fill="none" stroke="#000" stroke-width=".7" stroke-dasharray="2.4 2.2"/>`).join("")),
    strip("9. 빈 줄 (혼자 그려 보기)", `<path d="M5 8H185" stroke="#bbb" stroke-width=".5"/>`),
  ]);
  const scissor = (cut: string, label: string, ex = "") =>
    `<div class="strip"><span class="lab">${label}</span><svg viewBox="0 0 ${W} 16" width="${W}mm" height="16mm"><path d="M2 0v16" stroke="#000" stroke-width=".4"/><path d="M${W - 2} 0v16" stroke="#000" stroke-width=".4"/><path d="${cut}" fill="none" stroke="#000" stroke-width=".8" stroke-dasharray="2.5 2" transform="translate(0 0)"/>${ex}</svg></div>`;
  const cuts = lineP("가위질 연습 (점선을 따라 잘라요)", [
    scissor("M5 8H185", "1. 곧은 선"),
    scissor("M5 8H185", "2. 곧은 선"),
    scissor(`M5 12 ${wave(5, 185, 4, 10).replace("M5 0", "")}`.replace("M5 12 ", "M5 8 "), "3. 물결선"),
    scissor(`${zig(5, 185, 12, 10).replace("M5 0", "M5 14")}`.replace(/L(\d+) -?12/g, (_m, x) => `L${x} 2`).replace(/L(\d+) 0/g, (_m, x) => `L${x} 14`), "4. 지그재그"),
    scissor("M5 8 Q50 -4 95 8 T185 8", "5. 큰 물결"),
    `<div class="strip"><span class="lab">6. 도형 오리기 (네모, 동그라미, 세모)</span><svg viewBox="0 0 ${W} 40" width="${W}mm" height="40mm"><rect x="12" y="5" width="30" height="30" fill="none" stroke="#000" stroke-width=".8" stroke-dasharray="2.5 2"/><circle cx="85" cy="20" r="16" fill="none" stroke="#000" stroke-width=".8" stroke-dasharray="2.5 2"/><path d="M140 5 L158 35 L122 35 Z" fill="none" stroke="#000" stroke-width=".8" stroke-dasharray="2.5 2"/></svg></div>`,
    `<div class="strip"><span class="lab">7. 하트와 별 오리기</span><svg viewBox="0 0 ${W} 50" width="${W}mm" height="50mm"><path d="M45 40 C10 22 22 4 45 16 C68 4 80 22 45 40Z" fill="none" stroke="#000" stroke-width=".8" stroke-dasharray="2.5 2"/><polygon points="140,3 146.5,19 164,19 150,29 155,46 140,36 125,46 130,29 116,19 133.500,19" fill="none" stroke="#000" stroke-width=".8" stroke-dasharray="2.5 2"/></svg></div>`,
    `<p style="font-size:10pt;margin-top:4mm">가위를 쓸 때는 선생님과 함께 해요. 자른 종이는 쓰레기통에 버려요.</p>`,
  ]);
  pages["line-scissor-practice.pdf"] = { html: `<style>${css}</style>${lines}${cuts}` };
}

// 3) 생활 순서 카드 (가로 A4 2쪽, 4가지)
{
  const seq: [string, string[]][] = [
    ["손 씻기", ["소매를 걷어요", "물을 틀어 손을 적셔요", "비누를 묻혀요", "손바닥·손등·손가락 사이를 문질러요", "물로 헹궈요", "수건으로 닦아요"]],
    ["양치하기", ["칫솔에 치약을 짜요", "윗니를 닦아요", "아랫니를 닦아요", "안쪽과 혀를 닦아요", "물로 헹구고 칫솔을 씻어요"]],
    ["화장실 가기", ["화장실 문을 닫아요", "바지를 내려요", "볼일을 봐요", "휴지를 써요", "물을 내려요", "바지를 올리고 손을 씻어요"]],
    ["가방 싸기", ["가방을 열어요", "알림장을 넣어요", "필통을 넣어요", "오늘 배운 책을 넣어요", "물통을 넣어요", "가방을 닫아요"]],
  ];
  const css = `${BASE}.row{margin-bottom:7mm}.row h2{font-size:15pt;margin-bottom:2mm}
.cards{display:grid;grid-template-columns:repeat(6,1fr);gap:3mm}
.c{border:.4mm dashed #444;border-radius:3mm;padding:2mm;display:flex;flex-direction:column;gap:1.5mm;height:75mm}
.n{width:8mm;height:8mm;border-radius:50%;background:#000;color:#fff;font-weight:bold;display:flex;align-items:center;justify-content:center;font-size:11pt}
.pic{flex:1;border:.3mm solid #999;border-radius:2mm;display:flex;align-items:center;justify-content:center;color:#999;font-size:8pt;text-align:center}
.t{font-size:10.5pt;font-weight:bold;line-height:1.3;min-height:15mm}
.note{font-size:9pt;color:#444}`;
  const row = ([name, steps]: [string, string[]]) =>
    `<div class="row"><h2>${name}</h2><div class="cards">${steps.map((s, i) => `<div class="c"><div class="n">${i + 1}</div><div class="pic">그림·사진<br>붙이는 곳</div><div class="t">${s}</div></div>`).join("")}</div></div>`;
  const pg = (a: [string, string[]], b: [string, string[]]) => `<div class="page land">${row(a)}${row(b)}<p class="note">잘라서 순서대로 붙이거나 벽에 붙여 써요. 그림 칸에 사진이나 그림 카드를 붙여요. 글자는 학생에게 맞게 고쳐 써도 돼요.</p></div>`;
  pages["life-steps.pdf"] = { landscape: true, html: `<style>${css}</style>${pg(seq[0], seq[1])}${pg(seq[2], seq[3])}` };
}

// 4) 사회적 이야기 빈 양식
{
  const css = `${BASE}.nm{font-size:12pt;margin-bottom:4mm}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:5mm}
.p{border:.5mm solid #000;border-radius:3mm;padding:3mm;height:68mm;display:flex;flex-direction:column;gap:2mm}
.no{font-weight:bold;font-size:12pt}
.pic{flex:1;border:.3mm dashed #888;border-radius:2mm}
.tx{display:flex;flex-direction:column;gap:5mm;height:21mm;justify-content:flex-end}
.tx i{display:block;border-bottom:.3mm solid #000}
.tip{margin-top:4mm;font-size:9.5pt;line-height:1.55;border:.3mm solid #888;border-radius:2mm;padding:2.5mm}`;
  const panels = Array.from({ length: 6 }, (_, i) => `<div class="p"><span class="no">${i + 1}</span><div class="pic"></div><div class="tx"><i></i><i></i><i></i></div></div>`).join("");
  pages["social-story-blank.pdf"] = {
    html: `<style>${css}</style><div class="page"><h1>사회적 이야기 만들기</h1><div class="nm">제목 <span class="line" style="width:105mm"></span> 날짜 <span class="line" style="width:35mm"></span></div><div class="grid">${panels}</div><div class="tip"><b>문장을 이렇게 써 보세요</b><br>① 어떤 상황인지 설명해요 (누가, 어디서, 언제) ② 다른 사람은 어떻게 생각하고 느끼는지 알려 줘요 ③ 내가 할 수 있는 행동을 알려 줘요 ④ 잘했을 때 좋은 점을 적어요. 학생 이름 대신 &quot;나&quot;나 &quot;친구&quot;로 쓰면 여러 학생에게 쓸 수 있어요.</div></div>`,
  };
}

// 5) 월간 달력 (가로)
{
  const css = `${BASE}.top{display:flex;align-items:flex-end;justify-content:center;gap:4mm;font-size:22pt;font-weight:bold;margin-bottom:3mm}
table{width:100%;border-collapse:collapse;table-layout:fixed;height:calc(210mm - 20mm - 22mm)}
th{border:.4mm solid #000;background:#eee;font-size:13pt;height:9mm}
th:first-child{color:#c00}th:last-child{color:#05c}
td{border:.4mm solid #000;vertical-align:top;padding:1.5mm}
.s{font-size:9pt;color:#666}`;
  const head = ["일", "월", "화", "수", "목", "금", "토"].map((d) => `<th>${d}</th>`).join("");
  const rows = Array.from({ length: 6 }, () => `<tr>${Array.from({ length: 7 }, () => `<td></td>`).join("")}</tr>`).join("");
  pages["monthly-calendar.pdf"] = {
    landscape: true,
    html: `<style>${css}</style><div class="page land"><div class="top"><span class="line" style="width:30mm"></span>년<span class="line" style="width:20mm"></span>월</div><table><tr>${head}</tr>${rows}</table><p class="s" style="margin-top:2mm">날짜를 직접 적고, 칸에 그림이나 스티커를 붙여 써요.</p></div>`,
  };
}

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium" });

for (const [file, { html, landscape }] of Object.entries(pages)) {
  const page = await browser.newPage();

  await page.setContent(`<!doctype html><meta charset="utf-8">${html}`);
  await page.pdf({ path: path.join(OUT, file), format: "A4", landscape: !!landscape, printBackground: true, preferCSSPageSize: false, margin: { top: "0", right: "0", bottom: "0", left: "0" } });
  await page.close();
  console.log("만듦:", file);
}
await browser.close();
