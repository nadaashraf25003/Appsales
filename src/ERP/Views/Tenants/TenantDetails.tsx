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
      <div className="min-h-screen bg-light dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-800 dark:text-light mb-2">Tenant not found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The tenant you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="btn-primary"
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
    <div className="min-h-screen bg-light dark:bg-dark-bg transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-7xl mx-auto animate-slideDown">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tenants
            </button>
            
            <button
              onClick={handleEdit}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Tenant
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Logo/Image */}
            {tenant.logo ? (
              <div className="w-24 h-24 bg-white dark:bg-dark-card rounded-2xl shadow-card dark:shadow-card-dark p-4 flex items-center justify-center">
                <img 
                  src={tenant.logo} 
                  alt={`${tenant.name} logo`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.innerHTML = `
                      <div class="text-3xl font-bold text-primary dark:text-dark-primary">
                        ${tenant.name.charAt(0)}
                      </div>
                    `;
                  }}
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-primary/10 dark:bg-dark-primary/20 rounded-2xl shadow-card dark:shadow-card-dark flex items-center justify-center">
                <span className="text-3xl font-bold text-primary dark:text-dark-primary">
                  {tenant.name.charAt(0)}
                </span>
              </div>
            )}
            
            {/* Tenant Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-light mb-2">
                    {tenant.name}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      tenant.isActive 
                        ? 'bg-success/10 text-success dark:bg-dark-success/20 dark:text-dark-success' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        tenant.isActive ? 'bg-success dark:bg-dark-success' : 'bg-gray-400'
                      }`}></div>
                      {tenant.isActive ? 'Active' : 'Inactive'}
                    </span>
                    
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {tenant.currency}
                    </span>
                    
                    <span className="text-gray-500 dark:text-gray-400">
                      ID: #{tenant.id}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Created</div>
                  <div className="text-gray-800 dark:text-light font-medium">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400">
                {tenant.address || 'No address provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Branches</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-light">
                  {loading.branches ? '...' : branches.length}
                </div>
                <div className="text-sm text-success dark:text-dark-success mt-1">
                  {loading.branches ? '' : `${activeBranches} active`}
                </div>
              </div>
              <div className="text-brand-info">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Users</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-light">
                  {loading.users ? '...' : users.length}
                </div>
                <div className="text-sm text-success dark:text-dark-success mt-1">
                  {loading.users ? '' : `${activeUsers} active`}
                </div>
              </div>
              <div className="text-brand-success">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Tax Rate</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-light">
                  {tenant.taxRate}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Default rate
                </div>
              </div>
              <div className="text-brand-warning">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.94 5.5c.944-.945 2.56-.276 2.56 1.06V8h5.5a1.5 1.5 0 010 3H9v4a1 1 0 11-2 0v-4H5.5a1.5 1.5 0 010-3H8V6.5c0-1.085 1.161-1.875 2.06-1.375a3 3 0 014.375 3.085 1.5 1.5 0 11-2.997.05 1 1 0 00-1.437-.938A1.5 1.5 0 0113.5 6.5V13a1 1 0 01-1 1h-1a1 1 0 110-2h1V6.5c0-1.38-1.625-2.005-2.56-1.06a3 3 0 00-1.06 2.06c0 .776.315 1.5.88 2.06z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Contact</div>
                <div className="text-lg font-medium text-gray-800 dark:text-light truncate">
                  {tenant.email}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {tenant.phone || 'No phone'}
                </div>
              </div>
              <div className="text-primary dark:text-dark-primary">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.94 6.412A2 2 0 002 8.108V16a2 2 0 002 2h12a2 2 0 002-2V8.108a2 2 0 00-.94-1.696l-6-3.75a2 2 0 00-2.12 0l-6 3.75zm2.615 2.423a1 1 0 10-1.11 1.664l5 3.333a1 1 0 001.11 0l5-3.333a1 1 0 00-1.11-1.664L10 11.798 5.555 8.835z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary text-primary dark:border-dark-primary dark:text-dark-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('branches')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'branches'
                  ? 'border-primary text-primary dark:border-dark-primary dark:text-dark-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Branches ({branches.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
        <div className="card rounded-2xl shadow-card dark:shadow-card-dark p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-light mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Email Address</div>
                      <div className="font-medium text-gray-800 dark:text-light">{tenant.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Phone Number</div>
                      <div className="font-medium text-gray-800 dark:text-light">
                        {tenant.phone || 'Not provided'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Physical Address</div>
                    <div className="font-medium text-gray-800 dark:text-light mt-1 whitespace-pre-line">
                      {tenant.address || 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-light mb-4">Financial Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Default Currency</div>
                    <div className="font-medium text-gray-800 dark:text-light">{tenant.currency}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Tax Rate</div>
                    <div className="font-medium text-gray-800 dark:text-light">{tenant.taxRate}%</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branches' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-light">Branches</h3>
                <Link
                  to={`/erp/branches/create?tenantId=${tenant.id}`}
                  className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Branch
                </Link>
              </div>
              
              {loading.branches ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading branches...</p>
                </div>
              ) : branches.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h4 className="font-medium text-gray-800 dark:text-light mb-2">No branches found</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">This tenant doesn't have any branches yet.</p>
                  <Link
                    to={`/erp/branches/create?tenantId=${tenant.id}`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Create First Branch
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-dark-card">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Contact</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {branches.map((branch) => (
                        <tr key={branch.id} className="hover:bg-gray-50 dark:hover:bg-dark-card/50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-800 dark:text-light">{branch.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{branch.address}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-800 dark:text-light">{branch.email}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{branch.phone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              branch.isActive 
                                ? 'bg-success/10 text-success dark:bg-dark-success/20 dark:text-dark-success' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {branch.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Link
                              to={`/erp/branches/${branch.id}`}
                              className="text-primary hover:text-primary/80 dark:text-dark-primary dark:hover:text-dark-primary/80 text-sm font-medium"
                            >
                              View Details →
                            </Link>
                          </td>
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-light">Users</h3>
                <Link
                  to={`/erp/users/create?tenantId=${tenant.id}`}
                  className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add User
                </Link>
              </div>
              
              {loading.users ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13 5.197a6 6 0 00-6-6m6 6a6 6 0 01-6-6m6 6v1a6 6 0 01-12 0v-1" />
                  </svg>
                  <h4 className="font-medium text-gray-800 dark:text-light mb-2">No users found</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">This tenant doesn't have any users yet.</p>
                  <Link
                    to={`/erp/users/create?tenantId=${tenant.id}`}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Add First User
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-dark-card">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-dark-card/50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-800 dark:text-light">{user.name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-sm text-gray-800 dark:text-light">{user.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-dark-primary/20 dark:text-dark-primary">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              user.isActive 
                                ? 'bg-success/10 text-success dark:bg-dark-success/20 dark:text-dark-success' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Link
                              to={`/erp/users/${user.id}`}
                              className="text-primary hover:text-primary/80 dark:text-dark-primary dark:hover:text-dark-primary/80 text-sm font-medium"
                            >
                              View Details →
                            </Link>
                          </td>
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