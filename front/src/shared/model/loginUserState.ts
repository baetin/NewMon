import { atom } from "recoil";
import type { LoginUser } from "../types/loginUser.types";

export const LoginUserState = atom<LoginUser>({
  key: "LoginUserState",
  default: {
    userId: 0,
    displayName: "",
    isNewUser: null,
  },
});
