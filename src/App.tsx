import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ISSProvider } from './state/ISSContext';
import { PerformanceProvider } from './state/PerformanceContext';
import { DeviceProvider } from './state/DeviceContext';
import { UIProvider } from './state/UIContext';
import MainLayout from './layouts/MainLayout';
import { ROUTES } from './routes';

const App: React.FC = () => {
  return (
    <Router>
      <DeviceProvider>
        <ISSProvider>
          <PerformanceProvider>
            <UIProvider>
              <Suspense fallback={
                <div className="flex items-center justify-center h-screen bg-space-black text-iss-white">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Loading...</h2>
                    <div className="w-12 h-12 border-4 border-iss-highlight border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={React.createElement(ROUTES.HOME.component)} />
                  <Route path={ROUTES.ABOUT.path.substring(1)} element={React.createElement(ROUTES.ABOUT.component)} />
                  <Route path={ROUTES.RESPONSIVE_TEST.path.substring(1)} element={React.createElement(ROUTES.RESPONSIVE_TEST.component)} />
                  <Route path="index.html" element={<Navigate to="/" replace />} />
                  <Route path="*" element={React.createElement(ROUTES.NOT_FOUND.component)} />
                </Route>
              </Routes>
            </Suspense>
            </UIProvider>
          </PerformanceProvider>
        </ISSProvider>
      </DeviceProvider>
    </Router>
  );
};

export default App;
