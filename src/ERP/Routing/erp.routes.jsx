import { posRoutes } from "./pos.routes";
import { salesRoutes } from "./sales.routes";
import { customerRoutes } from "./customers.routes";

export const erpRoutes = [
  {
    path: "erp",
    children: [
      ...posRoutes,
      ...salesRoutes,
      ...customerRoutes,
    ],
  },
];