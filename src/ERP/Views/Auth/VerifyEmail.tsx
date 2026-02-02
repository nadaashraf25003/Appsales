import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifySchema } from "./auth.schema";
import useAuth from "@/Hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
const VerifyEmail = () => {
  const navigate = useNavigate();
  const { verifyEmailMutation } = useAuth();
  const storedEmail = localStorage.getItem("tempEmail");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = (data: any) => {
    if (!storedEmail) {
      toast.error("Email not found. Please register again.");
      navigate("/erp/auth/register");
      return;
    }
    verifyEmailMutation.mutate(
      {
        email: storedEmail,
        code: data.code,
      },
      {
        onSuccess: () => {
          toast.success("Email verified successfully");
           localStorage.removeItem("tempEmail"); 
          navigate("/erp/auth/login");
        },
      },
    );
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-info/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-primary dark:text-dark-primary"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-dark dark:text-light">
          Verify Your Email
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Enter the verification code sent to your email
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* <div>
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
        </div> */}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Verification Code
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
                  d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              {...register("code")}
              className="input pl-10"
              placeholder="6-digit code"
              maxLength={6}
            />
          </div>
          {errors.code && (
            <p className="mt-1 text-sm text-secondary dark:text-dark-secondary animate-slideDown">
              {errors.code.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Check your email for the 6-digit verification code
          </p>
        </div>

        <div className="bg-warning/10 dark:bg-dark-warning/10 border border-warning/20 dark:border-dark-warning/20 rounded-xl p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-warning dark:text-dark-warning mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm">
              <p className="font-medium text-gray-800 dark:text-gray-200">
                Code expires in 15 minutes
              </p>
              <p className="text-gray-700 dark:text-gray-300 mt-1">
                If you didn't receive the code, you can request a new one.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={verifyEmailMutation.isPending}
            className="btn-primary flex-1 py-3 flex items-center justify-center space-x-2"
          >
            {verifyEmailMutation.isPending ? (
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
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify Email</span>
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </>
            )}
          </button>

          <Link
            to="/erp/auth/resend-verification"
            className="btn-secondary flex-1 py-3 flex items-center justify-center space-x-2"
          >
            <span>Resend Code</span>
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </Link>
        </div>
      </form>

      <div className="mt-8 text-center space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already verified?{" "}
            <Link
              to="/erp/auth/login"
              className="text-primary dark:text-dark-primary font-medium hover:underline"
            >
              Sign in to your account
            </Link>
          </p>
        </div>
        <Link
          to="/erp/auth/login"
          className="inline-flex items-center text-primary dark:text-dark-primary hover:underline"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Login
        </Link>
      </div>
    </>
  );
};

export default VerifyEmail;
