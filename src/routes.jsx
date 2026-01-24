import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "@/App";

// Import your module route arrays
import { erpRoutes } from "./ERP/Routing/erp.routes";
import { ecommerceRoutes } from "./E-commerce/Routing/ecommerce.routes";

// UI Components
import Loader from "./Components/Global/Loader.jsx";
const Error404 = lazy(() => import("./Components/Global/Error404"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App.jsx wraps all children below
    children: [
      // 1. E-commerce Module Routes
      ...ecommerceRoutes,
      
      // 2. ERP Module Routes
      ...erpRoutes,
    ],
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<Loader />}>
        <Error404 />
      </Suspense>
    ),
  },
]);