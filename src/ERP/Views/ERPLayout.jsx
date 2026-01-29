import { Outlet } from "react-router-dom";
import NavbarLayout from "@/Components/Navbar/NavbarLayout";

/**
 * ERPLayout serves as the internal wrapper for all ERP-related views.
 * Since NavbarLayout (in App.jsx) handles the global navigation,
 * this component focuses on the page content transition and spacing.
 */
const ERPLayout = () => {
  return (
    <div className="erp-container">
      {/* If you have a Sidebar or Navbar, they go here */}
      {/* <aside>Sidebarnn</aside>  */}

      <main>
        {/* THIS IS THE KEY: Without this, children won't show! */}
        <NavbarLayout>
          <Outlet />
        </NavbarLayout>
      </main>
    </div>
  );
};

export default ERPLayout;
