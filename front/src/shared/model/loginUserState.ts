import { atom } from "recoil";

export const LoginUserState = atom({
  key: "LoginUserState",
  default: {
    userId: "",
    displayName: "",
    isNewUser: null as boolean | null,
  },
});
