import TopicsMainArticle from "../../../widgets/TopicsHome/ui/TopicsMainArticle/TopicsMainArticle";
import TopicsSubArticleList from "../../../widgets/TopicsHome/ui/TopicsSubArticleList/TopicsSubArticleList";
import {
  // Container,
  TopicsLeft,
  Right,
  TopicContainer,
} from "../../../shared/styles/articleContents.styles";
import { topicMap } from "../model/topics.constants";
import { useParams } from "react-router-dom";
import { Pagination, Spinner } from "../../../shared/ui";
import { useArticlesQuery } from "../hooks/useArticlesQuery";
import { useSearchQuery } from "../../../features/searchBar/hooks/useSearchQuery";
import { useState } from "react";
import { PaginationContainer } from "./TopicsHomePage.styles";
// export const mockArticlesData = {
//   topicId: 1,
//   articles: [
//     {
//       article_id: 101,
//       title: "2025년 AI 기술 산업 성장 전망",
//       summary_text: "AI 산업은 향후 10년간 연평균 20% 성장할 것으로 전망된다.",
//       previous_full_text:
//         "전문가들은 AI 도입 속도가 빨라짐에 따라 제조, 의료, 교육 등 다양한 산업에서 구조적 변화가 발생할 것으로 기대하고 있다.",
//       full_text:
//         "전문가들은 AI 도입 속도가 빨라짐에 따라 제조, 의료, 교육 등 다양한 산업에서 구조적 변화가 발생할 것으로 전망하고 있다.",
//       image_original_url: "https://placehold.co/600x350?text=Main+Article",
//       source: "BBC News",
//       published_date: "2025-01-03",
//       crawled_at: "2025-01-04",
//       modified_at: "2025-01-04",
//       information_depth: "high",
//       focus_area: "technology",
//       objectivity_score: "8.7",
//     },
//     {
//       article_id: 102,
//       title: "한국, 반도체 공급망 협력 확대 추진",
//       summary_text:
//         "한국 정부는 글로벌 반도체 공급망 위험 대응 전략을 논의 중이다.",
//       previous_full_text:
//         "전문가들은 AI 도입 속도가 빨라짐에 따라 제조, 의료, 교육 등 다양한 산업에서 구조적 변화가 발생할 것으로 기대하고 있다.",

//       full_text:
//         "정부는 미국 및 유럽과 협력해 글로벌 반도체 공급망 안정화를 추진하고 있으며 다국적 기업과의 협력 체계를 구축하고 있다.",
//       image_original_url: "https://placehold.co/400x220?text=Sub+1",
//       source: "Yonhap News",
//       published_date: "2025-01-02",
//       crawled_at: "2025-01-04",
//       modified_at: "2025-01-04",
//       information_depth: "medium",
//       focus_area: "economy",
//       objectivity_score: "7.9",
//     },
//     {
//       article_id: 103,
//       title: "전기차 시장 성장세 둔화",
//       summary_text: "전기차 판매 증가세가 충전 인프라 문제로 둔화되고 있다.",
//       previous_full_text:
//         "전문가들은 AI 도입 속도가 빨라짐에 따라 제조, 의료, 교육 등 다양한 산업에서 구조적 변화가 발생할 것으로 기대하고 있다.",

//       full_text:
//         "전기차 시장은 초기 급성장 이후 인프라 부족, 배터리 비용 상승 등으로 성장세가 감소하고 있으며 업계는 정책 지원을 촉구하고 있다.",
//       image_original_url: "https://placehold.co/400x220?text=Sub+2",
//       source: "Reuters",
//       published_date: "2025-01-01",
//       crawled_at: "2025-01-04",
//       modified_at: "2025-01-04",
//       information_depth: "medium",
//       focus_area: "automotive",
//       objectivity_score: "8.2",
//     },
//     {
//       article_id: 104,
//       title: "메타버스 교육 시장 확대",
//       summary_text:
//         "학교와 교육 기관에서 메타버스 교육 콘텐츠 도입이 증가하는 추세이다.",
//       previous_full_text: "asdasdasd",
//       full_text:
//         "학생 참여도 향상과 학습 효과 개선 가능성이 확인되면서 메타버스 기반 교육 실험이 확산되고 있다.",
//       image_original_url: "https://placehold.co/400x220?text=Sub+3",
//       source: "New York Times",
//       published_date: "2024-12-30",
//       crawled_at: "2025-01-04",
//       modified_at: "2025-01-04",
//       information_depth: "low",
//       focus_area: "education",
//       objectivity_score: "6.4",
//     },
//   ],
// };

const TopicsHomePage = () => {
  const [page, setPage] = useState(1);

  const { topic } = useParams<{ topic: string }>();
  const topicId = topic ? topicMap[topic.toLowerCase()] : null;

  const searchParams = new URLSearchParams(location.search);
  const searchValue = searchParams.get("search");

  if (!topicId) return <div>올바른 주제를 선택해주세요.</div>;

  const { data, isPending, isError } = searchValue
    ? useSearchQuery({ topicId, keywordName: searchValue, page: 1 })
    : useArticlesQuery(topicId);

  if (isPending) return <Spinner />;
  if (isError) return <div>오류가 발생했습니다. 다시 시도해주세요.</div>;
  if (!data || !data.articles?.length) return <div>게시글이 없습니다.</div>;

  const { articles } = data;
  const mainArticle = articles[0];
  const subArticles = articles.slice(1);
  // const articlesData = mockArticlesData;
  // const mainArticle = articlesData.articles[0];
  // const subArticles = articlesData.articles.slice(1); // ui 확인용

  return (
    <>
      <TopicContainer>
        <TopicsLeft>
          <TopicsMainArticle article={mainArticle} />
        </TopicsLeft>
        <Right>
          <TopicsSubArticleList articles={subArticles} />
        </Right>
      </TopicContainer>
      <PaginationContainer>
        {
          /*data &&*/ <Pagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        }
      </PaginationContainer>
    </>
  );
};

export default TopicsHomePage;
