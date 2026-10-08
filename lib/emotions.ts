// 감정 카드 얼굴 그림 (코드로 그린 SVG, 100x100)
// 눈·입 모양만 달라서 학생이 표정 차이를 쉽게 보도록 단순하게 그렸어요.

export type Emotion = {
  id: string;
  name: string;
  say: string;
  tip: string;
  color: string; // 얼굴 색
  art: string; // 눈·입 등 (SVG 안쪽)
};

const S = 'stroke="#14213d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
const dot = (x: number, y: number, r = 4.5) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#14213d"/>`;
const cheek = (x: number, y: number, c = "#ff8fa3", o = 0.7) =>
  `<ellipse cx="${x}" cy="${y}" rx="8" ry="5.5" fill="${c}" opacity="${o}"/>`;
const bigEye = (x: number, y: number, r = 9) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" ${S}/><circle cx="${x}" cy="${y}" r="${r / 3}" fill="#14213d"/>`;
const star = (cx: number, cy: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 9 : 4;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="#fff" ${S} stroke-width="2.5"/>`;
};
const drop = (x: number, y: number, c = "#5aa9ff") =>
  `<path d="M${x} ${y} q-6 8 0 12 q6 -4 0 -12z" fill="${c}" stroke="#14213d" stroke-width="2.5" stroke-linejoin="round"/>`;

export const EMOTIONS: Emotion[] = [
  {
    id: "happy", name: "기뻐요", say: "나는 기뻐요",
    tip: "좋은 일이 있어서 웃음이 나요.", color: "#ffd84d",
    art: `<path d="M28 46 Q35 36 42 46" fill="none" ${S}/><path d="M58 46 Q65 36 72 46" fill="none" ${S}/>
      <path d="M30 60 Q50 84 70 60z" fill="#fff" ${S}/>${cheek(24, 62)}${cheek(76, 62)}`,
  },
  {
    id: "sad", name: "슬퍼요", say: "나는 슬퍼요",
    tip: "눈물이 나고 마음이 아파요. 도와 달라고 말해도 돼요.", color: "#9ccaff",
    art: `<path d="M27 36 L43 41" ${S} fill="none"/><path d="M73 36 L57 41" ${S} fill="none"/>
      ${dot(36, 49)}${dot(64, 49)}${drop(34, 55)}
      <path d="M36 74 Q50 61 64 74" fill="none" ${S}/>`,
  },
  {
    id: "angry", name: "화나요", say: "나는 화가 나요",
    tip: "숨을 크게 쉬어 봐요. 잠깐 쉬어도 돼요.", color: "#ff8a72",
    art: `<path d="M26 33 L45 43" ${S} fill="none"/><path d="M74 33 L55 43" ${S} fill="none"/>
      ${dot(37, 50)}${dot(63, 50)}
      <path d="M35 72 Q50 61 65 72" fill="none" ${S}/>`,
  },
  {
    id: "scared", name: "무서워요", say: "나는 무서워요",
    tip: "선생님에게 말해요. 안전한 곳에 있어요.", color: "#c9b8ff",
    art: `<path d="M25 33 L42 28" ${S} fill="none"/><path d="M75 33 L58 28" ${S} fill="none"/>
      ${bigEye(37, 46)}${bigEye(63, 46)}
      <path d="M33 72 Q38 65 43 72 T53 72 T63 72" fill="none" ${S}/>${drop(80, 30, "#9ccaff")}`,
  },
  {
    id: "sleepy", name: "졸려요", say: "나는 졸려요",
    tip: "몸이 피곤해요. 쉬고 싶다고 말해요.", color: "#b8c4e8",
    art: `<path d="M27 47 Q36 54 45 47" fill="none" ${S}/><path d="M55 47 Q64 54 73 47" fill="none" ${S}/>
      <ellipse cx="50" cy="69" rx="5.5" ry="7" fill="#fff" ${S}/>
      <path d="M68 14 h11 l-11 13 h11" fill="none" ${S} stroke-width="3.5"/>`,
  },
  {
    id: "sick", name: "아파요", say: "나는 아파요",
    tip: "어디가 아픈지 손으로 가리켜요.", color: "#b9e6a8",
    art: `<path d="M28 40 L42 46 L28 52" fill="none" ${S}/><path d="M72 40 L58 46 L72 52" fill="none" ${S}/>
      <path d="M36 72 Q43 65 50 72 T64 72" fill="none" ${S}/>
      <g transform="rotate(-18 66 20)"><rect x="52" y="14" width="26" height="12" rx="3" fill="#ffe3b3" stroke="#14213d" stroke-width="2.5"/><path d="M65 17 v6 M62 20 h6" stroke="#e5484d" stroke-width="2.5" stroke-linecap="round"/></g>`,
  },
  {
    id: "shy", name: "부끄러워요", say: "나는 부끄러워요",
    tip: "얼굴이 뜨거워요. 괜찮아요.", color: "#ffc2cf",
    art: `<path d="M28 46 Q35 52 42 46" fill="none" ${S}/><path d="M58 46 Q65 52 72 46" fill="none" ${S}/>
      ${cheek(26, 60, "#ff5d7a", 0.8)}${cheek(74, 60, "#ff5d7a", 0.8)}
      <path d="M42 70 Q50 75 58 70" fill="none" ${S}/>`,
  },
  {
    id: "excited", name: "신나요", say: "나는 신나요",
    tip: "기대되고 몸이 들썩여요.", color: "#ffb347",
    art: `${star(35, 42)}${star(65, 42)}
      <path d="M30 60 Q50 86 70 60z" fill="#fff" ${S}/><path d="M42 72 Q50 66 58 72 Q50 80 42 72z" fill="#ff6b81"/>`,
  },
  {
    id: "surprised", name: "놀랐어요", say: "나는 깜짝 놀랐어요",
    tip: "갑자기 일이 생겨서 놀랐어요. 숨을 천천히 쉬어요.", color: "#ffe28a",
    art: `<path d="M26 30 Q35 22 44 30" fill="none" ${S}/><path d="M56 30 Q65 22 74 30" fill="none" ${S}/>
      ${bigEye(36, 46, 8)}${bigEye(64, 46, 8)}
      <ellipse cx="50" cy="71" rx="8" ry="10" fill="#7a2a2a" ${S}/>`,
  },
  {
    id: "annoyed", name: "짜증나요", say: "나는 짜증이 나요",
    tip: "마음이 불편해요. 무엇이 싫은지 말해 봐요.", color: "#e3c9a6",
    art: `<path d="M26 38 L44 42" ${S} fill="none"/><path d="M74 38 L56 42" ${S} fill="none"/>
      <path d="M28 49 h16" ${S} fill="none"/><path d="M56 49 h16" ${S} fill="none"/>
      <path d="M38 71 h24" ${S} fill="none"/>`,
  },
  {
    id: "worried", name: "걱정돼요", say: "나는 걱정돼요",
    tip: "마음이 조마조마해요. 걱정되는 일을 말해 봐요.", color: "#d3e0ee",
    art: `<path d="M27 34 L43 29" ${S} fill="none"/><path d="M73 34 L57 29" ${S} fill="none"/>
      ${dot(39, 47)}${dot(67, 47)}
      <path d="M37 71 Q50 63 63 73" fill="none" ${S}/>${drop(80, 32, "#9ccaff")}`,
  },
  {
    id: "calm", name: "편안해요", say: "나는 편안해요",
    tip: "마음이 차분하고 쉬는 것 같아요.", color: "#a8e6cf",
    art: `<path d="M28 48 Q35 41 42 48" fill="none" ${S}/><path d="M58 48 Q65 41 72 48" fill="none" ${S}/>
      <path d="M38 65 Q50 75 62 65" fill="none" ${S}/>${cheek(25, 62, "#ff8fa3", 0.45)}${cheek(75, 62, "#ff8fa3", 0.45)}`,
  },
];

export function faceSvg(e: Emotion, size?: number) {
  const dim = size ? ` width="${size}" height="${size}"` : "";
  return `<svg viewBox="0 0 100 100"${dim} role="img" aria-label="${e.name} 얼굴"><circle cx="50" cy="50" r="45" fill="${e.color}" ${S}/>${e.art}</svg>`;
}
