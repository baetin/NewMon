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

export const newExamples = [
  {
    id: 6,
    image_url: "https://placehold.co/800x400",
    title: "LG전자, 스마트폰 신모델 출시",
    summary: "📱 카메라 성능 강화로 시장 공략",
    compare: {
      ai_summary: "LG전자, 카메라 성능 강화 신모델 출시",
      original: "LG전자는 오늘 새로운 스마트폰 모델을 공개하며...",
    },
  },
  {
    id: 7,
    image_url: "https://placehold.co/800x400",
    title: "카카오, 메신저 업데이트 발표",
    summary: "💬 새로운 기능 추가로 사용자 편의성 향상",
    compare: {
      ai_summary: "카카오, 메신저 기능 개선 업데이트",
      original:
        "카카오는 이번 업데이트를 통해 채팅과 관련된 새로운 기능을 제공...",
    },
  },
  {
    id: 8,
    image_url: "https://placehold.co/800x400",
    title: "현대차, 전기차 판매 1만대 돌파",
    summary: "⚡ 친환경차 수요 증가로 기록 경신",
    compare: {
      ai_summary: "현대차, 전기차 판매 급증 기록",
      original:
        "현대자동차는 이번 달 전기차 판매량이 1만대를 넘어섰다고 발표...",
    },
  },
  {
    id: 9,
    image_url: "https://placehold.co/800x400",
    title: "SK하이닉스, 반도체 투자 계획 발표",
    summary: "💰 첨단 메모리 생산 시설 확대",
    compare: {
      ai_summary: "SK하이닉스, 첨단 메모리 투자 확대 계획",
      original:
        "SK하이닉스는 반도체 경쟁력 강화를 위해 신규 생산 시설 투자를 발표...",
    },
  },
  {
    id: 10,
    image_url: "https://placehold.co/800x400",
    title: "쿠팡, 해외 배송 서비스 확대",
    summary: "🚀 글로벌 물류망 확대로 배송 속도 개선",
    compare: {
      ai_summary: "쿠팡, 해외 배송 서비스 강화",
      original: "쿠팡은 해외 배송 가능 국가를 늘리고 물류 시스템을 개선해...",
    },
  },
]; // 임시

export const examplesState = atom({
  key: "exampleState",
  default: examples,
});

export const newExamplesState = atom({
  key: "newExamplesState",
  default: newExamples,
});

export const slideIndexSate = atom({
  key: "slideIndexState",
  default: 0,
});
