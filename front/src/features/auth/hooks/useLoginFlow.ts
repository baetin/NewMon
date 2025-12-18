import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useLoginMutation } from './useLoginMutation';

export const useLoginFlow = () => {
  const navigate = useNavigate();

  const loginMutation = useLoginMutation();

  const queryClient = useQueryClient();

  const login = (credential: string) => {
    loginMutation.mutate(credential, {
      onSuccess: ({ user, isNewUser }) => {
        queryClient.setQueryData(['session'], {
          isAuthenticated: true,
          userId: user.userId,
          displayName: user.displayName,
        });
        navigate(isNewUser ? '/interest-select' : '/');
      },
      onError: () => {
        toast.error('로그인에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

  const onAuthError = () => {
    toast.error('구글 로그인에 실패했습니다.');
  };

  return { login, onAuthError };
};
