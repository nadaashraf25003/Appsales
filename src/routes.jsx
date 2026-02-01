import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "@/App";

// Import your module route arrays
import { erpRoutes } from "./ERP/Routing/erp.routes";
import { ecommerceRoutes } from "./E-commerce/Routing/ecommerce.routes";

// UI Components
import Loader from "./Components/Global/Loader.jsx";
import Unauthorized from "./Roles/Unauthorized";
const Error404 = lazy(() => import("./Components/Global/Error404"));
const Landing = lazy(() => import("./Landing/LandingPage"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App.jsx wraps all children below
    children: [
      { index: true, element: <Landing /> },
      // 1. E-commerce Module Routes
      ...ecommerceRoutes,
      
      // 2. ERP Module Routes
      ...erpRoutes,
    ],
  },
  {
    path: "unauthorized",
    element: (
      <Suspense fallback={<Loader />}>
        <Unauthorized />
      </Suspense>
    ),
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