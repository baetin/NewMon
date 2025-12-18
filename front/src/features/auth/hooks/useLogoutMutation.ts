import { useMutation } from "@tanstack/react-query";
import { postLogout } from "../api/postLogout";

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: postLogout,
  });
};
