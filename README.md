# 🛰️ ISS Live Tracker

An interactive web application that displays the real-time position of the International Space Station (ISS) on a 3D globe, complete with crew information, orbital data, and stunning visualizations.

![ISS Live Tracker](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Vite](https://img.shields.io/badge/Vite-7.0.5-purple)
![Three.js](https://img.shields.io/badge/Three.js-0.178.0-black)

## ✨ Features

- **Real-time ISS Tracking**: Live position updates every 5 seconds using the wheretheiss.at API
- **3D Earth Globe**: Interactive 3D visualization with realistic Earth textures
- **Orbital Data**: Current coordinates, altitude, velocity, and orbital information
- **Crew Information**: Details about current ISS crew members
- **Interactive Controls**: Zoom, rotate, and navigate around the globe
- **Day/Night Cycle**: Visual representation of Earth's illumination
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Atmospheric Effects**: Realistic lighting and atmospheric glow

## 🚀 Technology Stack

- **Frontend Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 7.0.5
- **3D Graphics**: Three.js + React Three Fiber + Drei
- **Routing**: React Router DOM
- **Styling**: CSS with Tailwind-like utilities
- **HTTP Client**: Axios for API requests
- **Testing**: Vitest + React Testing Library

## 🛠️ Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd satellite-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
# or
npm start
```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

In the project directory, you can run:

### `npm run dev` or `npm start`

Runs the app in development mode using Vite's dev server.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload automatically when you make changes.\
You'll also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include hashes for optimal caching.\
Your app is ready to be deployed!

### `npm run preview`

Serves the production build locally for testing.\
Use this to preview your production build before deployment.

### `npm test`

Launches the test runner (Vitest) in interactive watch mode.\
Tests are written using React Testing Library and run in a jsdom environment.

## 🌍 API Integration

This application uses the [wheretheiss.at API](https://wheretheiss.at/w/developer) to fetch real-time ISS position data:

- **Endpoint**: `https://api.wheretheiss.at/v1/satellites/25544`
- **Update Frequency**: Every 5 seconds
- **Data Includes**: Latitude, longitude, altitude, velocity, visibility

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Globe/          # 3D globe and ISS visualization
│   └── InfoPanel/      # Data display components
├── hooks/              # Custom React hooks
├── layouts/            # Page layout templates
├── pages/              # Route-specific pages
├── services/           # API calls and service logic
├── state/              # React Context for global state
├── types/              # TypeScript interfaces
├── utils/              # Helper functions and constants
└── assets/             # Textures, models, and static assets
```

## 🎮 Usage

1. **View ISS Position**: The 3D globe shows the current ISS location in real-time
2. **Interactive Controls**: 
   - Click and drag to rotate the globe
   - Scroll to zoom in/out
   - Use the info panel to see detailed orbital data
3. **Crew Information**: View current ISS crew members and mission details
4. **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Deployment

The application can be deployed to any static hosting service:

- **Vercel**: Connect your repository for automatic deployments
- **Netlify**: Drag and drop the `dist` folder after running `npm run build`
- **GitHub Pages**: Use the built-in GitHub Actions workflow

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [wheretheiss.at](https://wheretheiss.at/) for providing the ISS tracking API
- [Three.js](https://threejs.org/) for 3D graphics capabilities
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) for React integration
- NASA for Earth texture maps and ISS data

## 📊 Performance

- **Bundle Size**: Optimized with code splitting and tree shaking
- **3D Rendering**: 60fps on modern devices
- **Memory Usage**: Efficient texture and geometry management
- **API Calls**: Minimal bandwidth usage with smart caching

---

Built with ❤️ using React, TypeScript, and Three.js
