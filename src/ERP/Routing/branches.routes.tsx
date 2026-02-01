// src/ERP/Routing/branches.routes.tsx
import Loader from "@/Components/Global/Loader";
import { ROLES } from "@/Roles/roles";
import withRole from "@/Roles/withRole";
import React, { lazy, Suspense } from "react";

// Branch Pages
const BranchList = lazy(() => import("@/ERP/Views/Branches/BranchListPage"));
const BranchCreate = lazy(() => import("@/ERP/Views/Branches/BranchCreatePage"));
const BranchEdit = lazy(() => import("@/ERP/Views/Branches/BranchUpdatePage"));
const UsersList = lazy(() => import("@/ERP/Views/Settings/UsersPage"));

// Wrap in Suspense for lazy loading
const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

export const branchesRoutes = [
  { path: "branches", element: withRole(BranchList, [ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER, ROLES.TENANT_OWNER]) },
  { path: "branches/create", element: withRole(BranchCreate, [ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER, ROLES.TENANT_OWNER]) },
  { path: "branches/:branchId/edit", element: withRole(BranchEdit, [ROLES.SUPER_ADMIN, ROLES.BRANCH_MANAGER, ROLES.TENANT_OWNER]) },
  { path: "users", element: withRole(UsersList, [ROLES.SUPER_ADMIN]  ) },
];
