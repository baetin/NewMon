import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import mainLogo from "../../../shared/assets/mainLogo.png";
import { Card, Container, GoogleButtonWrapper, Logo } from "./LoginForm.styles";
import { Link, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { LoginUserState } from "../../../shared/model/loginUserState";
import { useLoginMutation } from "../hooks/useLoginMutation";

const LoginForm = () => {
  const setLoginUser = useSetRecoilState(LoginUserState);
  const navigate = useNavigate();

  const loginMutation = useLoginMutation(setLoginUser, navigate);

  const onLoginSuccess = (res: CredentialResponse) => {
    loginMutation.mutate(res);
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
export default LoginForm;
