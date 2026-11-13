import type { Dispatch, SetStateAction } from "react";
import type { UserType } from "./userType";

export type AuthResult = {
  error?: string;
  resetToken?: string;
  user?: UserType;
  [key: string]: unknown;
};

export interface AuthContextType {
  user: UserType | null;
  accessToken: string | null;
  isLoading: boolean;
  isRestoring: boolean;
  isAuthenticated: boolean;
  register: (
    username: string,
    email: string,
    password: string | number,
  ) => Promise<AuthResult>;
  login: (identifier: string, password: string) => Promise<AuthResult>;
  requestOtp: (email: string) => Promise<AuthResult>;
  verifyOtp: (email: string, otp: string) => Promise<AuthResult>;
  resetPassword: (
    resetToken: string,
    newPassword: string,
    newPassConfirmation: string,
  ) => Promise<AuthResult>;
  resendOtp: (email: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassSuccess: boolean;
  setResetPassSuccess: Dispatch<SetStateAction<boolean>>;
}
