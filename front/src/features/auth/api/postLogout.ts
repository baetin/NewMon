import { http } from '@/shared/api';

export const postLogout = async () => {
  try {
    const { data } = await http.post('/auth/google-logout');
    return data;
  } catch (err) {
    console.error('❌ 구글 로그아웃 처리 실패:', err);
    throw err;
  }
};
