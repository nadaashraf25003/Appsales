import { Outlet } from "react-router-dom";

/**
 * ERPLayout serves as the internal wrapper for all ERP-related views.
 * Since NavbarLayout (in App.jsx) handles the global navigation,
 * this component focuses on the page content transition and spacing.
 */
const ERPLayout = () => {
  return (
    <main className="erp-content-container animate__animated animate__fadeIn">
      {/* The Outlet is where all child routes (POS, Sales, etc.) 
          will be rendered. 
      */}
      <div className="p-1 md:p-4">
        <Outlet />
      </div>
    </main>
  );
};

export default ERPLayout;