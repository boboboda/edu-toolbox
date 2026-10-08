// 감정 카드 얼굴 (조금 더 사실적인 만화풍, 어린이 얼굴) — 눈·눈썹·입만 바꿔 끼우는 방식
export type Face2 = { id: string; brows: [string, string]; eyes: string; mouth: string; extra?: string; blush?: number };

const L = "#3b2a22"; // 선·눈썹 색
const ln = (d: string, w = 2.6, c = L) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

// 눈: 흰자 + 갈색 홍채 + 반짝임
const eye = (x: number, y: number, rx = 7, ry = 8, dx = 0, dy = 0) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" stroke="${L}" stroke-width="1.8"/>` +
  `<circle cx="${x + dx}" cy="${y + dy}" r="${Math.min(rx, ry) * 0.62}" fill="#6b4226"/>` +
  `<circle cx="${x + dx}" cy="${y + dy}" r="${Math.min(rx, ry) * 0.32}" fill="${L}"/>` +
  `<circle cx="${x + dx - 2}" cy="${y + dy - 2.4}" r="1.7" fill="#fff"/>`;
const eyes2 = (rx = 7, ry = 8, dx = 0, dy = 0) => eye(36, 49, rx, ry, dx, dy) + eye(64, 49, rx, ry, dx, dy);
const shut = (up: boolean) => {
  const d = up ? "Q36 40 43 48" : "Q36 55 43 48";
  const d2 = up ? "Q64 40 71 48" : "Q64 55 71 48";
  return ln(`M29 48 ${d}`, 3) + ln(`M57 48 ${d2}`, 3);
};
const drop = (x: number, y: number) =>
  `<path d="M${x} ${y} q-5 7 0 11 q5 -4 0 -11z" fill="#8cc8ff" stroke="#3b82c4" stroke-width="1.5"/>`;

