import { Box } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AiQueryAssistant } from "./components/AI/AiQueryAssistant";
import { AuthRedirect } from "./components/Auth/AuthRedirect";
import { Login } from "./components/Auth/Login";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { CountriesList } from "./components/Countries/CountriesList";
import { CountryDetail } from "./components/Countries/CountryDetail";
import { Favorites } from "./components/Countries/Favorites";
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
              <Route path="/" element={<CountriesList />} />
              <Route path="/countries" element={<CountriesList />} />
              <Route path="/countries/:name" element={<CountryDetail />} />
              <Route path="/test" element={<TestData />} />
              <Route
                path="/protected"
                element={
                  <ProtectedRoute>
                    <ProtectedTestData />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-assistant"
                element={
                  <ProtectedRoute>
                    <AiQueryAssistant />
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
