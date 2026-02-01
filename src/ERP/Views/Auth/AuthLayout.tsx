import { Outlet, Link, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";
const AuthLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/erp/auth/login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-info/5 dark:from-dark-bg dark:to-dark-card p-4">
      {/* <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgb(var(--tw-bg-opacity, 1) var(--color-white))',
            color: 'var(--color-dark)',
          },
          className: 'dark:bg-dark-card dark:text-light',
        }}
      /> */}
      
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-info rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-dark dark:text-light">Welcome Back</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {isLoginPage ? "Sign in to your account" : "Create a new account"}
            </p>
          </div>

          <Outlet />
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-600 dark:text-gray-300">
              {isLoginPage ? "Don't have an account?" : "Already have an account?"}
              <Link 
                to={isLoginPage ? "/erp/auth/register" : "/erp/auth/login"} 
                className="text-primary dark:text-dark-primary font-semibold ml-2 hover:underline"
              >
                {isLoginPage ? "Sign up" : "Sign in"}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;