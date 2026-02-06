import { JSX } from "react";
import { Navigate } from "react-router-dom";

interface Props {
  allowedRoles: string[];
  children: JSX.Element;
}

const RequireRole = ({ allowedRoles, children }: Props) => {
  const user = localStorage.getItem("user");
  const role = user ? JSON.parse(user).role : null;
  // console.log("User role in RequireRole:", role);



  // not logged in
  if (!user) {
    return <Navigate to="/erp/auth/login" replace />;
  }

  // role not allowed
if (!allowedRoles.map(r => r.toLowerCase()).includes(role?.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireRole;
