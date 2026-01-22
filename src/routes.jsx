import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import { lazy } from "react";

import { erpRoutes } from "./ERP/Routing/erp.routes";
import { ecommerceRoutes } from "./E-commerce/Routing/ecommerce.routes";

const Error404 = lazy(() => import("./Components/Global/Error404"));
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      ...ecommerceRoutes,
      ...erpRoutes,
    ],
  },
  { path: "*", element: <Error404 /> }
]);
