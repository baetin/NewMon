import mainLogo from "../../assets/mainLogo.png";
import { FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { topics } from "../../model/topics";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  LeftSection,
  CenterSection,
  NavItem,
  Logo,
  RightSection,
  LoginButton,
  LogoutButton,
} from "./MainNavBar.styles";
import { useRecoilValue } from "recoil";
import { LoginUserState } from "../../model/loginUserState";

export const MainNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const loginUser = useRecoilValue(LoginUserState); // 로그인 됐는지 확인할때

  return (
    <Container>
      {/* 왼쪽: 로고 */}
      <LeftSection as={Link} to="/">
        <Logo src={mainLogo} alt="Main Logo" />
      </LeftSection>

      {/* 가운데: 주제 메뉴 */}
      <CenterSection>
        {topics.map((topic) => (
          <NavItem
            as={Link}
            key={topic.value}
            to={`/news/${topic.value}`}
            className={
              location.pathname === `/news/${topic.value}` ? "active" : ""
            }
          >
            {topic.label}
          </NavItem>
        ))}
      </CenterSection>

      {/* 오른쪽: 로그인 버튼 */}
      <RightSection>
        {loginUser.userName ? (
          <>
            <p>{loginUser.userName}님</p>
            <LogoutButton>
              <FaSignOutAlt size={16} />
              로그아웃
            </LogoutButton>
          </>
        ) : (
          <LoginButton onClick={() => navigate("/login")}>
            <FaSignInAlt size={16} />
            로그인
          </LoginButton>
        )}
      </RightSection>
    </Container>
  );
};
