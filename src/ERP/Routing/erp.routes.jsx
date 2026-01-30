import { lazy, Suspense } from "react";
import Loader from "@/Components/Global/Loader";
import { authRoutes } from "./auth.routes";
import { dashboardRoutes } from "./dashboard.routes";
import { posRoutes } from "./pos.routes";
import { salesRoutes } from "./sales.routes";
import { customerRoutes } from "./customers.routes";
import { accountingRoutes } from "./accounting.routes";
import { tenantsRoutes } from "./tenants.routes";
import { branchesRoutes } from "./branches.routes";
import { inventoryRoutes } from "./inventory.routes"; // Added Inventory Module

// Lazy load ERP layout
const ERPLayout = lazy(() => import("@/ERP/Views/ERPLayout"));
const AuthLayout = lazy(() => import("@/ERP/Views/Auth/AuthLayout"));
const Profile = lazy(() => import("@/ERP/Views/Proflle/ProfilePage"));

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
      {
        path: "profile",
        element: (
          <Suspense fallback={<Loader />}>
            <Profile />
          </Suspense>
        ),
      },

      // Dashboard & Domain Modules
      ...dashboardRoutes,
      ...posRoutes,
      ...salesRoutes,
      ...customerRoutes,
      ...accountingRoutes,
      ...tenantsRoutes,
      ...branchesRoutes,
      ...inventoryRoutes, // Spread Inventory routes: Products, Categories, Suppliers
    ],
  },
];