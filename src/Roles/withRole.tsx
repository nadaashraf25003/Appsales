import Loader from "@/Components/Global/Loader";
import React, { Suspense } from "react";
import RequireRole from "./RequireRole";

const withRole = (
  Component: React.LazyExoticComponent<any>,
  allowedRoles: string[]
) => (
  <RequireRole allowedRoles={allowedRoles}>
    <Suspense fallback={<Loader />}>
      <Component />
    </Suspense>
  </RequireRole>
);

export default withRole;
