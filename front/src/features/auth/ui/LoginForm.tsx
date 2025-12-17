import { type CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { Link } from 'react-router-dom';

import mainLogo from '@/shared/assets/mainLogo.png';

import { useLoginFlow } from '../hooks/useLoginFlow';
import { Card, Container, GoogleButtonWrapper, Logo } from './LoginForm.styles';

export const LoginForm = () => {
  const { login, onAuthError } = useLoginFlow();

  const onLoginSuccess = (res: CredentialResponse) => {
    if (!res.credential) return;
    login(res.credential);
  };

  return (
    <Container>
      <Card>
        <Link to={'/'}>
          <Logo src={mainLogo} alt="Main Logo" />
        </Link>

        {/* 구글 로그인 */}
        <GoogleButtonWrapper>
          <GoogleLogin onSuccess={onLoginSuccess} onError={onAuthError} />
        </GoogleButtonWrapper>
      </Card>
    </Container>
  );
};
