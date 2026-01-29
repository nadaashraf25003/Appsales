import { Outlet } from "react-router-dom";
import NavbarLayout from "@/Components/Navbar/NavbarLayout";

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
