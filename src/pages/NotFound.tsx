import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-space-black text-iss-white px-4 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <div className="w-16 h-1 bg-iss-highlight mb-8"></div>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-gray-400 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-iss-highlight text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Return to Home
      </Link>
      
      {/* Space-themed decoration */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-70 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full opacity-50 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-white rounded-full opacity-60 animate-pulse"></div>
    </div>
  );
};

export default NotFound;
