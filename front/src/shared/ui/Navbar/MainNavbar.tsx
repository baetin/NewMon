import { Navbar, Nav, Container } from "react-bootstrap";
import mainLogo from "../../assets/mainLogo.png";
import { FaSignInAlt } from "react-icons/fa";
import { RightSection, LoginButton } from "./MainNavBar.styles";
import { topics } from "../../model/topics";

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
          {topics.map((topic) => {
            return (
              <>
                <Nav.Link href={`/news/${topic.value}`}>{topic.label}</Nav.Link>
              </>
            );
          })}
        </Nav>

        {/* 우측 영역 */}
        <RightSection>
          <LoginButton onClick={() => (window.location.href = "/login")}>
            <FaSignInAlt size={18} />
            로그인
          </LoginButton>
        </RightSection>
      </Container>
    </Navbar>
  );
};
