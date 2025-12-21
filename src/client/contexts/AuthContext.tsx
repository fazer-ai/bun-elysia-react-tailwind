import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/client/lib/api";

export interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.api.auth.me.get();
        if (data?.user) {
          setUser(data.user);
        }
      } catch {
        // NOTE: User not authenticated
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const logout = async () => {
    try {
      await api.api.auth.logout.post();
      setUser(null);
    } catch {
      console.error("Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-text-secondary">
          {t("common.loading", "Loading...")}
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
