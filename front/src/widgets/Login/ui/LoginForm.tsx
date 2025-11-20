import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { handleError, handleLogin } from "../api/handleLogin";
import mainLogo from "../../../shared/assets/mainLogo.png";
import { Card, Container, GoogleButtonWrapper, Logo } from "./LoginForm.styles";
import { Link, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { LoginUserState } from "../../../shared/model/loginUserState";

const LoginForm = () => {
  const setLoginUser = useSetRecoilState(LoginUserState);
  const navigate = useNavigate();

  const onLoginSuccess = (res: CredentialResponse) => {
    handleLogin({ res, setLoginUser, navigate });
  };

  return (
    <Container>
      <Card>
        <Link to={"/"}>
          <Logo src={mainLogo} alt="Main Logo" />
        </Link>

        {/* 구글 로그인 */}
        <GoogleButtonWrapper>
          <GoogleLogin onSuccess={onLoginSuccess} onError={handleError} />
        </GoogleButtonWrapper>
      </Card>
    </Container>
  );
};
export default LoginForm;
