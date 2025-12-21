import "@/public/index.css";
import "@/client/lib/i18n";
import { HashRouter, Route, Routes } from "react-router";
import { AuthProvider } from "@/client/contexts/AuthContext";
import { HomePage } from "@/client/pages/HomePage";
import { LoginPage } from "@/client/pages/LoginPage";
import { SignupPage } from "@/client/pages/SignupPage";

export function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
