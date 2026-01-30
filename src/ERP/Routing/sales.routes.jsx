import { lazy } from "react";

const SalesList = lazy(() => import("../Views/Sales/SalesList")); // Changed from SalesOrdersList
const SalesOrderDetails = lazy(() => import("../Views/Sales/SalesOrderDetails"));
const SalesReturns = lazy(() => import("../Views/Sales/SalesReturns"));

export const salesRoutes = [
  { path: "sales/orders", element: <SalesList /> },
  { path: "sales/orders/:id", element: <SalesOrderDetails /> },
  { path: "sales/returns", element: <SalesReturns /> },
];