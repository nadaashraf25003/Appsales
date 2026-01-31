import { lazy } from "react";

// Update these paths to match your actual folder structure
const GeneralSettings = lazy(() => import("@/ERP/Views/Settings/GeneralSettings"));
const FinancialSettings = lazy(() => import("@/ERP/Views/Settings/FinancialSettings"));
const UserManagement = lazy(() => import("@/ERP/Views/Settings/UserManagement"));
const UserEdit = lazy(() => import("@/ERP/Views/Settings/UserEdit"));
const OrgSettings = lazy(() => import("@/ERP/Views/Settings/OrgSettings"));

export const settingsRoutes = [
  {
    path: "settings",
    children: [
      { path: "general", element: <GeneralSettings /> },
      { path: "financial", element: <FinancialSettings /> },
      { path: "users", element: <UserManagement /> },
      { path: "users/:id/edit", element: <UserEdit /> },
      { path: "users/new", element: <UserEdit /> },
      { path: "organization", element: <OrgSettings /> },
    ],
  },
];