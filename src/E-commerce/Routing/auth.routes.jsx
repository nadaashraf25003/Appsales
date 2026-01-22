import { lazy } from "react";

const Login = lazy(() => import("@/E-commerce/Views/Auth/Login"));
const Register = lazy(() => import("@/E-commerce/Views/Auth/Register"));

export const ecommerceAuthRoutes = [
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
];
