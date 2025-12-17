import { useState } from 'react';

import { useParams } from 'react-router-dom';

import { useSearchQuery } from '@/features/searchBar/hooks/useSearchQuery';
import {
  TopicsMainArticle,
  TopicsSubArticleList,
  topicMap,
  useArticlesQuery,
} from '@/features/topicsHome';
import {
  Right,
  TopicContainer,
  TopicsLeft,
} from '@/shared/styles/articleContents.styles';
import { Pagination, Spinner } from '@/shared/ui';

import { PaginationContainer } from './TopicsHomePage.styles';

const TopicsHomePage = () => {
  const [page, setPage] = useState(1);

  const { topic } = useParams<{ topic: string }>();
  const topicId = topic ? topicMap[topic.toLowerCase()] : null;

  const searchParams = new URLSearchParams(location.search);
  const searchValue = searchParams.get('search');

  if (!topicId) return <div>올바른 주제를 선택해주세요.</div>;

  const { data, isPending, isError } = searchValue
    ? useSearchQuery({ topicId, keywordName: searchValue, page })
    : useArticlesQuery(topicId);

  if (isPending) return <Spinner />;
  if (isError) return <div>오류가 발생했습니다. 다시 시도해주세요.</div>;
  if (!data || !data.articles?.length) return <div>게시글이 없습니다.</div>;

  const mainArticle = data.articles[0];
  const subArticles = data.articles.slice(1);

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

      {searchValue && (
        <PaginationContainer>
          <Pagination
            page={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        </PaginationContainer>
      )}
    </>
  );
};

export default TopicsHomePage;