export const FACES2: Face2[] = [
  { id: "happy", brows: ["M29 36 Q36 31 43 35", "M57 35 Q64 31 71 36"], eyes: shut(true),
    mouth: `<path d="M33 62 Q50 82 67 62 Q50 66 33 62z" fill="#8a2f3a" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/><path d="M38 64 Q50 68 62 64 L60 67 Q50 70 40 67z" fill="#fff"/>`, blush: 0.55 },
  { id: "sad", brows: ["M28 40 Q36 38 44 33", "M56 33 Q64 38 72 40"], eyes: eyes2(6.5, 7.5, 0, 2) ,
    mouth: ln("M39 71 Q50 63 61 71", 3), extra: drop(31, 58) + drop(31, 66).replace(/#8cc8ff/, "#8cc8ff"), blush: 0.2 },
  { id: "angry", brows: ["M27 34 L45 42", "M73 34 L55 42"], eyes: eyes2(6.5, 6, 0, 1),
    mouth: `<path d="M37 72 Q50 62 63 72 Q50 69 37 72z" fill="#8a2f3a" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/>`, blush: 0.5 },
  { id: "scared", brows: ["M28 33 Q35 26 43 31", "M57 31 Q65 26 72 33"], eyes: eyes2(7.5, 9.5, 0, 0),
    mouth: `<path d="M38 73 Q44 66 50 73 Q56 66 62 73 Q50 80 38 73z" fill="#8a2f3a" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/>`, extra: drop(78, 32), blush: 0 },
  { id: "sleepy", brows: ["M29 38 Q36 35 43 38", "M57 38 Q64 35 71 38"], eyes: shut(false),
    mouth: `<ellipse cx="50" cy="70" rx="5" ry="6.5" fill="#8a2f3a" stroke="${L}" stroke-width="2.2"/>`, extra: ln("M70 14 h10 l-10 12 h10", 3, "#4a5ea8"), blush: 0.3 },
  { id: "sick", brows: ["M28 38 Q36 36 44 33", "M56 33 Q64 36 72 38"], eyes: ln("M29 44 L43 49 L29 54", 3) + ln("M71 44 L57 49 L71 54", 3),
    mouth: ln("M37 72 Q43 66 50 72 T63 72", 3), extra: `<g transform="rotate(-18 66 20)"><rect x="52" y="14" width="26" height="11" rx="3" fill="#ffe3b3" stroke="${L}" stroke-width="2"/><path d="M65 17 v5 M62.5 19.5 h5" stroke="#e5484d" stroke-width="2" stroke-linecap="round"/></g>`, blush: 0 },
  { id: "shy", brows: ["M29 37 Q36 33 43 36", "M57 36 Q64 33 71 37"], eyes: eyes2(6.5, 7, -2, 3.5),
    mouth: ln("M43 70 Q50 74 57 70", 2.8), blush: 1 },
  { id: "excited", brows: ["M28 33 Q36 26 44 32", "M56 32 Q64 26 72 33"], eyes: eyes2(7.5, 9, 0, -1),
    mouth: `<path d="M32 61 Q50 86 68 61 Q50 66 32 61z" fill="#8a2f3a" stroke="${L}" stroke-width="2.4" stroke-linejoin="round"/><path d="M42 73 Q50 66 58 73 Q50 80 42 73z" fill="#ff7a8a"/>`, blush: 0.7 },
  { id: "surprised", brows: ["M28 30 Q36 22 44 29", "M56 29 Q64 22 72 30"], eyes: eyes2(7.5, 9.5, 0, 0),
    mouth: `<ellipse cx="50" cy="72" rx="7" ry="9" fill="#8a2f3a" stroke="${L}" stroke-width="2.4"/>`, blush: 0.2 },
  { id: "annoyed", brows: ["M28 38 L44 42", "M72 38 L56 42"], eyes: `<path d="M29 46 h14 v3 a7 5 0 0 1 -14 0z" fill="#fff" stroke="${L}" stroke-width="1.8"/><circle cx="36" cy="50.5" r="3" fill="#6b4226"/>` + `<path d="M57 46 h14 v3 a7 5 0 0 1 -14 0z" fill="#fff" stroke="${L}" stroke-width="1.8"/><circle cx="64" cy="50.5" r="3" fill="#6b4226"/>` + ln("M28 46 h16", 3) + ln("M56 46 h16", 3),
    mouth: ln("M39 72 h22", 3), blush: 0.15 },
  { id: "worried", brows: ["M28 36 Q36 36 44 30", "M56 30 Q64 36 72 36"], eyes: eyes2(6.5, 8, 2, 1),
    mouth: ln("M38 72 Q50 64 62 73", 3), extra: drop(79, 34), blush: 0.15 },
  { id: "calm", brows: ["M29 37 Q36 34 43 37", "M57 37 Q64 34 71 37"], eyes: shut(true),
    mouth: ln("M39 66 Q50 75 61 66", 3), blush: 0.4 },
];

export type FaceStyle = "boy" | "girl" | "cat";

const HEAD = "M50 94 C24 94 16 72 16 50 C16 26 30 12 50 12 C70 12 84 26 84 50 C84 72 76 94 50 94z";
const BANGS = (c: string) =>
  `<path d="M14 52 C8 20 28 4 52 6 C76 6 94 22 86 52 C84 40 78 30 70 26 C58 30 36 30 28 24 C20 30 16 40 14 52z" fill="${c}" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>`;

function base(style: FaceStyle) {
  if (style === "boy")
    return {
      back: `<ellipse cx="12" cy="56" rx="6" ry="9" fill="#f6c39b" stroke="${L}" stroke-width="2.4"/><ellipse cx="88" cy="56" rx="6" ry="9" fill="#f6c39b" stroke="${L}" stroke-width="2.4"/>`,
      head: `<path d="${HEAD}" fill="#ffd9b8" stroke="${L}" stroke-width="2.8"/>`,
      front: BANGS("#4a3228"),
    };
  if (style === "girl")
    return {
      // 머리카락이 얼굴 뒤로 길게 내려오고, 양쪽에 묶은 머리
      back:
        `<path d="M10 50 C6 20 28 2 50 2 C72 2 94 20 90 50 L94 96 Q86 100 78 92 L22 92 Q14 100 6 96z" fill="#2f2a3a" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>`,
      head: `<path d="${HEAD}" fill="#ffd9b8" stroke="${L}" stroke-width="2.8"/>`,
      front:
        `<path d="M16 50 C12 22 30 8 50 8 C70 8 88 22 84 50 C80 36 70 24 50 24 C30 24 20 36 16 50z" fill="#2f2a3a" stroke="${L}" stroke-width="2.6" stroke-linejoin="round"/>` +
        `<path d="M62 12 q10 -2 14 6" fill="none" stroke="#ff7a9a" stroke-width="5" stroke-linecap="round"/>`,
    };
  // cat
  return {
    back:
      `<path d="M16 38 L14 8 L40 20z" fill="#ffb36b" stroke="${L}" stroke-width="2.8" stroke-linejoin="round"/><path d="M84 38 L86 8 L60 20z" fill="#ffb36b" stroke="${L}" stroke-width="2.8" stroke-linejoin="round"/>` +
      `<path d="M20 30 L19 15 L32 22z" fill="#ffc9d1"/><path d="M80 30 L81 15 L68 22z" fill="#ffc9d1"/>`,
    head: `<path d="${HEAD}" fill="#ffc77f" stroke="${L}" stroke-width="2.8"/>`,
    front:
      `<path d="M50 14 v10 M40 16 l2 8 M60 16 l-2 8" stroke="#d98a3d" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M26 76 Q50 90 74 76 Q74 90 50 94 Q26 90 26 76z" fill="#fff3df" opacity="0.9"/>`,
  };
}

export function faceSvg2(f: Face2, size?: number, style: FaceStyle = "boy") {
  const dim = size ? ` width="${size}" height="${size}"` : "";
  const nose =
    style === "cat"
      ? `<path d="M46 58 h8 l-4 5z" fill="#e87a8a" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>`
      : ln("M48 58 Q50 61 52.5 58", 1.8, "#c98d6b");
  const whisk =
    style === "cat"
      ? ln("M10 60 L26 62 M10 70 L26 67 M90 60 L74 62 M90 70 L74 67", 1.8)
      : "";
  const cheeks = f.blush
    ? `<ellipse cx="26" cy="62" rx="7" ry="4.5" fill="#ff7f8f" opacity="${f.blush * 0.6}"/><ellipse cx="74" cy="62" rx="7" ry="4.5" fill="#ff7f8f" opacity="${f.blush * 0.6}"/>`
    : "";
  const brows = style === "cat" ? "" : ln(f.brows[0], 3.4) + ln(f.brows[1], 3.4);
  const b = base(style);
  return (
    `<svg viewBox="0 0 100 100"${dim} role="img" aria-label="${f.id} 얼굴">` +
    b.back + b.head + b.front + cheeks + brows + f.eyes + nose + f.mouth + whisk + (f.extra ?? "") + `</svg>`
  );
}
