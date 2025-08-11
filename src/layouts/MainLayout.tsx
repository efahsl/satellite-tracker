import React from "react";
import { Outlet, Link } from "react-router-dom";
import HamburgerMenu from "../components/UI/HamburgerMenu/HamburgerMenu";
import { useDevice } from "../state/DeviceContext";
import { ResponsiveContainer, ResponsiveText, DeviceStyle } from "../components/UI/ResponsiveLayout";

const MainLayout: React.FC = () => {
  const { isMobile, isTVProfile } = useDevice();

  return (
    <div className={`flex flex-col min-h-screen bg-space-black text-iss-white ${isTVProfile ? 'tv-safe-zone tv-typography tv-high-contrast' : ''}`}>
      
      {/* Header */}
      
      {isTVProfile && (
        <HamburgerMenu />
      )}
      
    {!isTVProfile && (
      <header className="bg-space-blue shadow-md">
        <ResponsiveContainer maxWidth="full" padding={isTVProfile ? "lg" : "sm"}>
          <DeviceStyle
            baseClassName="flex justify-between items-center"
            mobileClassName="h-12 px-1"
            desktopClassName={isTVProfile ? "min-h-[72px] px-4" : "min-h-[56px] px-2"}
          >
            <div className="flex items-center">
              <HamburgerMenu />
              <ResponsiveText
                mobileSize="lg"
                desktopSize={isTVProfile ? "3xl" : "xl"}
                weight="bold"
                className={`font-orbitron tracking-wide ml-3 ${isTVProfile ? 'tv-typography' : ''}`}
              >
                ISS Live Tracker
              </ResponsiveText>
            </div>
            
            <nav className="font-exo">
              <ul className={`flex ${isTVProfile ? 'space-x-8' : 'space-x-3 md:space-x-6'}`}>
                <li>
                  <Link
                    to="/"
                    className={`text-white hover:text-iss-highlight transition-colors flex items-center ${isTVProfile ? 'tv-button tv-focus-indicator' : ''}`}
                    style={{
                      fontSize: isTVProfile ? "24px" : (isMobile ? "14px" : "16px"),
                      padding: isTVProfile ? "12px 24px" : (isMobile ? "0 8px" : "4px 8px"),
                      minHeight: isTVProfile ? "48px" : (isMobile ? "32px" : "auto"),
                      minWidth: isTVProfile ? "120px" : (isMobile ? "44px" : "auto"),
                      touchAction: isMobile ? "manipulation" : "auto",
                      borderRadius: isTVProfile ? "8px" : "0",
                    }}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className={`text-white hover:text-iss-highlight transition-colors flex items-center ${isTVProfile ? 'tv-button tv-focus-indicator' : ''}`}
                    style={{
                      fontSize: isTVProfile ? "24px" : (isMobile ? "14px" : "16px"),
                      padding: isTVProfile ? "12px 24px" : (isMobile ? "0 8px" : "4px 8px"),
                      minHeight: isTVProfile ? "48px" : (isMobile ? "32px" : "auto"),
                      minWidth: isTVProfile ? "120px" : (isMobile ? "44px" : "auto"),
                      touchAction: isMobile ? "manipulation" : "auto",
                      borderRadius: isTVProfile ? "8px" : "0",
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
      )}

      {/* Main Content */}
      <main className={`flex-grow ${isTVProfile ? 'tv-typography' : ''}`}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={`bg-space-blue text-center ${isTVProfile ? 'py-6' : 'py-4'}`}>
        <ResponsiveContainer maxWidth="full" padding={isTVProfile ? "lg" : "md"}>
          <ResponsiveText
            mobileSize="xs"
            desktopSize={isTVProfile ? "lg" : "sm"}
            className={`font-exo ${isTVProfile ? 'tv-typography' : ''}`}
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
