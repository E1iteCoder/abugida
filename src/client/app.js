import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
    </AuthProvider>
  );
}
