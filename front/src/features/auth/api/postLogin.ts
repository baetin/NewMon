import { http } from "@/shared/api";

export const postLogin = async (idToken: string) => {
  const { data } = await http.post("/auth/google-login", { idToken });
  return data;
};
