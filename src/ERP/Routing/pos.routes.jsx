import { lazy } from "react";

const POSMain = lazy(() => import("../Views/POS/POSMain"));
const POSOrderDetails = lazy(() => import("../Views/POS/POSOrderDetails"));
const POSCustomerSelection = lazy(() => import("../Views/POS/POSCustomerSelection")); // Changed from POSCustomers

export const posRoutes = [
  { path: "sales/pos", element: <POSMain /> },
  { path: "sales/pos/order/:id", element: <POSOrderDetails /> },
  { path: "sales/pos/customers", element: <POSCustomerSelection /> },
];