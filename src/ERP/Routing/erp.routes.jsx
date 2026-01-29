import { lazy, Suspense } from "react";
import Loader from "@/Components/Global/Loader";
import { dashboardRoutes } from "./dashboard.routes";

// Lazy load ERP layout

// Import sub-route definitions
import { posRoutes } from "./pos.routes";
import { salesRoutes } from "./sales.routes";
import { customerRoutes } from "./customers.routes";
import { authRoutes } from "./auth.routes";
import { accountingRoutes } from "./accounting.routes"; // Added Accounting module

// Lazy load the Parent Layouts
const ERPLayout = lazy(() => import("@/ERP/Views/ERPLayout"));
const AuthLayout = lazy(() => import("@/ERP/Views/Auth/AuthLayout"));

export const erpRoutes = [
  // 1. ERP Business Routes (Dashboard, POS, Sales, Accounting, etc.)
  // Accessible via /erp/pos, /erp/sales, /erp/accounting, etc.
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
      ...posRoutes,
      ...salesRoutes,
      ...customerRoutes,
      ...accountingRoutes, // Spread the new accounting routes here
    ],
  },

  // 2. ERP Auth Routes (Login, Register, etc.)
  // Accessible via /erp/auth/login, /erp/auth/register
  {
    path: "erp/auth",
    element: (
      <Suspense fallback={<Loader />}>
        <AuthLayout />
      </Suspense>
    ),
    children: authRoutes,
  },
];