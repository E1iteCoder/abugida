import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AudioVersionProvider } from "./context/AudioVersionContext";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import Home from "./home";
import Log from "./pages/login";
import Dashboard from "./pages/dashboard";
import Reference from "./pages/reference";
import Form from "./pages/form";
import Introduction from "./pages/dashboard/intro";
import Learn from "./pages/dashboard/learn";
import Practice from "./pages/dashboard/practice";
import Quiz from "./pages/dashboard/quiz";
import Settings from "./pages/settings";
import FlashcardApp from "./components/flashContainer";

// Component to handle GitHub Pages 404 redirects
function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if there's a stored redirect path from 404.html
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath && location.pathname === '/') {
      // Clear the stored path
      sessionStorage.removeItem('redirectPath');
      // Navigate to the stored path
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, location.pathname]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <AudioVersionProvider>
        <BrowserRouter>
        <RedirectHandler />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Log />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reference" element={<Reference />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/form" element={<Form />} />
          <Route path="/dashboard/introduction" element={<Introduction />} />
          <Route path="/dashboard/learn" element={<Learn />} />
          <Route path="/dashboard/practice" element={<Practice />} />
          <Route path="/dashboard/quiz" element={<Quiz />} />
          <Route path="/reference/flashcard" element={<FlashcardApp />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <Footer />
      </BrowserRouter>
      </AudioVersionProvider>
    </AuthProvider>
  );
}
