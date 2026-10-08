// 특수교육 자료를 찾으러 가는 외부 사이트 모음.
// 주소는 2026-10-08에 검색으로 확인했어요. 바뀐 곳이 있으면 알려 주세요.

export type Site = {
  name: string;
  href: string;
  desc: string;
  note?: string; // 쓸 때 알아 둘 점
};

export type SiteGroup = {
  id: string;
  title: string;
  desc: string;
  sites: Site[];
};

export const SITE_CHECKED = "2026-10-08";

export const SITE_GROUPS: SiteGroup[] = [
  {
    id: "official",
    title: "공식 기관",
    desc: "국가 기관이 운영하는 특수교육 사이트예요.",
    sites: [
      {
        name: "국립특수교육원",
        href: "https://www.nise.go.kr/main.do?s=nise",
        desc: "특수교육 연구, 학습자료 개발, 교원 연수, 법령·연구자료를 제공해요.",
      },
      {
        name: "에듀에이블",
        href: "https://www.nise.go.kr/main.do?s=eduable",
        desc: "학생과 교사를 위한 특수교육 수업 자료 공유 공간이에요. 국립특수교육원이 운영해요.",
      },
      {
        name: "장애학생 온라인 학습방",
        href: "https://www.nise.go.kr/jsp/onlineedu/index.jsp",
        desc: "집에서도 쓸 수 있는 장애학생용 온라인 학습 공간이에요.",
        note: "주소가 열리지 않으면 에듀에이블 안에서 찾아 보세요.",
      },
    ],
  },
  {
    id: "share",
    title: "교사가 모은 자료",
    desc: "현장 선생님들이 모아 공유하는 자료실이에요.",
    sites: [
      {
        name: "특수교육 학습공유 공간 (SELC)",
        href: "https://sites.google.com/selc.sc.kr/selc/1-%EA%B5%90%EC%88%98%ED%95%99%EC%8A%B5-%EC%9E%90%EB%A3%8C",
        desc: "유치·초등·중고등 교과별 교수·학습 자료, 통합교육, AAC(보완대체의사소통), 중도중복장애 자료를 모아 뒀어요.",
        note: "일부 자료는 계정 신청이 필요할 수 있어요.",
      },
    ],
  },
  {
    id: "aac",
    title: "그림 상징 · AAC",
    desc: "의사소통 카드, 그림 카드를 만들 때 쓰는 그림 자료예요.",
    sites: [
      {
        name: "ARASAAC",
        href: "https://arasaac.org/",
        desc: "스페인 아라곤 정부가 운영하는 AAC 그림 상징 모음이에요. 그림을 무료로 내려받을 수 있어요.",
        note: "비영리·출처 표시 등 사용 조건이 있어요. 쓰기 전에 사이트의 라이선스 안내를 확인하세요.",
      },
    ],
  },
  {
    id: "research",
    title: "연구 · 논문 · 교육과정",
    desc: "자료 조사와 학위 논문 준비에 쓰는 사이트예요.",
    sites: [
      {
        name: "RISS 학술연구정보서비스",
        href: "http://www.riss.kr/index.do",
        desc: "학위논문과 학술논문을 검색하고 단행본 소장처를 확인해요.",
      },
      {
        name: "국가교육과정정보센터",
        href: "http://ncic.kice.re.kr/",
        desc: "특수교육 교육과정을 포함한 국내외 교육과정 원문을 볼 수 있어요.",
      },
      {
        name: "교육통계서비스",
        href: "http://kess.kedi.re.kr/index",
        desc: "유초중등 교육 통계와 통계간행물을 제공해요.",
      },
      {
        name: "LD OnLine",
        href: "http://www.ldonline.org/",
        desc: "학습장애와 특수교육 정보를 폭넓게 모아 둔 영어 사이트예요.",
      },
    ],
  },
];
