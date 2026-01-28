import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using React Router
import { Home, Search, AlertCircle } from 'lucide-react'; // Or any icon library

const Error404 = () => {
  const suggestions = [
    { text: 'Check the URL for typos', icon: Search },
    { text: 'The page may have been moved', icon: AlertCircle },
    { text: 'Try searching for what you need', icon: Search },
  ];

  const quickLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Settings', path: '/settings' },
    { label: 'Help Center', path: '/help' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-light/50 via-white to-primary/5 dark:from-dark-bg dark:via-dark-card dark:to-dark-primary/10 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-dark-primary/20 dark:to-dark-secondary/20 rounded-full mb-8">
            <div className="text-6xl font-bold text-primary dark:text-dark-primary">
              404
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-light mb-4">
            Page Not Found
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Oops! The page you're looking for seems to have wandered off into the digital void.
          </p>
        </div>

       

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => window.history.back()}
            className="btn-secondary flex items-center gap-2 px-6 py-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
          
          <Link
            to="/"
            className="btn-primary flex items-center gap-2 px-6 py-3"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Link>
          
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 border-2 border-primary dark:border-dark-primary text-primary dark:text-dark-primary font-semibold rounded-xl hover:bg-primary/10 dark:hover:bg-dark-primary/10 transition-colors"
          >
            Refresh Page
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span className="text-sm">Need more help?</span>
            <Link 
              to="/contact" 
              className="text-primary dark:text-dark-primary font-medium hover:underline"
            >
              Contact Support
            </Link>
          </div>
          
          {/* Animated 404 decoration */}
          <div className="mt-8 opacity-20">
            <div className="inline-block animate-pulse">
              <div className="text-8xl font-black text-primary dark:text-dark-primary opacity-30">
                404
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404;