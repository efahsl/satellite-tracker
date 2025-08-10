import React from "react";
import { Outlet, Link } from "react-router-dom";
import HamburgerMenu from "../components/UI/HamburgerMenu/HamburgerMenu";
import { useDevice } from "../state/DeviceContext";
import { ResponsiveContainer, ResponsiveText, DeviceStyle } from "../components/UI/ResponsiveLayout";

const MainLayout: React.FC = () => {
  const { isMobile } = useDevice();

  return (
    <div className="flex flex-col min-h-screen bg-space-black text-iss-white">
      
      {/* Header */}
      <header className="bg-space-blue shadow-md">
        <ResponsiveContainer maxWidth="full" padding="sm">
          <DeviceStyle
            baseClassName="flex justify-between items-center"
            mobileClassName="min-h-[48px] px-1"
            desktopClassName="min-h-[56px] px-2"
          >
            <div className="flex items-center">
              <HamburgerMenu />
              <ResponsiveText
                mobileSize="lg"
                desktopSize="xl"
                weight="bold"
                className="font-orbitron tracking-wide ml-3"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: "1px",
                }}
              >
                ISS Live Tracker
              </ResponsiveText>
            </div>
            
            <nav className="font-exo">
              <ul className="flex space-x-3 md:space-x-6">
                <li>
                  <Link
                    to="/"
                    className="text-white hover:text-iss-highlight transition-colors flex items-center"
                    style={{
                      fontSize: isMobile ? "14px" : "16px",
                      padding: isMobile ? "8px 12px" : "4px 8px",
                      minHeight: isMobile ? "44px" : "auto",
                      // Optimize touch targets for mobile
                      touchAction: isMobile ? "manipulation" : "auto",
                      // Ensure minimum touch target size on mobile
                      minWidth: isMobile ? "44px" : "auto",
                    }}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-white hover:text-iss-highlight transition-colors flex items-center"
                    style={{
                      fontSize: isMobile ? "14px" : "16px",
                      padding: isMobile ? "8px 12px" : "4px 8px",
                      minHeight: isMobile ? "44px" : "auto",
                      // Optimize touch targets for mobile
                      touchAction: isMobile ? "manipulation" : "auto",
                      // Ensure minimum touch target size on mobile
                      minWidth: isMobile ? "44px" : "auto",
                    }}
                  >
                    About
                  </Link>
                </li>
              </ul>
            </nav>
          </DeviceStyle>
        </ResponsiveContainer>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-space-blue py-4 text-center">
        <ResponsiveContainer maxWidth="full" padding="md">
          <ResponsiveText
            mobileSize="xs"
            desktopSize="sm"
            className="font-exo"
            style={{
              fontFamily: "'Exo 2', sans-serif",
            }}
          >
            © {new Date().getFullYear()} ISS Live Tracker | Data provided by
            wheretheiss.at and Open Notify
          </ResponsiveText>
        </ResponsiveContainer>
      </footer>
    </div>
  );
};

export default MainLayout;
