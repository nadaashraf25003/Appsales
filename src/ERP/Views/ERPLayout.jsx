import { Outlet } from 'react-router-dom';

const ERPLayout = () => {
  return (
    <div className="erp-container">
      {/* If you have a Sidebar or Navbar, they go here */}
      {/* <aside>Sidebarnn</aside>  */}
      
      <main>
        {/* THIS IS THE KEY: Without this, children won't show! */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default ERPLayout;