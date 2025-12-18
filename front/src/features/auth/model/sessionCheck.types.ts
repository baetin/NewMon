import type { LoginUser } from "@/shared/types/loginUser.types";

export interface SessionCheckProps extends LoginUser {
  isAuthenticated: boolean;
  message: string;
}
