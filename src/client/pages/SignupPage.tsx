import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import { Button } from "@/client/components";
import { useAuth } from "@/client/contexts/AuthContext";
import { api } from "@/client/lib/api";

export function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.passwordsNoMatch", "Passwords do not match"));
      return;
    }

    setLoading(true);

    try {
      const { data, error: apiError } = await api.api.auth.signup.post({
        email,
        password,
      });

      if (apiError) {
        setError(
          (apiError.value as { error?: string })?.error ||
            t("auth.signupFailed", "Signup failed"),
        );
        return;
      }

      if (data?.user) {
        login(data.user);
        navigate("/");
      }
    } catch {
      setError(
        t("auth.genericError", "Something went wrong. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-text-primary">
          {t("auth.createAccount", "Create Account")}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-bg-secondary p-6 rounded-xl border border-border space-y-4"
        >
          {error && (
            <div className="bg-error-soft border border-error text-error px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-text-primary text-sm font-medium mb-1"
            >
              {t("auth.email", "Email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-bg-tertiary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-border-focus transition-colors placeholder-text-muted"
              placeholder={t("auth.emailPlaceholder", "you@example.com")}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-text-primary text-sm font-medium mb-1"
            >
              {t("auth.password", "Password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-bg-tertiary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-border-focus transition-colors placeholder-text-muted"
              placeholder="••••••••"
            />
            <p className="text-text-muted text-xs mt-1">
              {t("auth.passwordMinLength", "Must be at least 8 characters")}
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-text-primary text-sm font-medium mb-1"
            >
              {t("auth.confirmPassword", "Confirm Password")}
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full bg-bg-tertiary border border-border rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-border-focus transition-colors placeholder-text-muted"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full">
            {loading
              ? t("auth.creatingAccount", "Creating account...")
              : t("auth.signup", "Sign Up")}
          </Button>
        </form>

        <p className="text-center mt-4 text-text-secondary">
          {t("auth.hasAccount", "Already have an account?")}{" "}
          <Link to="/login" className="text-accent hover:underline font-medium">
            {t("auth.login", "Login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
