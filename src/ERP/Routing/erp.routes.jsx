import { lazy, Suspense } from "react";
import Loader from "@/Components/Global/Loader";
import { authRoutes } from "./auth.routes";
import { dashboardRoutes } from "./dashboard.routes";

// Lazy load ERP layout
const ERPLayout = lazy(() => import("@/ERP/Views/ERPLayout"));
const AuthLayout = lazy(() => import("@/ERP/Views/Auth/AuthLayout"));

export const erpRoutes = [
  {
    path: "erp",
    element: (
      <Suspense fallback={<Loader />}>
        <ERPLayout />
      </Suspense>
    ),
    children: [
      // Auth routes (login, register, forgot, etc.)
      {
        path: "auth",
        element: (
          <Suspense fallback={<Loader />}>
            <AuthLayout />
          </Suspense>
        ),
        children: authRoutes,
      },

      // Dashboard routes
      ...dashboardRoutes,
    ],
  },
];
