import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Redirect any unknown routes to /register */}
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="*" element={<Navigate to="/register" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
