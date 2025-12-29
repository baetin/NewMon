import axios from 'axios';

import type { TopicArticle } from '../model/TopicArticle.types';

export const getHotTopicArticles = async (): Promise<TopicArticle[]> => {
  try {
    const response = await axios.get('/api/main/hot');
    return response.data.data;
  } catch (err) {
    console.error('❌ HotTopic 가져오기 실패:', err);
    return [];
  }
};
