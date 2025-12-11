import { useMutation } from "@tanstack/react-query";
import { postLogout } from "@/app/layout/Navbar/api/postLogout";

export const useLogoutMutation = () => {
  return useMutation<void, Error, void>({
    mutationFn: postLogout,
  });
};
