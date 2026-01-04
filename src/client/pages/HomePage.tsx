import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";
import { Button, Card } from "@/client/components";
import { useAuth } from "@/client/contexts/AuthContext";
import logo from "@/public/assets/logo.svg";

export function HomePage() {
  const { t } = useTranslation();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-text-secondary">
          {t("common.loading", "Loading...")}
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto p-8 text-center">
        <div className="flex justify-end items-center gap-4 mb-8">
          <span className="text-text-secondary text-sm">{user.email}</span>
          <Button variant="secondary" onClick={logout}>
            {t("auth.logout", "Logout")}
          </Button>
        </div>

        <div className="flex justify-center items-center gap-8 mb-8">
          <img
            src={logo}
            alt="Bun Logo"
            className="h-24 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#3b82f6aa] scale-120"
          />
        </div>

        <Card className="mb-8 inline-block p-4">
          <p className="text-text-primary">
            {t("home.welcome", "Welcome, {{email}}!", { email: user.email })}
          </p>
          <p className="text-text-muted text-sm">
            {t("home.role", "Role: {{role}}", { role: user.role })}
          </p>
        </Card>
      </div>
    </div>
  );
}
