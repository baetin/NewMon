import { Navbar, Nav, Container } from "react-bootstrap";
import mainLogo from "../../assets/mainLogo.png";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
import { RightSection, SignupButton, LoginButton } from "./MainNavBar.styles";

export const MainNavbar: React.FC = () => {
  return (
    <Navbar bg="light" expand="lg">
      <Container
        className="d-flex align-items-center justify-content-between"
        style={{ maxHeight: "100px" }}
      >
        {/* 로고 */}
        <Navbar.Brand href="/">
          <img
            src={mainLogo}
            alt="Main Logo"
            style={{ height: "150px", width: "180px" }}
          />
        </Navbar.Brand>

        {/* 가운데 메뉴 */}
        <Nav
          className="mx-auto"
          style={{ gap: "30px", fontSize: "18px", fontWeight: "600" }}
        >
          <Nav.Link href="/news/economy">경제</Nav.Link>
          <Nav.Link href="/news/society">사회</Nav.Link>
          <Nav.Link href="/news/it">IT/과학</Nav.Link>
          <Nav.Link href="/news/sports">스포츠</Nav.Link>
        </Nav>

        {/* 우측 영역 */}
        <RightSection>
          <SignupButton onClick={() => (window.location.href = "/signUp")}>
            <FaUserPlus size={18} />
            회원가입
          </SignupButton>
          <LoginButton onClick={() => (window.location.href = "/login")}>
            <FaSignInAlt size={18} />
            로그인
          </LoginButton>
        </RightSection>
      </Container>
    </Navbar>
  );
};
