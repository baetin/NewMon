import { jwtDecode } from "jwt-decode";

export const handleSuccess = (res: any) => {
  console.log("로그인 응답:", res);

  if (!res.credential) {
    console.error("❌ 구글 로그인 credential이 없습니다!");
    return;
  }

  try {
    const decoded = jwtDecode(res.credential);
    console.log("✅ 디코딩 성공:", decoded);
    sessionStorage.setItem("google_jwt", res.credential);
    // window.location.href = "/";
  } catch (err) {
    console.error("❌ JWT 디코딩 실패:", err);
  }
};

export const handleError = () => {
  console.error("Login Failed");
};
