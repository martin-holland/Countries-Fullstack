import { Box } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthRedirect } from "./components/Auth/AuthRedirect";
import { Login } from "./components/Auth/Login";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { Navigation } from "./components/Navigation";
import { ProtectedTestData } from "./components/ProtectedTestData";
import { TestData } from "./components/TestData";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Box>
          <Navigation />
          <Box sx={{ p: 3 }}>
            <Routes>
              <Route
                path="/login"
                element={
                  <>
                    <AuthRedirect />
                    <Login />
                  </>
                }
              />
              <Route
                path="/"
                element={
                  <Box>
                    <h1>Welcome to the Home Page</h1>
                    <p>Use the navigation above to explore the app</p>
                  </Box>
                }
              />
              <Route path="/test" element={<TestData />} />
              <Route
                path="/protected"
                element={
                  <ProtectedRoute>
                    <ProtectedTestData />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
