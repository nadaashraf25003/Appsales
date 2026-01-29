import Loader from "@/Components/Global/Loader";
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
  { path: "tenants", element: withSuspense(TenantList) },
  { path: "tenants/create", element: withSuspense(TenantCreate) },
  { path: "tenants/:tenantId/edit", element: withSuspense(TenantEdit) },
  { path: "tenants/:tenantId", element: withSuspense(TenantDetails) },
];
