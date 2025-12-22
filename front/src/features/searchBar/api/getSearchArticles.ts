import axios from 'axios';

import type {
  GetSearchArticlesProps,
  SearchArticlesResponse,
} from '../model/types';

export const getSearchArticles = async ({
  topicId,
  keywordName,
  page = 1,
}: GetSearchArticlesProps): Promise<SearchArticlesResponse> => {
  try {
    const response = await axios.get('/api/articles/search', {
      params: {
        topicId,
        keywordName,
        page,
      },
    });
    return response.data;
  } catch (err) {
    console.error('검색 기사 api 호출 실패:', err);
    throw err;
  }
};
