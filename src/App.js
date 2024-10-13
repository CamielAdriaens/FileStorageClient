import './App.css';  // Global CSS file
import { AppRoutes } from './AppRoutes';  // Import the AppRoutes component

function App() {
  return (
    <div className="app">
      {/* Navbar will be included in every page as part of App.js */}
      <AppRoutes />
    </div>
  );
}

export default App;
