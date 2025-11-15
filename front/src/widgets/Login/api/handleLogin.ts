import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";

export const handleSuccess = async (res: any) => {
  // const navigate = useNavigate();

  if (!res.credential) {
    console.error("❌ 구글 로그인 credential이 없습니다!");
    return;
  }

  try {
    const response = await axios.post("/api/auth/google-login", {
      credential: res.credential,
    });
    console.log("백엔드 응답:", response.data);

    // const decoded = jwtDecode(res.credential);
    // console.log("✅ 디코딩 성공:", decoded);
    if (response.data.token) {
      localStorage.setItem("google_jwt", response.data.token);
      // navigate("/");
    }
  } catch (err) {
    console.error("❌ 구글 로그인 처리 실패:", err);
  }
};

export const handleError = () => {
  console.error("구글 로그인 실패");
};
