import { http } from '@/shared/api';

export const postLogin = async (idToken: string) => {
  try {
    const { data } = await http.post('/auth/google-login', { idToken });
    return data;
  } catch (err) {
    console.error('❌ 구글 로그인 처리 실패:', err);
    throw err;
  }
};
