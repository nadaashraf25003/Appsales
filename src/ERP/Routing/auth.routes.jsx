import { lazy } from "react";

const Login = lazy(() => import("@/ERP/Views/Auth/Login"));
const Register = lazy(() => import("@/ERP/Views/Auth/Register"));
const ForgetPassword = lazy(() => import("@/ERP/Views/Auth/ForgetPassword"));
const ResetPassword = lazy(() => import("@/ERP/Views/Auth/ResetPassword"));
const ResendVerification = lazy(() => import("@/ERP/Views/Auth/ResendVerification"));
const VerifyEmail = lazy(() => import("@/ERP/Views/Auth/VerifyEmail"));


export const authRoutes = [
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
  { path: "forgot-password", element: <ForgetPassword /> },
  { path: "reset-password", element: <ResetPassword /> },
  { path: "resend-verification", element: <ResendVerification /> },
  { path: "verify-email", element: <VerifyEmail /> },

];