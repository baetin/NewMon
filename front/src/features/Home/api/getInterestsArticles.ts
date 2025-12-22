import axios from 'axios';

import type { TopicArticle } from '../model/TopicArticle.types';

export const getInterestsArticles = async (): Promise<TopicArticle[]> => {
  try {
    const response = await axios.get('/api/main/personalized');
    return response.data.data;
  } catch (err) {
    console.error('❌ InterestsTopic 가져오기 실패:', err);
    return [];
  }
};
