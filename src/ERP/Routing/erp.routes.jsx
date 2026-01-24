import { lazy } from "react";
import { adminRoutes } from "./admin.routes";

// Layouts
const ERPLayout = lazy(() => import("@/ERP/Views/ERPLayout"));
const AdminLayout = lazy(() => import("@/ERP/Views/AdminLayout"));

// POS Pages
const POSMain = lazy(() => import("@/ERP/Views/POS/POSMain"));
const POSOrderDetails = lazy(() => import("@/ERP/Views/POS/POSOrderDetails"));
const POSCustomerSelection = lazy(() => import("@/ERP/Views/POS/POSCustomerSelection"));

// Sales Pages
const SalesList = lazy(() => import("@/ERP/Views/Sales/SalesList"));
const SalesOrderDetails = lazy(() => import("@/ERP/Views/Sales/SalesOrderDetails"));
const SalesReturns = lazy(() => import("@/ERP/Views/Sales/SalesReturns"));

// Customer Pages
const CustomersList = lazy(() => import("@/ERP/Views/Customers/CustomersList"));
const AddEditCustomer = lazy(() => import("@/ERP/Views/Customers/AddEditCustomer"));
const CustomerDetails = lazy(() => import("@/ERP/Views/Customers/CustomerDetails"));

export const erpRoutes = [
  {
    path: "erp",
    element: <ERPLayout />,
    children: [
      // Admin nested routes
      {
        path: "admin",
        element: <AdminLayout />,
        children: adminRoutes,
      },

      // --- POS Section (Matches your paths) ---
      {
        path: "sales/pos",
        children: [
          { index: true, element: <POSMain /> }, // Path: /erp/sales/pos
          { path: "order/:id", element: <POSOrderDetails /> }, // Path: /erp/sales/pos/order/:id
          { path: "customers", element: <POSCustomerSelection /> }, // Path: /erp/sales/pos/customers
        ],
      },

      // --- Sales / Orders Section (Matches your paths) ---
      {
        path: "sales",
        children: [
          { path: "orders", element: <SalesList /> }, // Path: /erp/sales/orders
          { path: "orders/:id", element: <SalesOrderDetails /> }, // Path: /erp/sales/orders/:id
          { path: "returns", element: <SalesReturns /> }, // Path: /erp/sales/returns
        ],
      },

      // --- Customers Section (Matches your paths) ---
      {
        path: "sales/customers",
        children: [
          { index: true, element: <CustomersList /> }, // Path: /erp/sales/customers
          { path: ":id/edit", element: <AddEditCustomer /> }, // Path: /erp/sales/customers/:id/edit
          { path: ":id", element: <CustomerDetails /> }, // Path: /erp/sales/customers/:id
        ],
      },
    ],
  },
];
