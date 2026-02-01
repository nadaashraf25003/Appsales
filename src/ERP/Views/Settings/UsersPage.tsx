import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import api from "@/API/Config";
import Urls from "@/API/URLs";
import useUsers, { UserDto } from "@/Hooks/useUsers";

interface User {
  name: string;
  email: string;
  role: string;
  tenantId: number;
  branchId: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [activatingUserIds, setActivatingUserIds] = useState<number[]>([]);
  const [deletingUserIds, setDeletingUserIds] = useState<number[]>([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserDto | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [userToApprove, setUserToApprove] = useState<UserDto | null>(null);

  // Tenant ID input state
  const [tenantIdInput, setTenantIdInput] = useState<string>("");
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [isManualTenant, setIsManualTenant] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get current user from localStorage
  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      const parsedUser = userString ? JSON.parse(userString) : null;
      setCurrentUser(parsedUser);
      
      // Pre-fill tenant ID from current user if available
      if (parsedUser?.tenantId) {
        setTenantId(parsedUser.tenantId);
        setTenantIdInput(parsedUser.tenantId.toString());
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      toast.error("Failed to load user data");
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  const { deleteUserMutation } = useUsers();

  // Fetch users for the specific tenant
  const fetchUsers = (targetTenantId: number) => {
    if (!targetTenantId) {
      toast.error("Please enter a valid tenant ID");
      return;
    }

    setLoading(true);
    api
      .get(`${Urls.USERS.GET_BY_TENANT(targetTenantId)}`)
      .then((res) => {
        const data = res.data.data;
        setUsers(Array.isArray(data) ? data : []);
        toast.success(`Loaded users for tenant ${targetTenantId}`);
      })
      .catch((err) => {
        const errorMessage = err?.response?.data?.message || err?.message || "Failed to fetch users";
        toast.error(errorMessage);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  // Handle tenant ID submission
  const handleTenantIdSubmit = () => {
    const id = parseInt(tenantIdInput);
    if (isNaN(id) || id <= 0) {
      toast.error("Please enter a valid positive number for tenant ID");
      return;
    }
    setTenantId(id);
    setIsManualTenant(true);
    fetchUsers(id);
  };

  // Use current user's tenant ID on initial load
  useEffect(() => {
    if (currentUser?.tenantId && !isManualTenant && !tenantId) {
      setTenantId(currentUser.tenantId);
      fetchUsers(currentUser.tenantId);
    }
  }, [currentUser, isManualTenant, tenantId]);

  // Filter users based on status
  const pendingUsers = users.filter(user => !user.isActive);
  const approvedUsers = users.filter(user => user.isActive);

  // Approve mutation
  const approveUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await api.put(`${Urls.AUTH.APPROVE_USER}/${userId}`);
      return res.data;
    },
    onSuccess: (data, userId) => {
      toast.success(data?.message || "User approved successfully!");
      // Refresh users after approval
      if (tenantId) fetchUsers(tenantId);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to approve user");
    },
    onSettled: () => {
      setActivatingUserIds([]);
      setShowApproveModal(false);
      setUserToApprove(null);
    },
  });

  // Open approve modal
  const confirmApprove = (user: UserDto) => {
    setUserToApprove(user);
    setShowApproveModal(true);
  };

  // Handle approve
  const handleApprove = () => {
    if (!userToApprove) return;
    setActivatingUserIds((prev) => [...prev, userToApprove.id]);
    approveUserMutation.mutate(userToApprove.id);
  };

  // Open delete modal
  const confirmDelete = (user: UserDto) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // Handle delete
  const handleDelete = () => {
    if (!userToDelete) return;
    setDeletingUserIds((prev) => [...prev, userToDelete.id]);
    deleteUserMutation.mutate(userToDelete.id, {
      onSuccess: () => {
        toast.success("User deleted successfully!");
        // Refresh users after deletion
        if (tenantId) fetchUsers(tenantId);
      },
      onError: () => {
        toast.error("Failed to delete user");
      },
      onSettled: () => {
        setDeletingUserIds((prev) =>
          prev.filter((id) => id !== userToDelete.id)
        );
        setShowDeleteModal(false);
        setUserToDelete(null);
      },
    });
  };

  // Toggle between active and inactive users
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  // Reset to current user's tenant
  const handleResetTenant = () => {
    if (currentUser?.tenantId) {
      setTenantIdInput(currentUser.tenantId.toString());
      setTenantId(currentUser.tenantId);
      setIsManualTenant(false);
      fetchUsers(currentUser.tenantId);
      // toast.info("Reset to your tenant ID");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-light dark:bg-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col gap-3 md:gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-light mb-1 md:mb-2">
                User Management
              </h1>
              <p className="text-sm md:text-base text-brand-info">
                Manage users across different tenants
              </p>
            </div>
            
          </div>
        </div>

        {/* Tenant Selection Card */}
        <div className="card mb-6 md:mb-8 p-4 md:p-6">
          <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center justify-between">
            <div className="mb-3 md:mb-0">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-light mb-1">
                Select Tenant
              </h2>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Enter a tenant ID to view and manage its users
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-grow sm:flex-grow-0">
                <div className="flex items-center">
                  <div className="absolute left-3 text-gray-400">
                    <span className="text-xs md:text-sm">ID</span>
                  </div>
                  <input
                    type="number"
                    value={tenantIdInput}
                    onChange={(e) => setTenantIdInput(e.target.value)}
                    placeholder="Enter tenant ID"
                    className="input pl-10 pr-4 py-2 w-full sm:w-40 md:w-48"
                    min="1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleTenantIdSubmit();
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleTenantIdSubmit}
                  className="btn-primary px-4 md:px-6 py-2 flex-1 sm:flex-none text-sm md:text-base"
                  disabled={!tenantIdInput.trim()}
                >
                  {isMobile ? 'Load' : 'Load Users'}
                </button>
                
                {currentUser?.tenantId && (
                  <button
                    onClick={handleResetTenant}
                    className="px-3 md:px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-xs md:text-sm flex items-center justify-center"
                    title="Reset to your tenant"
                  >
                    {isMobile ? '↺' : 'Reset'}
                  </button>
                )}
              </div>
            </div>
          </div>

 
        </div>

        {/* Stats Cards - Only show when tenant is selected */}
        {tenantId ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="card p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-light">{users.length}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg md:text-xl text-primary dark:text-dark-primary">👥</span>
                  </div>
                </div>
              </div>

              <div className="card p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Pending Approval</p>
                    <p className="text-xl md:text-2xl font-bold text-brand-warning">{pendingUsers.length}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-warning/10 dark:bg-dark-warning/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg md:text-xl text-warning dark:text-dark-warning">⏳</span>
                  </div>
                </div>
              </div>

              <div className="card p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Approved Users</p>
                    <p className="text-xl md:text-2xl font-bold text-brand-success">{approvedUsers.length}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-success/10 dark:bg-dark-success/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg md:text-xl text-success dark:text-dark-success">✓</span>
                  </div>
                </div>
              </div>

              <div className="card p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Tenant ID</p>
                    <p className="text-xl md:text-2xl font-bold text-brand-info">{tenantId}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-info/10 dark:bg-dark-info/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg md:text-xl text-info dark:text-dark-info">🏢</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation - Responsive */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 md:mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-1 min-w-[140px] sm:min-w-0 ${
                  activeTab === 'pending'
                    ? 'border-warning text-warning dark:border-dark-warning dark:text-dark-warning'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Pending ({pendingUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-1 min-w-[140px] sm:min-w-0 ${
                  activeTab === 'approved'
                    ? 'border-success text-success dark:border-dark-success dark:text-dark-success'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Approved ({approvedUsers.length})
              </button>
            </div>

            {/* Pending Users Section - Mobile Optimized */}
            {activeTab === 'pending' && (
              <div className="card overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-center justify-between">
                    <div>
                      <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-light mb-1">
                        Pending Approval
                      </h2>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Users waiting for approval
                      </p>
                    </div>
                    {pendingUsers.length > 0 && (
                      <div className="px-3 py-1 md:px-4 md:py-2 rounded-full bg-warning/10 dark:bg-dark-warning/20 text-warning dark:text-dark-warning text-xs md:text-sm font-medium whitespace-nowrap">
                        {pendingUsers.length} pending
                      </div>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto -mx-4 md:mx-0">
                  {loading ? (
                    <div className="p-6 md:p-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-dark-primary"></div>
                      <p className="mt-2 text-sm md:text-base text-gray-500 dark:text-gray-400">Loading users...</p>
                    </div>
                  ) : pendingUsers.length === 0 ? (
                    <div className="p-6 md:p-8 text-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-success/10 dark:bg-dark-success/20 flex items-center justify-center">
                        <span className="text-xl md:text-2xl">🎉</span>
                      </div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        All clear!
                      </h3>
                      <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                        No pending users for tenant {tenantId}
                      </p>
                    </div>
                  ) : isMobile ? (
                    // Mobile Card View
                    <div className="p-4 space-y-4">
                      {pendingUsers.map((user) => (
                        <div key={user.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="text-primary dark:text-dark-primary font-semibold">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-800 dark:text-light truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 whitespace-nowrap ml-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1"></span>
                              Pending
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Role</p>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary">
                                {user.role}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID</p>
                              <p className="text-sm font-medium text-gray-800 dark:text-light">
                                {user.id}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => confirmApprove(user)}
                              disabled={activatingUserIds.includes(user.id)}
                              className="btn-primary px-3 py-2 text-xs flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {activatingUserIds.includes(user.id) ? (
                                <span className="flex items-center justify-center">
                                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></span>
                                  Approving
                                </span>
                              ) : (
                                "Approve"
                              )}
                            </button>
                            <button
                              onClick={() => confirmDelete(user)}
                              disabled={deletingUserIds.includes(user.id)}
                              className="btn-secondary px-3 py-2 text-xs flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingUserIds.includes(user.id) ? (
                                <span className="flex items-center justify-center">
                                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></span>
                                  Deleting
                                </span>
                              ) : (
                                "Delete"
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Desktop Table View
                    <table className="w-full min-w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="p-3 md:p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            User Details
                          </th>
                          <th className="p-3 md:p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="p-3 md:p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="p-3 md:p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {pendingUsers.map((user) => (
                          <tr 
                            key={user.id} 
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="p-3 md:p-4">
                              <div className="flex items-center">
                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center mr-3 flex-shrink-0">
                                  <span className="text-primary dark:text-dark-primary font-semibold text-sm md:text-base">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-800 dark:text-light text-sm md:text-base truncate">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user.email}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                      ID: {user.id}
                                    </p>
                                    <p className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                      T: {user.tenantId || tenantId}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 md:p-4">
                              <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary">
                                {user.role}
                              </span>
                            </td>
                            <td className="p-3 md:p-4">
                              <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-red-500 mr-1 md:mr-2"></span>
                                Pending
                              </span>
                            </td>
                            <td className="p-3 md:p-4">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <button
                                  onClick={() => confirmApprove(user)}
                                  disabled={activatingUserIds.includes(user.id)}
                                  className="btn-primary px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {activatingUserIds.includes(user.id) ? (
                                    <span className="flex items-center justify-center">
                                      <span className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white mr-1 md:mr-2"></span>
                                      Approving
                                    </span>
                                  ) : (
                                    "Approve User"
                                  )}
                                </button>
                                <button
                                  onClick={() => confirmDelete(user)}
                                  disabled={deletingUserIds.includes(user.id)}
                                  className="btn-secondary px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {deletingUserIds.includes(user.id) ? (
                                    <span className="flex items-center justify-center">
                                      <span className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white mr-1 md:mr-2"></span>
                                      Deleting
                                    </span>
                                  ) : (
                                    "Delete"
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Approved Users Section - Mobile Optimized */}
            {activeTab === 'approved' && (
              <div className="card overflow-hidden">
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-center justify-between">
                    <div>
                      <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-light mb-1">
                        Approved Users
                      </h2>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Users with active access
                      </p>
                    </div>
                    {approvedUsers.length > 0 && (
                      <div className="px-3 py-1 md:px-4 md:py-2 rounded-full bg-success/10 dark:bg-dark-success/20 text-success dark:text-dark-success text-xs md:text-sm font-medium whitespace-nowrap">
                        {approvedUsers.length} active
                      </div>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto -mx-4 md:mx-0">
                  {loading ? (
                    <div className="p-6 md:p-8 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-dark-primary"></div>
                      <p className="mt-2 text-sm md:text-base text-gray-500 dark:text-gray-400">Loading users...</p>
                    </div>
                  ) : approvedUsers.length === 0 ? (
                    <div className="p-6 md:p-8 text-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-warning/10 dark:bg-dark-warning/20 flex items-center justify-center">
                        <span className="text-xl md:text-2xl">📝</span>
                      </div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        No approved users
                      </h3>
                      <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                        No approved users for tenant {tenantId}
                      </p>
                    </div>
                  ) : isMobile ? (
                    // Mobile Card View
                    <div className="p-4 space-y-4">
                      {approvedUsers.map((user) => (
                        <div key={user.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-success/10 dark:bg-dark-success/20 flex items-center justify-center mr-3 flex-shrink-0">
                                <span className="text-success dark:text-dark-success font-semibold">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-800 dark:text-light truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 whitespace-nowrap ml-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>
                              Active
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Role</p>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary">
                                {user.role}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID</p>
                              <p className="text-sm font-medium text-gray-800 dark:text-light">
                                {user.id}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => confirmDelete(user)}
                              disabled={deletingUserIds.includes(user.id)}
                              className="btn-secondary px-3 py-2 text-xs w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingUserIds.includes(user.id) ? (
                                <span className="flex items-center justify-center">
                                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></span>
                                  Deleting
                                </span>
                              ) : (
                                "Delete User"
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Desktop Table View
                    <table className="w-full min-w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800">
                          <th className="p-3 md:p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            User Details
                          </th>
                          <th className="p-3 md:p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="p-3 md:p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="p-3 md:p-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {approvedUsers.map((user) => (
                          <tr 
                            key={user.id} 
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="p-3 md:p-4">
                              <div className="flex items-center">
                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-success/10 dark:bg-dark-success/20 flex items-center justify-center mr-3 flex-shrink-0">
                                  <span className="text-success dark:text-dark-success font-semibold text-sm md:text-base">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-800 dark:text-light text-sm md:text-base truncate">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user.email}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                      ID: {user.id}
                                    </p>
                                    <p className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                      T: {user.tenantId || tenantId}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 md:p-4">
                              <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary">
                                {user.role}
                              </span>
                            </td>
                            <td className="p-3 md:p-4">
                              <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 mr-1 md:mr-2"></span>
                                Active
                              </span>
                            </td>
                            <td className="p-3 md:p-4">
                              <div className="flex">
                                <button
                                  onClick={() => confirmDelete(user)}
                                  disabled={deletingUserIds.includes(user.id)}
                                  className="btn-secondary px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {deletingUserIds.includes(user.id) ? (
                                    <span className="flex items-center justify-center">
                                      <span className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white mr-1 md:mr-2"></span>
                                      Deleting
                                    </span>
                                  ) : (
                                    "Delete User"
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Welcome/Instructions Card when no tenant is selected */
          <div className="card text-center p-6 md:p-8">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center">
              <span className="text-2xl md:text-3xl text-primary dark:text-dark-primary">🏢</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-light mb-3 md:mb-4">
              Welcome to User Management
            </h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6 max-w-lg mx-auto">
              Enter a tenant ID above to view and manage users. You can use your own tenant ID or enter a different one to manage users from other tenants.
            </p>
            {currentUser?.tenantId && (
              <div className="inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Your tenant ID:</span>
                <span className="font-semibold text-primary dark:text-dark-primary">
                  {currentUser.tenantId}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Modals - Responsive */}
        {showApproveModal && userToApprove && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 dark:bg-black/70 z-50 animate-slideDown p-4">
            <div className="card max-w-md w-full mx-auto">
              <div className="mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-success/10 dark:bg-dark-success/20 flex items-center justify-center">
                  <span className="text-xl md:text-2xl text-success dark:text-dark-success">✓</span>
                </div>
                <h2 className="text-lg md:text-2xl font-bold text-center text-gray-800 dark:text-light mb-1 md:mb-2">
                  Approve User
                </h2>
                <p className="text-sm md:text-base text-center text-gray-600 dark:text-gray-400">
                  Are you sure you want to approve this user?
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
                <div className="flex items-center mb-2 md:mb-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
                    <span className="text-primary dark:text-dark-primary font-semibold text-sm md:text-base">
                      {userToApprove.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-light text-sm md:text-base truncate">
                      {userToApprove.name}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {userToApprove.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Role:</span>
                    <span className="font-medium text-gray-800 dark:text-light">
                      {userToApprove.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tenant:</span>
                    <span className="font-medium text-gray-800 dark:text-light">
                      {tenantId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 md:gap-3">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setUserToApprove(null);
                  }}
                  className="px-4 py-2 md:px-6 md:py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={activatingUserIds.includes(userToApprove.id)}
                  className="btn-primary px-4 py-2 md:px-6 md:py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {activatingUserIds.includes(userToApprove.id) ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white mr-1 md:mr-2"></span>
                      {isMobile ? '' : 'Approving'}
                    </span>
                  ) : (
                    "Approve"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 dark:bg-black/70 z-50 animate-slideDown p-4">
            <div className="card max-w-md w-full mx-auto">
              <div className="mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-secondary/10 dark:bg-dark-secondary/20 flex items-center justify-center">
                  <span className="text-xl md:text-2xl text-secondary dark:text-dark-secondary">⚠️</span>
                </div>
                <h2 className="text-lg md:text-2xl font-bold text-center text-gray-800 dark:text-light mb-1 md:mb-2">
                  Delete User
                </h2>
                <p className="text-sm md:text-base text-center text-gray-600 dark:text-gray-400">
                  This action cannot be undone. Are you sure?
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
                <div className="flex items-center mb-2 md:mb-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
                    <span className="text-primary dark:text-dark-primary font-semibold text-sm md:text-base">
                      {userToDelete.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-light text-sm md:text-base truncate">
                      {userToDelete.name}
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                      {userToDelete.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Role:</span>
                    <span className="font-medium text-gray-800 dark:text-light">
                      {userToDelete.role}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    <span className={`font-medium ${
                      userToDelete.isActive 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-warning dark:text-dark-warning'
                    }`}>
                      {userToDelete.isActive ? 'Active' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Tenant:</span>
                    <span className="font-medium text-gray-800 dark:text-light">
                      {tenantId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 md:gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="px-4 py-2 md:px-6 md:py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deletingUserIds.includes(userToDelete.id)}
                  className="btn-secondary px-4 py-2 md:px-6 md:py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingUserIds.includes(userToDelete.id) ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white mr-1 md:mr-2"></span>
                      {isMobile ? '' : 'Deleting'}
                    </span>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}