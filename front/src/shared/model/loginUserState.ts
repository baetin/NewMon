import { atom } from "recoil";

export const LoginUserState = atom({
  key: "LoginUserState",
  default: {
    userId: "",
    displayName: "",
  },
});
