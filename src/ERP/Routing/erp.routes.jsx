import { lazy } from "react";
import { authRoutes } from "./auth.routes";

const ERPLayout = lazy(() => import("@/ERP/Views/ERPLayout"));
const AuthLayout = lazy(() => import("@/ERP/Views/Auth/AuthLayout"));

export const erpRoutes = [
  {
    path: "erp",
    element: <ERPLayout />,
    children: [
      {
        path: "auth",
        element: <AuthLayout />,
        children: authRoutes,
      },
    ],
  },
];
