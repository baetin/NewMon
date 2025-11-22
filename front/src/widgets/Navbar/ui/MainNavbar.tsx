import mainLogo from "../../../shared/assets/mainLogo.png";
import { FaSignInAlt } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { topics } from "../../../shared/model/topics";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  LeftSection,
  CenterSection,
  NavItem,
  Logo,
  RightSection,
  LoginButton,
  UserNameControllContainer,
  SelectDropDownContainer,
} from "./MainNavBar.styles";
import { useRecoilState } from "recoil";
import { LoginUserState } from "../../../shared/model/loginUserState";
import { useLogoutMutation } from "../hooks/useLogoutMutation";

interface IsClickedProps {
  isClicked: boolean;
  setIsClicked: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MainNavbar = ({ isClicked, setIsClicked }: IsClickedProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loginUser, setLoginUser] = useRecoilState(LoginUserState); // 로그인 됐는지 확인할때

  const { mutate: logoutMutate, isPending } = useLogoutMutation();

  const onClick = () => {
    setIsClicked((prev) => !prev);
  };

  const onLogoutClick = () => {
    const result = confirm("로그아웃 하시겠습니까?");
    if (!result) return;

    logoutMutate(undefined, {
      onSuccess: () => {
        setLoginUser({ userId: 0, displayName: "", isNewUser: null });
        // navigate("/");
      },
      onError: () => {
        alert("로그아웃 중 오류가 발생했습니다.");
      },
    });
  };

  const onChangeInforClick = () => {
    console.log("회원 정보 수정 페이지로 이동했습니다.");
  };

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

      {/* 오른쪽: 로그인, 로그아웃 드롭다운 버튼 */}
      <RightSection>
        {loginUser.displayName ? (
          <>
            <UserNameControllContainer
              onClick={(e) => {
                e.stopPropagation(); // 이벤트 버블링 방지
                onClick();
              }}
            >
              <span>{loginUser.displayName}님</span>

              <IoMdArrowDropdown size={30} />
            </UserNameControllContainer>
            {isClicked && (
              <SelectDropDownContainer onClick={(e) => e.stopPropagation()}>
                <p onClick={onLogoutClick}>
                  {isPending ? "로그아웃 중..." : "로그아웃"}
                </p>{" "}
                <p onClick={onChangeInforClick}>정보 수정</p>
              </SelectDropDownContainer>
            )}
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
