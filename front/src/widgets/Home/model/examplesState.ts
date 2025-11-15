import { atom } from "recoil";

export const examples = [
  {
    id: 1,
    image_url: "https://placehold.co/800x400",
    title: "한국은행, 기준금리 동결",
    summary: "🤖 경기 둔화 우려 속 금리 인상 멈춤",
    compare: {
      ai_summary: "경기 둔화 우려로 금리 인상 멈춤",
      original: "한국은행은 오늘 열린 금융통화위원회에서...",
    },
  },
  {
    id: 2,
    image_url: "https://placehold.co/800x400",
    title: "삼성전자, 2분기 실적 발표",
    summary: "📊 반도체 회복세로 영업이익 증가",
    compare: {
      ai_summary: "반도체 시장 회복으로 영업이익 상승",
      original: "삼성전자는 올해 3분기 실적 발표를 통해...",
    },
  },
  {
    id: 3,
    image_url: "https://placehold.co/800x400",
    title: "삼성전자, 3분기 실적 발표",
    summary: "📊 반도체 회복세로 영업이익 증가",
    compare: {
      ai_summary: "반도체 시장 회복으로 영업이익 상승",
      original: "삼성전자는 올해 3분기 실적 발표를 통해...",
    },
  },
  {
    id: 4,
    image_url: "https://placehold.co/800x400",
    title: "삼성전자, 4분기 실적 발표",
    summary: "📊 반도체 회복세로 영업이익 증가",
    compare: {
      ai_summary: "반도체 시장 회복으로 영업이익 상승",
      original: "삼성전자는 올해 3분기 실적 발표를 통해...",
    },
  },
  {
    id: 5,
    image_url: "https://placehold.co/800x400",
    title: "삼성전자, 5분기 실적 발표",
    summary: "📊 반도체 회복세로 영업이익 증가",
    compare: {
      ai_summary: "반도체 시장 회복으로 영업이익 상승",
      original: "삼성전자는 올해 3분기 실적 발표를 통해...",
    },
  },
];

export const examplesState = atom({
  key: "exampleState",
  default: examples,
});

export const slideIndexSate = atom({
  key: "slideIndexState",
  default: 0,
});
