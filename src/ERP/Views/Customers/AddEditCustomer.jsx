import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useCustomers from '@/Hooks/useCustomers';

const AddEditCustomer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'regular',
    creditLimit: '',
    taxId: '',
    billingAddress: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { createCustomerMutation, updateCustomerMutation, getCustomerByIdMutation } = useCustomers();

  // Load customer data if editing
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      getCustomerByIdMutation.mutate(id, {
        onSuccess: (data) => {
          setForm({
            name: data.name || '',
            phone: data.phone || '',
            email: data.email || '',
            type: data.type || 'regular',
            creditLimit: data.creditLimit ? data.creditLimit.toString() : '',
            taxId: data.taxId || '',
            billingAddress: data.billingAddress || '',
          });
          toast.success('Customer loaded successfully');
          setIsLoading(false);
        },
        onError: () => {
          toast.error('Failed to load customer data');
          setIsLoading(false);
        },
      });
    }
  }, [id]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^01[0-9]{9}$/.test(form.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid Egyptian phone number';
    }
    
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (form.creditLimit && isNaN(Number(form.creditLimit))) {
      newErrors.creditLimit = 'Credit limit must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    const customerData = {
      ...form,
      creditLimit: form.creditLimit ? Number(form.creditLimit) : 0,
    };
    
    if (id) {
      updateCustomerMutation.mutate(
        { id: +id, ...customerData },
        {
          onSuccess: () => {
            toast.success('Customer updated successfully');
            navigate('/erp/sales/customers');
          },
          onError: () => {
            toast.error('Failed to update customer');
          },
        }
      );
    } else {
      createCustomerMutation.mutate(customerData, {
        onSuccess: () => {
          toast.success('Customer created successfully');
          navigate('/erp/sales/customers');
        },
        onError: () => {
          toast.error('Failed to create customer');
        },
      });
    }
  };

  const handleReset = () => {
    if (id) {
      getCustomerByIdMutation.mutate(id, {
        onSuccess: (data) => {
          setForm({
            name: data.name || '',
            phone: data.phone || '',
            email: data.email || '',
            type: data.type || 'regular',
            creditLimit: data.creditLimit ? data.creditLimit.toString() : '',
            taxId: data.taxId || '',
            billingAddress: data.billingAddress || '',
          });
          toast.success('Form reset to original values');
        },
      });
    } else {
      setForm({
        name: '',
        phone: '',
        email: '',
        type: 'regular',
        creditLimit: '',
        taxId: '',
        billingAddress: '',
      });
      setErrors({});
      toast.success('Form cleared');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary dark:border-dark-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading customer details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light dark:bg-dark-bg transition-colors duration-300 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto animate-slideDown">
        
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <button
              onClick={() => navigate('/erp/sales/customers')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors group"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to Customers</span>
              <span className="sm:hidden">Back</span>
            </button>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {id ? `Editing Customer ID: #${id}` : 'Creating New Customer'}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
            {/* Customer Icon */}
            {/* <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-primary dark:text-dark-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div> */}

            {/* Title Section */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-light mb-2">
                {id ? 'Edit Customer Profile' : 'Add Customer Profile'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {id 
                  ? 'Update customer information and details' 
                  : 'Create a new customer profile for your sales system'}
              </p>
              
                {/* <div className="flex flex-wrap gap-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${form.type === 'premium' ? 'bg-warning/10 dark:bg-dark-warning/20 text-warning dark:text-dark-warning' : 'bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary'}`}>
                    {form.type === 'premium' ? 'Premium Customer' : 'Regular Customer'}
                  </div>
                  {id && (
                    <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-medium">
                      Customer ID: #{id}
                    </div>
                  )}
                </div> */}
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="card rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden">
          {/* Form Header */}
          {/* <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-success/5 dark:from-dark-primary/10 dark:to-dark-success/10">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-light">Customer Information</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Fill in the customer details below. Fields marked with * are required.
            </p>
          </div> */}

          {/* Form Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Personal & Contact Info */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-primary dark:bg-dark-primary rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-light">Personal & Contact Info</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Full Name *</span>
                      <div className="relative mt-1">
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          className={`input pl-10 ${errors.name ? '!border-red-500 !ring-red-500' : ''}`}
                          placeholder="John Doe"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                    </label>
                    {errors.name && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Phone Number *</span>
                      <div className="relative mt-1">
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          className={`input pl-10 ${errors.phone ? '!border-red-500 !ring-red-500' : ''}`}
                          placeholder="01XXXXXXXXX"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                      </div>
                    </label>
                    {errors.phone && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Email Address</span>
                      <div className="relative mt-1">
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className={`input pl-10 ${errors.email ? '!border-red-500 !ring-red-500' : ''}`}
                          placeholder="example@mail.com"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </label>
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Customer Type */}
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Customer Type</span>
                      <div className="mt-1">
                        <div className="flex gap-4">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              checked={form.type === 'regular'}
                              onChange={() => handleChange('type', 'regular')}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center ${form.type === 'regular' ? 'border-primary dark:border-dark-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                              {form.type === 'regular' && <div className="w-2.5 h-2.5 rounded-full bg-primary dark:bg-dark-primary"></div>}
                            </div>
                            <span className={`font-medium ${form.type === 'regular' ? 'text-primary dark:text-dark-primary' : 'text-gray-600 dark:text-gray-400'}`}>
                              Regular
                            </span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              checked={form.type === 'premium'}
                              onChange={() => handleChange('type', 'premium')}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 mr-2 flex items-center justify-center ${form.type === 'premium' ? 'border-warning dark:border-dark-warning' : 'border-gray-300 dark:border-gray-600'}`}>
                              {form.type === 'premium' && <div className="w-2.5 h-2.5 rounded-full bg-warning dark:bg-dark-warning"></div>}
                            </div>
                            <span className={`font-medium ${form.type === 'premium' ? 'text-warning dark:text-dark-warning' : 'text-gray-600 dark:text-gray-400'}`}>
                              Premium / VIP
                            </span>
                          </label>
                        </div>
                      </div>
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {form.type === 'premium' 
                        ? 'Premium customers get special discounts and priority service' 
                        : 'Regular customers with standard service terms'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial & Billing Info */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-success dark:bg-dark-success rounded-full"></div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-light">Financial & Billing Info</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Credit Limit */}
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Credit Limit</span>
                      <div className="relative mt-1">
                        <input
                          type="text"
                          value={form.creditLimit}
                          onChange={(e) => handleChange('creditLimit', e.target.value)}
                          className={`input pl-10 pr-12 ${errors.creditLimit ? '!border-red-500 !ring-red-500' : ''}`}
                          placeholder="0.00"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                          EGP
                        </div>
                      </div>
                    </label>
                    {errors.creditLimit && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.creditLimit}
                      </p>
                    )}
                  </div>

                  {/* Tax ID */}
                  <div className="space-y-2">
                    <label className="block">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Tax ID / National ID</span>
                      <div className="relative mt-1">
                        <input
                          type="text"
                          value={form.taxId}
                          onChange={(e) => handleChange('taxId', e.target.value)}
                          className="input pl-10"
                          placeholder="Optional"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Billing Address */}
                  <div className="space-y-2 lg:col-span-2">
                    <label className="block">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Billing Address</span>
                      <div className="relative mt-1">
                        <textarea
                          value={form.billingAddress}
                          onChange={(e) => handleChange('billingAddress', e.target.value)}
                          className="input pl-10 min-h-[120px] resize-y"
                          placeholder="Enter complete billing address"
                          rows={3}
                        />
                        <div className="absolute left-3 top-4 text-gray-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                    className="btn-primary flex-1 py-3 text-sm md:text-base relative"
                  >
                    {createCustomerMutation.isPending || updateCustomerMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        {id ? 'Updating...' : 'Creating...'}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {id ? 'Update Customer Profile' : 'Save Customer Profile'}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/erp/sales/customers')}
                    disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                    className="btn-secondary flex-1 py-3 text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                    className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm md:text-base"
                  >
                    {id ? 'Reset Changes' : 'Clear Form'}
                  </button>
                </div>

                {/* Form Validation Summary */}
                {Object.keys(errors).length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium text-red-800 dark:text-red-300">Please fix the following errors:</p>
                        <ul className="mt-2 text-sm text-red-700 dark:text-red-400 list-disc list-inside space-y-1">
                          {errors.name && <li>{errors.name}</li>}
                          {errors.phone && <li>{errors.phone}</li>}
                          {errors.email && <li>{errors.email}</li>}
                          {errors.creditLimit && <li>{errors.creditLimit}</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Customer Type Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="card rounded-2xl p-6 border-l-4 border-primary dark:border-dark-primary">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-dark-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary dark:text-dark-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-light">Regular Customer</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-dark-primary"></div>
                Standard pricing and discounts
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-dark-primary"></div>
                Normal payment terms
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-dark-primary"></div>
                Regular customer support
              </li>
            </ul>
          </div>

          <div className="card rounded-2xl p-6 border-l-4 border-warning dark:border-dark-warning">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-warning/10 dark:bg-dark-warning/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-warning dark:text-dark-warning" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.2 6.5 10.266a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-light">Premium / VIP Customer</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-warning dark:bg-dark-warning"></div>
                Special discounts and pricing
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-warning dark:bg-dark-warning"></div>
                Extended credit terms
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-warning dark:bg-dark-warning"></div>
                Priority support and service
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEditCustomer;