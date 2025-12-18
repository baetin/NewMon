import { useMutation } from "@tanstack/react-query";
import { postLogin } from "../api/postLogin";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (idToken: string) => postLogin(idToken),
  });
};
