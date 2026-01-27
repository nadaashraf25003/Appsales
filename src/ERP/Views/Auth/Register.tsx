import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "./auth.schema";
import { z } from "zod";
import useAuth from "@/Hooks/useAuth";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
export interface RegisterForm extends z.infer<typeof registerSchema> {
  role:
    | "TenantOwner"
    | "SuperAdmin"
    | "BranchManager"
    | "Cashier"
    | "Accountant";
  tenantId: number;
  branchId: number;
}
const Register = () => {
  const navigate = useNavigate();
  const { registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    // defaultValues: {
    //   gender: "",
    // }
  });

  const onSubmit = (data: RegisterForm) => {
    // Map your form fields to the backend fields
    const payload = {
      name: data.fullName, // PascalCase
      email: data.email,
      password: data.password,
      role: data.role, // must match UserRole enum on backend ("Admin" or "User")
      tenantId: data.tenantId,
      branchId: data.branchId,
    };
    console.log(data);
    // Call your useAuth mutation
    registerMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(res.message);
        navigate("/erp/auth/verify-email");
      },
      onError: (err: any) =>
        toast.error(err.response?.data?.message || "Registration failed"),
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                {...register("fullName")}
                className="input pl-10"
                placeholder="John Doe"
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-sm text-secondary dark:text-dark-secondary animate-slideDown">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <input
                {...register("email")}
                type="email"
                className="input pl-10"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-secondary dark:text-dark-secondary animate-slideDown">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className="input pl-10 pr-10"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-secondary dark:text-dark-secondary animate-slideDown">
                {errors.password.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Must be at least 8 characters with letters and numbers
            </p>
          </div>

          {/* Phone Number */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <input
                {...register("phoneNumber")}
                type="tel"
                className="input pl-10"
                placeholder="+1234567890"
              />
            </div>
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-secondary dark:text-dark-secondary animate-slideDown">
                {errors.phoneNumber.message}
              </p>
            )}
          </div> */}
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select {...register("role")} className="input">
              <option value="">Select Role</option>
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="TenantOwner">TenantOwner</option>
              <option value="BranchManager">BranchManager</option>
              <option value="Cashier">Cashier</option>
              <option value="Accountant">Accountant</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm">{errors.role.message}</p>
            )}
          </div>

          {/* Tenant ID */}
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               Tenant ID
            </label>
           
            <input
              {...register("tenantId", { valueAsNumber: true })}
              type="number"
              className="input"
              placeholder="1"
            />
            {errors.tenantId && (
              <p className="text-red-500 text-sm">{errors.tenantId.message}</p>
            )}
          </div>

          {/* Branch ID */}
          <div>
           
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Branch ID
            </label>
            <input
              {...register("branchId", { valueAsNumber: true })}
              type="number"
              className="input"
              placeholder="1"
            />
            {errors.branchId && (
              <p className="text-red-500 text-sm">{errors.branchId.message}</p>
            )}
          </div>

          {/* Country */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <input 
                {...register("country")}
                className="input pl-10"
                placeholder="Your Country"
              />
            </div>
            {errors.country && (
              <p className="mt-1 text-sm text-secondary dark:text-dark-secondary animate-slideDown">
                {errors.country.message}
              </p>
            )}
          </div> */}

          {/* Address */}
          {/* <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <textarea 
                {...register("address")}
                rows={3}
                className="input pl-10"
                placeholder="Full address with city and zip code"
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-secondary dark:text-dark-secondary animate-slideDown">
                {errors.address.message}
              </p>
            )}
          </div> */}
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            className="h-4 w-4 text-primary rounded focus:ring-primary mt-1"
          />
          <label
            htmlFor="terms"
            className="ml-2 text-sm text-gray-600 dark:text-gray-300"
          >
            I agree to the{" "}
            <button
              type="button"
              className="text-primary dark:text-dark-primary hover:underline"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              className="text-primary dark:text-dark-primary hover:underline"
            >
              Privacy Policy
            </button>
          </label>
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="btn-primary w-full py-3 flex items-center justify-center space-x-2"
        >
          {registerMutation.isPending ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>
      </form>
    </>
  );
};

export default Register;
