import { lazy } from "react";

const AdminDashboard = lazy(() => import("@/ERP/Views/AdminDashboard"));
const Users = lazy(() => import("@/ERP/Views/Users"));

export const adminRoutes = [
  { path: "dashboard", element: <AdminDashboard /> },
  { path: "users", element: <Users /> },
];
