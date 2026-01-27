import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotSchema } from "./auth.schema";
import { z } from "zod";
import useAuth from "@/Hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
type ResendForm = z.infer<typeof forgotSchema>;

function ResendVerification() {
   const navigate = useNavigate();
  const { resendVerificationMutation } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<ResendForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    }
  });

  
  const onSubmit = (data: ResendForm) => {
    resendVerificationMutation.mutate(data.email, {
      onSuccess: (res) => { 
        toast.success(res.message);
        navigate("/erp/auth/verify-email");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-info/20 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-info dark:text-dark-info" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-dark dark:text-light">Resend Verification</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Didn't receive the verification email?
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

        <div className="bg-success/10 dark:bg-dark-success/10 border border-success/20 dark:border-dark-success/20 rounded-xl p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-success dark:text-dark-success mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm">
              <p className="font-medium text-gray-800 dark:text-gray-200">Check your spam folder</p>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                Sometimes verification emails end up in spam. Make sure to check there before requesting a new one.
              </p>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={resendVerificationMutation.isPending}
          className="btn-primary w-full py-3 flex items-center justify-center space-x-2"
        >
          {resendVerificationMutation.isPending ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Sending Email...</span>
            </>
          ) : (
            <>
              <span>Resend Verification Email</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <div className="space-y-2">
          {/* <Link 
            to="/erp/auth/login" 
            className="inline-flex items-center text-primary dark:text-dark-primary hover:underline"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Login
          </Link> */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already verified? <Link to="/erp/auth/login" className="text-primary dark:text-dark-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default ResendVerification;