import { lazy, Suspense } from "react";
import Loader from "@/Components/Global/Loader";
import withRole from "@/Roles/withRole";
import { ROLES } from "@/Roles/roles";

// Lazy loading existing components
const ProductsList = lazy(() => import("@/ERP/Views/Inventory/ProductsList"));
const AddEditProduct = lazy(
  () => import("@/ERP/Views/Inventory/AddEditProduct"),
);
const ProductCategories = lazy(
  () => import("@/ERP/Views/Inventory/ProductCategories"),
);
const SuppliersList = lazy(() => import("@/ERP/Views/Inventory/SuppliersList"));

// New: Lazy loading Material components
const MaterialsList = lazy(() => import("@/ERP/Views/Inventory/MaterialsList"));
const AddEditMaterial = lazy(
  () => import("@/ERP/Views/Inventory/AddEditMaterial"),
);

export const inventoryRoutes = [
  // ... (Your existing products, categories, and suppliers routes)
  {
    path: "inventory/items",
    element: withRole(ProductsList, [
      ROLES.TENANT_OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.SUPER_ADMIN,
    ]),
  },
  {
    path: "inventory/categories",
    element: withRole(ProductCategories, [
      ROLES.TENANT_OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.SUPER_ADMIN,
    ]),
  },
  {
    path: "inventory/items/new",

    element: withRole(AddEditProduct, [
      ROLES.TENANT_OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.SUPER_ADMIN,
    ]),
  },
  {
    path: "inventory/items/:id/edit",
    element: withRole(AddEditProduct, [
      ROLES.TENANT_OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.SUPER_ADMIN,
    ]),
  },

  // NEW: Raw Materials Routes
  {
    path: "inventory/materials",
    element: withRole(MaterialsList, [
      ROLES.TENANT_OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.SUPER_ADMIN,
    ]),
  },
  {
    path: "inventory/materials/new",
    element: withRole(AddEditMaterial, [
      ROLES.TENANT_OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.SUPER_ADMIN,
    ]),
  },
  {
    path: "inventory/materials/:id/edit",
    element: withRole(AddEditMaterial, [
      ROLES.TENANT_OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.SUPER_ADMIN,
    ]),
  },

  {
    path: "inventory/categories",
    element: withRole(ProductCategories, [
      ROLES.TENANT_OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.SUPER_ADMIN,
    ]),
  },
  {
    path: "inventory/suppliers",
    element: withRole(SuppliersList, [
      ROLES.TENANT_OWNER,
      ROLES.BRANCH_MANAGER,
      ROLES.SUPER_ADMIN,
    ]),
  },
];
