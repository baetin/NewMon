import { GoogleLogin } from "@react-oauth/google";
import type React from "react";
import { handleError, handleSuccess } from "../api/handleLogin";
import mainLogo from "../../../shared/assets/mainLogo.png";
import {
  Card,
  Container,
  GoogleButtonWrapper,
  Logo,
  // NaverButtonWrapper,
} from "./LoginForm.styles";
import { Link } from "react-router-dom";

// const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
// const NAVER_CALLBACK_URL = import.meta.env.VITE_NAVER_CALLBACK_URL;

// const naverLoginUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(
//   NAVER_CALLBACK_URL
// )}&state=${Math.random()}`;

const LoginForm: React.FC = () => {
  return (
    <Container>
      <Card>
        <Link to={"/"}>
          <Logo src={mainLogo} alt="Main Logo" />
        </Link>

        {/* 구글 로그인 */}
        <GoogleButtonWrapper>
          <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
        </GoogleButtonWrapper>

        {/* 네이버 로그인 */}
        {/* <NaverButtonWrapper>
          <a href={naverLoginUrl}>N 네이버 로그인</a>
        </NaverButtonWrapper> */}
      </Card>
    </Container>
  );
};
export default LoginForm;
