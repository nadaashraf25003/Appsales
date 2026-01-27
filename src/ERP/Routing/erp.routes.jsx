import { authRoutes } from "./auth.routes";


import { lazy, Suspense } from "react";
import Loader from "@/Components/Global/Loader";

const ERPLayout = lazy(() => import("@/ERP/Views/ERPLayout"));
const AuthLayout = lazy(() => import("@/ERP/Views/Auth/AuthLayout.tsx"));

export const erpRoutes = [
  {
    path: "erp",
    element: (
      <Suspense fallback={<Loader />}>
        <ERPLayout />
      </Suspense>
    ),
    children: [
      {
        path: "auth",
        element: (
          <Suspense fallback={<Loader />}>
            <AuthLayout />
          </Suspense>
        ),
        children: authRoutes,
      },
    ],
  },
];
