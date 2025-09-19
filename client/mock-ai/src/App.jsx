import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CategorySelection from "./pages/CategorySelection";
import RoleSelection from "./pages/RoleSelection";
import ProfileSetup from "./pages/ProfileSetup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/categories" element={<CategorySelection />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/roles" element={<RoleSelection />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ✅ Catch-all: redirects anything invalid (like /index.html) back to / */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
