import { lazy } from "react";

const Login = lazy(() => import("@/E-commerce/Views/Auth/Login"));
const Register = lazy(() => import("@/E-commerce/Views/Auth/Register"));

// Ensure this name matches the importer exactly
export const ecommerceAuthRoutes = [
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
];