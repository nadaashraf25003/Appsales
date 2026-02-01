import { lazy, Suspense } from "react";
import Loader from "@/Components/Global/Loader";
import withRole from "@/Roles/withRole";
import { ROLES } from "@/Roles/roles";

// Lazy load dashboard pages
const DashboardHome = lazy(() => import("@/ERP/Views/Dashboard/DashboardHome"));
const DashboardSalesChart = lazy(
  () => import("@/ERP/Views/Dashboard/DashboardSalesChart"),
);
const DashboardRecentOrders = lazy(
  () => import("@/ERP/Views/Dashboard/DashboardRecentOrders"),
);
const DashboardActivities = lazy(
  () => import("@/ERP/Views/Dashboard/DashboardActivities"),
);

// Wrap in Suspense for lazy loading
const withSuspense = (Component) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

export const dashboardRoutes = [
  {
    path: "dashboard/home",
    element: withRole(DashboardHome, [ROLES.TENANT_OWNER , ROLES.BRANCH_MANAGER , ROLES.ACCOUNTANT , ROLES.SUPER_ADMIN]),
  },
  {
    path: "dashboard/sales-chart",
    element: withRole(DashboardSalesChart, [ROLES.TENANT_OWNER , ROLES.ACCOUNTANT , ROLES.SUPER_ADMIN]),
  },
  {
    path: "dashboard/recent-orders",
    element: withRole(DashboardRecentOrders, [ROLES.TENANT_OWNER, ROLES.ACCOUNTANT , ROLES.SUPER_ADMIN , ROLES.CASHIER, ROLES.BRANCH_MANAGER]),
  },
  {
    path: "dashboard/activities",
    element: withRole(DashboardActivities, [ROLES.TENANT_OWNER, ROLES.ACCOUNTANT , ROLES.SUPER_ADMIN , ROLES.CASHIER, ROLES.BRANCH_MANAGER]),
  },
];
