import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotSchema } from "./auth.schema";
import { z } from "zod";
import useAuth from "@/Hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

type ForgotForm = z.infer<typeof forgotSchema>;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPasswordMutation } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    }
  });

 const onSubmit = (data: ForgotForm) => {
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: (res) => { 
        toast.success(res.message);
        navigate("/erp/auth/reset-password");
      },
    });
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-warning dark:text-dark-warning" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-dark dark:text-light">Forgot Password?</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Enter your email to receive a reset code
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
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

        <div className="bg-info/10 dark:bg-dark-info/10 border border-info/20 dark:border-dark-info/20 rounded-xl p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-info dark:text-dark-info mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              We'll send a 6-digit verification code to your email. This code will expire in 15 minutes.
            </p>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={forgotPasswordMutation.isPending}
          className="btn-primary w-full py-3 flex items-center justify-center space-x-2"
        >
          {forgotPasswordMutation.isPending ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Sending Code...</span>
            </>
          ) : (
            <>
              <span>Send Reset Code</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link 
          to="/erp/auth/login" 
          className="inline-flex items-center text-primary dark:text-dark-primary hover:underline"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Login
        </Link>
      </div>
    </>
  );
};

export default ForgotPassword;