import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import useTenants from "@/Hooks/useTenants";
import api from "@/API/Config";
import Urls from "@/API/URLs";

interface Branch {
  id: number;
  name: string;
  isActive: boolean;
  address?: string;
  email?: string;
  phone?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  currency: string;
  taxRate: number;
  isActive: boolean;
  createdAt: string;
}

const TenantDetails = () => {
  const tenantIdParam = useParams<{ tenantId: string }>().tenantId;
  const tenantIdNum = tenantIdParam ? parseInt(tenantIdParam, 10) : null;
  const navigate = useNavigate();
  const { getTenantByIdMutation } = useTenants();
  
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState({
    tenant: true,
    branches: true,
    users: true
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'branches' | 'users'>('overview');
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

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantIdNum) return;
      
      try {
        // Fetch tenant
        const tenantRes = await getTenantByIdMutation.mutateAsync(Number(tenantIdNum));
        setTenant(tenantRes.data);
        setLoading(prev => ({ ...prev, tenant: false }));

        // Fetch branches
        const branchesRes = await api.get(Urls.BRANCHES.GET_BY_TENANT(tenantIdNum));
        setBranches(branchesRes.data.data);
        setLoading(prev => ({ ...prev, branches: false }));

        // Fetch users
        const usersRes = await api.get(Urls.USERS.GET_BY_TENANT(tenantIdNum));
        setUsers(usersRes.data.data);
        setLoading(prev => ({ ...prev, users: false }));
        
      } catch (error) {
        console.error("Failed to fetch tenant details:", error);
        setLoading({ tenant: false, branches: false, users: false });
      }
    };
    
    fetchData();
  }, [tenantIdNum]);

  const handleEdit = () => {
    navigate(`/erp/tenants/${tenantIdNum}/edit`);
  };

  const handleBack = () => {
    navigate("/erp/tenants");
  };

  if (loading.tenant) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="text-center">
          <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-800 dark:text-light mb-2">Tenant not found</h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6">The tenant you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="btn-primary px-6 py-2 text-sm md:text-base"
          >
            Back to Tenants
          </button>
        </div>
      </div>
    );
  }

  const activeBranches = branches.filter(b => b.isActive).length;
  const activeUsers = users.filter(u => u.isActive).length;

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg transition-colors duration-300 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto animate-slideDown">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 md:gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors py-2"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to Tenants</span>
              <span className="sm:hidden">Back</span>
            </button>
            
            <button
              onClick={handleEdit}
              className="btn-primary flex items-center gap-1 md:gap-2 text-sm py-2 px-3 md:px-4 md:text-base"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="hidden sm:inline">Edit Tenant</span>
              <span className="sm:hidden">Edit</span>
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            {/* Logo/Image */}
            <div className="flex-shrink-0">
              {tenant.logo ? (
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white dark:bg-dark-card rounded-xl md:rounded-2xl shadow-card dark:shadow-card-dark p-3 md:p-4 flex items-center justify-center">
                  <img 
                    src={tenant.logo} 
                    alt={`${tenant.name} logo`}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.innerHTML = `
                        <div class="text-2xl md:text-3xl font-bold text-primary dark:text-dark-primary">
                          ${tenant.name.charAt(0)}
                        </div>
                      `;
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-primary/10 dark:bg-dark-primary/20 rounded-xl md:rounded-2xl shadow-card dark:shadow-card-dark flex items-center justify-center">
                  <span className="text-2xl md:text-3xl font-bold text-primary dark:text-dark-primary">
                    {tenant.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Tenant Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 md:gap-4">
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-light mb-1 md:mb-2 truncate">
                      {tenant.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${
                        tenant.isActive 
                          ? 'bg-success/10 text-success dark:bg-dark-success/20 dark:text-dark-success' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1 md:mr-2 ${
                          tenant.isActive ? 'bg-success dark:bg-dark-success' : 'bg-gray-400'
                        }`}></div>
                        {tenant.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                        <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {tenant.currency}
                      </span>
                      
                      <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        ID: #{tenant.id}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm sm:text-right">
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Created</div>
                    <div className="text-gray-800 dark:text-light font-medium">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 break-words">
                  {tenant.address || 'No address provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="card rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 col-span-1">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">Branches</div>
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-light">
                  {loading.branches ? '...' : branches.length}
                </div>
                <div className="text-xs md:text-sm text-success dark:text-dark-success mt-1 truncate">
                  {loading.branches ? '' : `${activeBranches} active`}
                </div>
              </div>
              <div className="text-brand-info ml-2 flex-shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="card rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 col-span-1">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">Users</div>
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-light">
                  {loading.users ? '...' : users.length}
                </div>
                <div className="text-xs md:text-sm text-success dark:text-dark-success mt-1 truncate">
                  {loading.users ? '' : `${activeUsers} active`}
                </div>
              </div>
              <div className="text-brand-success ml-2 flex-shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="card rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 col-span-1">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">Tax Rate</div>
                <div className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-light">
                  {tenant.taxRate}%
                </div>
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                  Default rate
                </div>
              </div>
              <div className="text-brand-warning ml-2 flex-shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.94 5.5c.944-.945 2.56-.276 2.56 1.06V8h5.5a1.5 1.5 0 010 3H9v4a1 1 0 11-2 0v-4H5.5a1.5 1.5 0 010-3H8V6.5c0-1.085 1.161-1.875 2.06-1.375a3 3 0 014.375 3.085 1.5 1.5 0 11-2.997.05 1 1 0 00-1.437-.938A1.5 1.5 0 0113.5 6.5V13a1 1 0 01-1 1h-1a1 1 0 110-2h1V6.5c0-1.38-1.625-2.005-2.56-1.06a3 3 0 00-1.06 2.06c0 .776.315 1.5.88 2.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="card rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-6 col-span-1">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">Contact</div>
                <div className="text-sm md:text-base lg:text-lg font-medium text-gray-800 dark:text-light truncate">
                  {tenant.email}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {tenant.phone || 'No phone'}
                </div>
              </div>
              <div className="text-primary dark:text-dark-primary ml-2 flex-shrink-0">
                <svg className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 11.798 5.555 8.835z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation - Responsive */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6 md:mb-8">
          <nav className="flex space-x-4 md:space-x-8 overflow-x-auto -mx-2 px-2 md:mx-0 md:px-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 md:py-4 px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-primary text-primary dark:border-dark-primary dark:text-dark-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('branches')}
              className={`py-3 md:py-4 px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap ${
                activeTab === 'branches'
                  ? 'border-primary text-primary dark:border-dark-primary dark:text-dark-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Branches ({branches.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 md:py-4 px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-primary text-primary dark:border-dark-primary dark:text-dark-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Users ({users.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="card rounded-xl md:rounded-2xl p-4 md:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6 md:space-y-8">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-light mb-3 md:mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Email Address</div>
                      <div className="font-medium text-gray-800 dark:text-light break-words">{tenant.email}</div>
                    </div>
                    <div>
                      <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Phone Number</div>
                      <div className="font-medium text-gray-800 dark:text-light">
                        {tenant.phone || 'Not provided'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Physical Address</div>
                    <div className="font-medium text-gray-800 dark:text-light mt-1 whitespace-pre-line break-words">
                      {tenant.address || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-light mb-3 md:mb-4">Financial Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Default Currency</div>
                    <div className="font-medium text-gray-800 dark:text-light">{tenant.currency}</div>
                  </div>
                  <div>
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Tax Rate</div>
                    <div className="font-medium text-gray-800 dark:text-light">{tenant.taxRate}%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branches' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-light">Branches</h3>
                <div className="flex justify-end">
                  {/* <Link
                    to={`/erp/branches/create?tenantId=${tenant.id}`}
                    className="btn-primary flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 px-3 md:px-4"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="hidden sm:inline">Add Branch</span>
                    <span className="sm:hidden">Add</span>
                  </Link> */}
                </div>
              </div>
              
              {loading.branches ? (
                <div className="text-center py-8 md:py-12">
                  <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3 md:mb-4"></div>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Loading branches...</p>
                </div>
              ) : branches.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h4 className="text-sm md:text-base font-medium text-gray-800 dark:text-light mb-2">No branches found</h4>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-6">This tenant doesn't have any branches yet.</p>
                  <Link
                    to={`/erp/branches/create?tenantId=${tenant.id}`}
                    className="btn-primary inline-flex items-center gap-1 md:gap-2 text-sm"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create First Branch
                  </Link>
                </div>
              ) : isMobile ? (
                // Mobile Card View for Branches
                <div className="space-y-4">
                  {branches.map((branch) => (
                    <div key={branch.id} className="bg-gray-50 dark:bg-dark-card rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-800 dark:text-light truncate">{branch.name}</h4>
                          {branch.address && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{branch.address}</p>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                          branch.isActive 
                            ? 'bg-success/10 text-success dark:bg-dark-success/20 dark:text-dark-success' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {branch.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      {(branch.email || branch.phone) && (
                        <div className="space-y-2 mb-4">
                          {branch.email && (
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Email</div>
                              <div className="text-sm text-gray-800 dark:text-light truncate">{branch.email}</div>
                            </div>
                          )}
                          {branch.phone && (
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Phone</div>
                              <div className="text-sm text-gray-800 dark:text-light">{branch.phone}</div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* <div className="flex justify-end">
                        <Link
                          to={`/erp/branches/${branch.id}`}
                          className="text-primary hover:text-primary/80 dark:text-dark-primary dark:hover:text-dark-primary/80 text-xs font-medium inline-flex items-center"
                        >
                          View Details
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div> */}
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop Table View for Branches
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-50 dark:bg-dark-card">
                      <tr>
                        <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                        <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                        <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        {/* <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th> */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {branches.map((branch) => (
                        <tr key={branch.id} className="hover:bg-gray-50 dark:hover:bg-dark-card/50">
                          <td className="py-3 px-3 md:px-4">
                            <div className="font-medium text-gray-800 dark:text-light text-sm md:text-base">{branch.name}</div>
                            {branch.address && (
                              <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{branch.address}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 md:px-4">
                            {branch.email && (
                              <div className="text-sm text-gray-800 dark:text-light truncate max-w-xs">{branch.email}</div>
                            )}
                            {branch.phone && (
                              <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{branch.phone}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 md:px-4">
                            <span className={`inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${
                              branch.isActive 
                                ? 'bg-success/10 text-success dark:bg-dark-success/20 dark:text-dark-success' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {branch.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          {/* <td className="py-3 px-3 md:px-4">
                            <Link
                              to={`/erp/branches/${branch.id}`}
                              className="text-primary hover:text-primary/80 dark:text-dark-primary dark:hover:text-dark-primary/80 text-xs md:text-sm font-medium inline-flex items-center"
                            >
                              <span className="hidden md:inline">View Details</span>
                              <span className="md:hidden">View</span>
                              <svg className="w-3 h-3 md:w-4 md:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-light">Users</h3>
                <div className="flex justify-end">
                  {/* <Link
                    to={`/erp/users/create?tenantId=${tenant.id}`}
                    className="btn-primary flex items-center gap-1 md:gap-2 text-xs md:text-sm py-2 px-3 md:px-4"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="hidden sm:inline">Add User</span>
                    <span className="sm:hidden">Add</span>
                  </Link> */}
                </div>
              </div>
              
              {loading.users ? (
                <div className="text-center py-8 md:py-12">
                  <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3 md:mb-4"></div>
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <svg className="w-12 h-12 md:w-16 md:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 md:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 5.197a6 6 0 00-6-6m6 6a6 6 0 01-6-6m6 6v1a6 6 0 01-12 0v-1" />
                  </svg>
                  <h4 className="text-sm md:text-base font-medium text-gray-800 dark:text-light mb-2">No users found</h4>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-6">This tenant doesn't have any users yet.</p>
                  <Link
                    to={`/erp/users/create?tenantId=${tenant.id}`}
                    className="btn-primary inline-flex items-center gap-1 md:gap-2 text-sm"
                  >
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add First User
                  </Link>
                </div>
              ) : isMobile ? (
                // Mobile Card View for Users
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="bg-gray-50 dark:bg-dark-card rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="min-w-0">
                          <h4 className="font-medium text-gray-800 dark:text-light truncate">{user.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{user.email}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                          user.isActive 
                            ? 'bg-success/10 text-success dark:bg-dark-success/20 dark:text-dark-success' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                          {user.role}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">ID: {user.id}</span>
                      </div>
                      
                      {/* <div className="flex justify-end">
                        <Link
                          to={`/erp/users/${user.id}`}
                          className="text-primary hover:text-primary/80 dark:text-dark-primary dark:hover:text-dark-primary/80 text-xs font-medium inline-flex items-center"
                        >
                          View Details
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div> */}
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop Table View for Users
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-50 dark:bg-dark-card">
                      <tr>
                        <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                        <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                        <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                        <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        {/* <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th> */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-card/50">
                          <td className="py-3 px-3 md:px-4">
                            <div className="font-medium text-gray-800 dark:text-light text-sm md:text-base">{user.name}</div>
                          </td>
                          <td className="py-3 px-3 md:px-4">
                            <div className="text-sm text-gray-800 dark:text-light truncate max-w-xs">{user.email}</div>
                          </td>
                          <td className="py-3 px-3 md:px-4">
                            <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 md:px-4">
                            <span className={`inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${
                              user.isActive 
                                ? 'bg-success/10 text-success dark:bg-dark-success/20 dark:text-dark-success' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          {/* <td className="py-3 px-3 md:px-4">
                            <Link
                              to={`/erp/users/${user.id}`}
                              className="text-primary hover:text-primary/80 dark:text-dark-primary dark:hover:text-dark-primary/80 text-xs md:text-sm font-medium inline-flex items-center"
                            >
                              <span className="hidden md:inline">View Details</span>
                              <span className="md:hidden">View</span>
                              <svg className="w-3 h-3 md:w-4 md:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantDetails;