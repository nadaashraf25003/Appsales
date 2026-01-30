/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import api from "@/API/Config";
import Urls from "@/API/URLs";
import { setToken, clearToken } from "@/API/token";
import toast from "react-hot-toast";

/* =======================
   Types
======================= */

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
 name: string;
  email: string;
  password: string;
  role: "TenantOwner" | "SuperAdmin" | "BranchManager" | "Cashier" | "Accountant";
  tenantId: number;
  branchId: number;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

/* =======================
   Hook
======================= */

const useAuth = () => {
  // Login
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await api.post(Urls.AUTH.LOGIN, data);
      return res.data;
    },
    onSuccess: (data) => {
      setToken(data.token);
    },
  });

  // Register
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await api.post(Urls.AUTH.REGISTER, data);
      return res.data;
    },
  });

  // Verify Email
  const verifyEmailMutation = useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const res = await api.post(Urls.AUTH.VERIFY_EMAIL, data);
      return res.data;
    },
    onSuccess: (data) => {
      setToken(data.token);
    },
  });

  // Forgot Password
  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await api.post(Urls.AUTH.FORGOT_PASSWORD, { email });
      return res.data;
    },
  });

  // Reset Password
  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const res = await api.post(Urls.AUTH.RESET_PASSWORD, data);
      return res.data;
    },
  });

  // Refresh Token
  const refreshTokenMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(Urls.AUTH.REFRESH_TOKEN);
      return res.data;
    },
    onSuccess: (data) => {
      setToken(data.token);
    },
  });

  // Resend Verification Code
  const resendVerificationMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await api.post(Urls.AUTH.RESEND_VERIFICATION, { email });
      return res.data;
    },
  });

  // Logout
  const logout = () => {
    clearToken();
  };

  // Approve User (SuperAdmin only)
  const approveUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await api.put(`${Urls.AUTH.APPROVE_USER}/${userId}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "User approved successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to approve user");
    },
  });


  return {
    loginMutation,
    registerMutation,
    verifyEmailMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    refreshTokenMutation,
    resendVerificationMutation,
     approveUserMutation,
    logout,
  };
};

export default useAuth;