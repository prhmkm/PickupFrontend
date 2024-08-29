import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import { useAuth } from "./hooks/useAuth";

const App: React.FC = () => {
  const { isAuthenticated, login } = useAuth();

  return (
    <ChakraProvider>
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
            element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/home" : "/login"} />}
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
};

export default App;
