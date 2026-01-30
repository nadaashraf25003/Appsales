// src/ERP/Routing/branches.routes.tsx
import Loader from "@/Components/Global/Loader";
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
  { path: "branches", element: withSuspense(BranchList) },
  { path: "branches/create", element: withSuspense(BranchCreate) },
  { path: "branches/:branchId/edit", element: withSuspense(BranchEdit) },
  { path: "users", element: withSuspense(UsersList) },
];
