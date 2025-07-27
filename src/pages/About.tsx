import React from 'react';
import { Helmet } from 'react-helmet';

const About: React.FC = () => {
  return (
    <>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600&family=Orbitron:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>
      <div className="container mx-auto px-8 py-12 max-w-4xl text-iss-white" style={{fontFamily: "'Exo 2', sans-serif", paddingLeft: "2rem"}}>
        <h1 className="text-4xl font-bold mb-10" style={{fontFamily: "'Orbitron', sans-serif", letterSpacing: "1px"}}>
          About the ISS Live Tracker
        </h1>
      
      <div className="bg-space-blue/30 backdrop-blur-sm rounded-lg p-8 mb-12" style={{borderLeft: "4px solid var(--iss-highlight)", padding:"1rem"}}>
        <h2 className="text-2xl font-semibold mb-6 pl-4" style={{fontFamily: "'Orbitron', sans-serif"}}>The International Space Station</h2>
        <p className="mb-6 pl-4" style={{lineHeight: "1.8", fontSize: "1.05rem"}}>
          The International Space Station (ISS) is a modular space station in low Earth orbit. 
          It's a multinational collaborative project involving NASA (United States), Roscosmos (Russia), 
          JAXA (Japan), ESA (Europe), and CSA (Canada).
        </p>
        <p className="mb-8 pl-4" style={{lineHeight: "1.8", fontSize: "1.05rem"}}>
          The ISS serves as a microgravity and space environment research laboratory where 
          scientific research is conducted in astrobiology, astronomy, meteorology, physics, 
          and other fields.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pl-4">
          <div>
            <h3 className="text-xl font-semibold mb-4" style={{fontFamily: "'Orbitron', sans-serif", color: "var(--iss-highlight)"}}>ISS Facts</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300" style={{paddingLeft: "0.5rem"}}>
              <li>Orbits Earth at approximately 28,000 km/h (17,500 mph)</li>
              <li>Completes 15.5 orbits per day (one orbit every ~90 minutes)</li>
              <li>Orbits at an altitude of approximately 400 km (250 miles)</li>
              <li>Has been continuously occupied since November 2000</li>
              <li>Weighs approximately 420,000 kg (925,000 pounds)</li>
              <li>Has a pressurized volume of about 915 cubic meters</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4" style={{fontFamily: "'Orbitron', sans-serif", color: "var(--iss-highlight)"}}>ISS Components</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-300" style={{paddingLeft: "0.5rem"}}>
              <li>16 pressurized modules</li>
              <li>Solar arrays spanning 73 meters</li>
              <li>Robotic arms for maintenance and docking</li>
              <li>Multiple docking ports for spacecraft</li>
              <li>Scientific laboratories from various countries</li>
              <li>Living quarters for up to 7 astronauts</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-space-blue/30 backdrop-blur-sm rounded-lg p-8 mb-12" style={{borderLeft: "4px solid var(--iss-highlight)", padding:"1rem"}}>
        <h2 className="text-2xl font-semibold mb-6 pl-4" style={{fontFamily: "'Orbitron', sans-serif"}}>About This Application</h2>
        <p className="mb-6 pl-4" style={{lineHeight: "1.8", fontSize: "1.05rem"}}>
          The ISS Live Tracker is a web application that provides real-time tracking of the 
          International Space Station. It visualizes the ISS's current position on a 3D globe 
          and provides additional information about its altitude, velocity, and the crew 
          currently aboard.
        </p>
        <p className="mb-6 pl-4" style={{lineHeight: "1.8", fontSize: "1.05rem"}}>
          This application uses data from the following APIs:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-300 mb-6 pl-4" style={{paddingLeft: "0.5rem"}}>
          <li><a href="https://wheretheiss.at/w/developer" className="text-iss-highlight hover:underline" target="_blank" rel="noopener noreferrer">wheretheiss.at API</a> - For real-time ISS position data</li>
          <li><a href="http://open-notify.org/Open-Notify-API/People-In-Space/" className="text-iss-highlight hover:underline" target="_blank" rel="noopener noreferrer">Open Notify API</a> - For information about astronauts currently in space</li>
        </ul>
        <p className="pl-4" style={{lineHeight: "1.8", fontSize: "1.05rem"}}>
          The 3D visualization is powered by Three.js and React Three Fiber.
        </p>
      </div>
      
      <div className="text-center text-gray-400 text-sm mt-16">
        <p>© {new Date().getFullYear()} ISS Live Tracker | Created for educational purposes</p>
      </div>
      </div>
    </>
  );
};

export default About;
