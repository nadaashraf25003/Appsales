const Loader = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-light dark:bg-dark">
      <div className="relative">
        {/* Outer ring with shadow */}
        <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full shadow-card"></div>
        
        {/* Animated ring */}
        <div className="w-20 h-20 border-4 border-blue-500 border-dashed rounded-full animate-spin absolute top-0 left-0"></div>
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;