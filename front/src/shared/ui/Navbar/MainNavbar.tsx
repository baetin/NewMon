import mainLogo from "../../assets/mainLogo.png";
import { FaSignInAlt } from "react-icons/fa";
import { topics } from "../../model/topics";
import { useLocation } from "react-router-dom";
import {
  Container,
  LeftSection,
  CenterSection,
  NavItem,
  Logo,
  RightSection,
  LoginButton,
} from "./MainNavBar.styles";

export const MainNavbar: React.FC = () => {
  const location = useLocation();

  return (
    <Container>
      {/* 왼쪽: 로고 */}
      <LeftSection href="/">
        <Logo src={mainLogo} alt="Main Logo" />
      </LeftSection>

      {/* 가운데: 주제 메뉴 */}
      <CenterSection>
        {topics.map((topic) => (
          <NavItem
            key={topic.value}
            href={`/news/${topic.value}`}
            className={location.pathname.includes(topic.value) ? "active" : ""}
          >
            {topic.label}
          </NavItem>
        ))}
      </CenterSection>

      {/* 오른쪽: 로그인 버튼 */}
      <RightSection>
        <LoginButton onClick={() => (window.location.href = "/login")}>
          <FaSignInAlt size={16} />
          로그인
        </LoginButton>
      </RightSection>
    </Container>
  );
};
