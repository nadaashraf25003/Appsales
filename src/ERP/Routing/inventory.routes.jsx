import { lazy, Suspense } from "react";
import Loader from "@/Components/Global/Loader";

// Lazy loading existing components
const ProductsList = lazy(() => import("@/ERP/Views/Inventory/ProductsList"));
const AddEditProduct = lazy(() => import("@/ERP/Views/Inventory/AddEditProduct"));
const ProductCategories = lazy(() => import("@/ERP/Views/Inventory/ProductCategories"));
const SuppliersList = lazy(() => import("@/ERP/Views/Inventory/SuppliersList"));

// New: Lazy loading Material components
const MaterialsList = lazy(() => import("@/ERP/Views/Inventory/MaterialsList"));
const AddEditMaterial = lazy(() => import("@/ERP/Views/Inventory/AddEditMaterial"));

export const inventoryRoutes = [
  // ... (Your existing products, categories, and suppliers routes)
  {
    path: "inventory/items",
    element: (
      <Suspense fallback={<Loader />}>
        <ProductsList />
      </Suspense>
    ),
  },
  {
    path: "inventory/items/new",
    element: (
      <Suspense fallback={<Loader />}>
        <AddEditProduct />
      </Suspense>
    ),
  },
  {
    path: "inventory/items/:id/edit",
    element: (
      <Suspense fallback={<Loader />}>
        <AddEditProduct />
      </Suspense>
    ),
  },

  // NEW: Raw Materials Routes
  {
    path: "inventory/materials",
    element: (
      <Suspense fallback={<Loader />}>
        <MaterialsList />
      </Suspense>
    ),
  },
  {
    path: "inventory/materials/new",
    element: (
      <Suspense fallback={<Loader />}>
        <AddEditMaterial />
      </Suspense>
    ),
  },
  {
    path: "inventory/materials/:id/edit",
    element: (
      <Suspense fallback={<Loader />}>
        <AddEditMaterial />
      </Suspense>
    ),
  },

  {
    path: "inventory/categories",
    element: (
      <Suspense fallback={<Loader />}>
        <ProductCategories />
      </Suspense>
    ),
  },
  {
    path: "inventory/suppliers",
    element: (
      <Suspense fallback={<Loader />}>
        <SuppliersList />
      </Suspense>
    ),
  },
];