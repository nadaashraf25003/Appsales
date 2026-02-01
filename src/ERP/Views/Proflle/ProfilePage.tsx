import React from "react";
import DefaultProfilePic from "@/assets/default-avatar.png";
import { useNavigate } from "react-router-dom";

interface User {
  name: string;
  email: string;
  role: string;
  tenantId: string;
  branchId: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      const parsedUser = userString ? JSON.parse(userString) : null;
      setUser(parsedUser);
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();

    // window.location.reload(); // or navigate to login page
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark-bg transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-dark-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dark-bg p-6 transition-colors duration-300">
        <div className="card max-w-md mx-auto text-center animate-slideDown">
          <div className="p-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">No User Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please login to view your profile
            </p>
            <button
              onClick={() => window.location.href = '/erp/auth/login'}
              className="btn-primary w-full"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const UserName = user.name || "shadcn";
  const userEmail = user.email || "m@example.com";
  const userRole = user.role || "Admin";
  const userTenantId = user.tenantId || "N/A";
  const userBranchId = user.branchId || "N/A";

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account information
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 animate-slideDown">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
                <div className="relative">
                  <img
                    src={DefaultProfilePic}
                    alt="User Avatar"
                    className="w-32 h-32 rounded-2xl border-4 border-white dark:border-dark-card shadow-lg"
                  />
                  <button className="absolute bottom-2 right-2 bg-primary dark:bg-dark-primary text-white p-2 rounded-full hover:bg-primary/90 dark:hover:bg-dark-primary/80 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold">{UserName}</h2>
                      <p className="text-gray-500 dark:text-gray-400 mt-1">{userEmail}</p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-info/10 text-brand-info mt-2 md:mt-0">
                      {userRole}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 dark:bg-dark-card p-4 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Tenant ID</p>
                      <p className="font-semibold text-lg mt-1">{userTenantId}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-dark-card p-4 rounded-xl">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Branch ID</p>
                      <p className="font-semibold text-lg mt-1">{userBranchId}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="card p-6 animate-slideDown" style={{ animationDelay: "0.1s" }}>
              <h3 className="text-xl font-bold mb-6">Account Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="font-medium">Email Verified</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status of your email verification</p>
                  </div>
                  <span className="flex items-center text-brand-success">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                </div>
                
                {/* <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="font-medium">Member Since</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Account creation date</p>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">January 2024</span>
                </div> */}
                
                {/* <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Last Login</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Most recent login activity</p>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">2 hours ago</span>
                </div> */}
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <div className="card p-6 animate-slideDown" style={{ animationDelay: "0.2s" }}>
              <h3 className="text-lg font-bold mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-card transition-colors flex items-center">
                  <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Account Settings
                </button>
                
                <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-card transition-colors flex items-center">
                  <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Security & Privacy
                </button>
                
                {/* <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-card transition-colors flex items-center">
                  <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Preferences
                </button> */}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card p-6 border border-red-200 dark:border-red-900/50 animate-slideDown" style={{ animationDelay: "0.3s" }}>
              <h3 className="text-lg font-bold mb-4 text-red-600 dark:text-red-400">Danger Zone</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Once you logout, you'll need to sign in again to access your account.
              </p>
              <button
                onClick={handleLogout}
                className="btn-secondary w-full flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
              
              {/* <div className="mt-4 pt-4 border-t border-red-100 dark:border-red-900/30">
                <button className="w-full text-left p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors flex items-center text-sm">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Account
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;