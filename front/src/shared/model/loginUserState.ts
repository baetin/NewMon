import { atom } from "recoil";

export const LoginUserState = atom<{
  userId: number;
  displayName: string;
  isNewUser: boolean | null;
}>({
  key: "LoginUserState",
  default: {
    userId: 0,
    displayName: "",
    isNewUser: null,
  },
});
