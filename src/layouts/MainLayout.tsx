import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-space-black text-iss-white">
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600&family=Orbitron:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>
      {/* Header */}
      <header className="bg-space-blue shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold" style={{fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px"}}>ISS Live Tracker</h1>
          </div>
          <nav style={{fontFamily: "'Exo 2', sans-serif"}}>
            <ul className="flex space-x-6">
              <li>
                <Link 
                  to="/" 
                  className="text-white hover:text-iss-highlight transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-white hover:text-iss-highlight transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-space-blue py-4 text-center text-sm">
        <div className="container mx-auto px-4" style={{fontFamily: "'Exo 2', sans-serif"}}>
          <p>© {new Date().getFullYear()} ISS Live Tracker | Data provided by wheretheiss.at and Open Notify</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
