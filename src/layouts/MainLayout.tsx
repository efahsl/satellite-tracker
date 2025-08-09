import React from "react";
import { Outlet, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import HamburgerMenu from "../components/UI/HamburgerMenu/HamburgerMenu";
import { useDevice } from "../state/DeviceContext";

const MainLayout: React.FC = () => {
  const { isMobile, isDesktop } = useDevice();

  return (
    <div className="flex flex-col min-h-screen bg-space-black text-iss-white">
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600&family=Orbitron:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      {/* Header */}
      <header className="bg-space-blue shadow-md">
        <div
          className="flex justify-between items-center"
          style={{
            paddingLeft: "8px",
            minHeight: isMobile ? "48px" : "56px",
          }}
        >
          <div className="flex items-center space-x-4">
            <HamburgerMenu />
            <h1
              className={isMobile ? "text-lg font-bold" : "text-xl font-bold"}
              style={{
                fontFamily: "'Orbitron', sans-serif",
                letterSpacing: "1px",
                paddingLeft: isMobile ? "8px" : "10px",
              }}
            >
              ISS Live Tracker
            </h1>
          </div>
          <nav style={{ fontFamily: "'Exo 2', sans-serif" }}>
            <ul className={`flex ${isMobile ? "space-x-3" : "space-x-6"}`}>
              <li>
                <Link
                  to="/"
                  className="text-white hover:text-iss-highlight transition-colors"
                  style={{
                    fontSize: isMobile ? "14px" : "16px",
                    padding: isMobile ? "8px 12px" : "4px 8px",
                    minHeight: isMobile ? "44px" : "auto",
                    display: "flex",
                    alignItems: "center",
                    // Optimize touch targets for mobile
                    touchAction: isMobile ? "manipulation" : "auto",
                  }}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-white hover:text-iss-highlight transition-colors"
                  style={{
                    fontSize: isMobile ? "14px" : "16px",
                    padding: isMobile ? "8px 12px" : "4px 8px",
                    minHeight: isMobile ? "44px" : "auto",
                    display: "flex",
                    alignItems: "center",
                    // Optimize touch targets for mobile
                    touchAction: isMobile ? "manipulation" : "auto",
                  }}
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
        <div
          className="container mx-auto px-4"
          style={{
            fontFamily: "'Exo 2', sans-serif",
            fontSize: isMobile ? "12px" : "14px",
            padding: isMobile ? "12px 16px" : "16px",
          }}
        >
          <p>
            © {new Date().getFullYear()} ISS Live Tracker | Data provided by
            wheretheiss.at and Open Notify
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
