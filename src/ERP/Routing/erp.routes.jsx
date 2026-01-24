import { lazy } from "react";
import { adminRoutes } from "./admin.routes";

const ERPLayout = lazy(() => import("@/ERP/Views/ERPLayout"));
const AdminLayout = lazy(() => import("@/ERP/Views/AdminLayout"));

export const erpRoutes = [
  {
    path: "erp",
    element: <ERPLayout />,
    children: [
      {
        path: "admin",
        element: <AdminLayout />,
        children: adminRoutes,
      },
    ],
  },
];
