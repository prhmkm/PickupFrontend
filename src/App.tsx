import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { useAuth } from "./hooks/useAuth";

const App: React.FC = () => {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/home" />
            ) : (
              <LoginPage onLogin={login} />
            )
          }
        />
        <Route
          path="/home"
          element={
            isAuthenticated ? <HomePage onLogout={logout} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/home" : "/login"} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
