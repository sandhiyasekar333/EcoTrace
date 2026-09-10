import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import WelcomePage from "./pages/WelcomePage";
import Dashboard from "./pages/Dashboard";
import AddEWastePage from "./pages/AddEWastePage";
import EcoValueResultPage from "./pages/EcoValueResultPage";
import RecyclerMatchingPage from "./pages/RecyclerMatchingPage";
import RecyclerOffersPage from "./pages/RecyclerOffersPage";
import LotPassportPage from "./pages/LotPassportPage";
import MyLotsPage from "./pages/MyLotsPage";
import ProfilePage from "./pages/ProfilePage";
import "./App.css";

export default function App() {
  const [collector, setCollector] = useState(() => {
    const savedUser = localStorage.getItem("ecoTraceUser") || localStorage.getItem("collector");
    if (!savedUser) return null;
    try {
      const parsed = JSON.parse(savedUser);
      const normalized = {
        ...parsed,
        email: parsed.email || "",
        mobile: parsed.mobile || parsed.mobileNumber || "",
        language: parsed.language || parsed.preferredLanguage || localStorage.getItem("language") || "en",
      };
      localStorage.setItem("ecoTraceUser", JSON.stringify(normalized));
      return normalized;
    } catch {
      localStorage.removeItem("ecoTraceUser");
      localStorage.removeItem("collector");
      return null;
    }
  });
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "en");
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleLogin = (collectorData) => {
    const user = {
      name: collectorData.name,
      email: collectorData.email,
      mobile: collectorData.mobile || collectorData.mobileNumber,
      location: collectorData.location,
      language: collectorData.language || collectorData.preferredLanguage || language,
    };
    localStorage.setItem("ecoTraceUser", JSON.stringify(user));
    localStorage.setItem("collector", JSON.stringify(user));
    setCollector(user);
    setLanguage(user.language);
  };

  const handleChangeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const handleLogout = () => {
    localStorage.removeItem("ecoTraceUser");
    localStorage.removeItem("collector");
    setCollector(null);
  };

  return (
    <Router>
      <div className="app">
        {!isOnline && (
          <div className="offline-banner">
            <span>📡 Offline Mode - Data will sync when online</span>
          </div>
        )}
        
        <Routes>
          {!collector ? (
            <Route
              path="*"
              element={
                <WelcomePage
                  onLogin={handleLogin}
                  language={language}
                  onLanguageChange={handleChangeLanguage}
                />
              }
            />
          ) : (
            <>
              <Route
                path="/"
                element={
                  <Dashboard
                    collector={collector}
                    language={language}
                    onLanguageChange={handleChangeLanguage}
                    onLogout={handleLogout}
                  />
                }
              />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route
                path="/add-waste"
                element={
                  <AddEWastePage
                    collector={collector}
                    language={language}
                  />
                }
              />
              <Route
                path="/eco-value-result/:evaluationId"
                element={
                  <EcoValueResultPage
                    collector={collector}
                    language={language}
                  />
                }
              />
              <Route
                path="/recycler-matching/:evaluationId"
                element={
                  <RecyclerMatchingPage
                    collector={collector}
                    language={language}
                  />
                }
              />
              <Route
                path="/recycler-offers/:evaluationId"
                element={
                  <RecyclerOffersPage
                    collector={collector}
                    language={language}
                  />
                }
              />
              <Route
                path="/lot-passport/:lotId"
                element={
                  <LotPassportPage
                    collector={collector}
                    language={language}
                  />
                }
              />
              <Route
                path="/my-lots"
                element={
                  <MyLotsPage
                    collector={collector}
                    language={language}
                  />
                }
              />
              <Route
                path="/profile"
                element={
                  <ProfilePage
                    collector={collector}
                    language={language}
                    onLogout={handleLogout}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}
