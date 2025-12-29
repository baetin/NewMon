import type { SessionCheckProps } from '@/features/auth/model/sessionCheck.types';
import { http } from '@/shared/api';

export const getSessionCheck = async (): Promise<SessionCheckProps> => {
  try {
    const { data } = await http.get<SessionCheckProps>('/user/status');

    return data;
  } catch (err) {
    console.error('❌ 서비스 오류로 세션 체크에 실패했습니다:', err);
    throw err;
  }
};
