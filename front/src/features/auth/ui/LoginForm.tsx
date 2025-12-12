import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import mainLogo from "@/shared/assets/mainLogo.png";

import { Link, useNavigate } from "react-router-dom";

import { useLoginMutation } from "@/features/auth/hooks/useLoginMutation";

import {
  Container,
  Card,
  Logo,
  GoogleButtonWrapper,
} from "@/features/auth/ui/LoginForm.styles";
import { useQueryClient } from "@tanstack/react-query";

export const LoginForm = () => {
  const navigate = useNavigate();

  const loginMutation = useLoginMutation();

  const queryClient = useQueryClient();

  const onLoginSuccess = (res: CredentialResponse) => {
    if (!res.credential) return;

    loginMutation.mutate(res.credential, {
      onSuccess: ({ user, isNewUser }) => {
        queryClient.setQueryData(["session"], {
          isAuthenticated: true,
          userId: user.userId,
          displayName: user.displayName,
        });
        navigate(isNewUser ? "/interest-select" : "/");
      },
    });
  };

  return (
    <Container>
      <Card>
        <Link to={"/"}>
          <Logo src={mainLogo} alt="Main Logo" />
        </Link>

        {/* 구글 로그인 */}
        <GoogleButtonWrapper>
          <GoogleLogin
            onSuccess={onLoginSuccess}
            onError={() => console.error("구글 로그인 실패")}
          />
        </GoogleButtonWrapper>
      </Card>
    </Container>
  );
};
