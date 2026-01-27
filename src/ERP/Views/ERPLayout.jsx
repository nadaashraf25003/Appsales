import { Outlet } from 'react-router-dom';

const ERPLayout = () => {
  return (
    <div className="erp-container">
      {/* If you have a Sidebar or Navbar, they go here */}
      {/* <aside>Sidebarnn</aside>  */}
      
      <main className='bg-red-300 h-52 '>
        {/* THIS IS THE KEY: Without this, children won't show! */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default ERPLayout;