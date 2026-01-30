import { lazy, Suspense } from "react";
import Loader from "@/Components/Global/Loader";

// Lazy load dashboard pages
const DashboardHome = lazy(() => import("@/ERP/Views/Dashboard/DashboardHome"));
const DashboardSalesChart = lazy(() => import("@/ERP/Views/Dashboard/DashboardSalesChart"));
const DashboardRecentOrders = lazy(() => import("@/ERP/Views/Dashboard/DashboardRecentOrders"));
const DashboardActivities = lazy(() => import("@/ERP/Views/Dashboard/DashboardActivities"));

// Wrap in Suspense for lazy loading
const withSuspense = (Component) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

export const dashboardRoutes = [
  { path: "dashboard/home", element: withSuspense(DashboardHome) },
  { path: "dashboard/sales-chart", element: withSuspense(DashboardSalesChart) },
  { path: "dashboard/recent-orders", element: withSuspense(DashboardRecentOrders) },
  { path: "dashboard/activities", element: withSuspense(DashboardActivities) },
];
