import Loader from "@/Components/Global/Loader";
import { ROLES } from "@/Roles/roles";
import withRole from "@/Roles/withRole";
import React, { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Tenant Pages
const TenantList = lazy(() => import("@/ERP/Views/Tenants/TenantList.tsx"));
const TenantCreate = lazy(() => import("@/ERP/Views/Tenants/TenantCreate.tsx"));
const TenantEdit = lazy(() => import("@/ERP/Views/Tenants/TenantEdit.tsx"));
const TenantDetails = lazy(() => import("@/ERP/Views/Tenants/TenantDetails.tsx"));

// Wrap in Suspense for lazy loading
const withSuspense = (Component) => (
  <Suspense fallback={<Loader />}>
    <Component />
  </Suspense>
);

export const tenantsRoutes = [
  { path: "tenants", element: withRole(TenantList, [ROLES.SUPER_ADMIN , ROLES.TENANT_OWNER]) },
  { path: "tenants/create", element: withRole(TenantCreate, [ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER]) },
  { path: "tenants/:tenantId/edit", element: withRole(TenantEdit, [ROLES.SUPER_ADMIN , ROLES.TENANT_OWNER]) },
  { path: "tenants/:tenantId", element: withRole(TenantDetails, [ROLES.SUPER_ADMIN , ROLES.TENANT_OWNER]) },
];
