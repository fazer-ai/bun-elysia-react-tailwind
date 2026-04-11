import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useAuth } from "@/client/contexts/AuthContext";
import { api } from "@/client/lib/api";
import type { ApiErrorPayload } from "@/client/lib/types";

interface UseGoogleSignInOptions {
  onError: (message: string) => void;
}

interface UseGoogleSignInResult {
  pending: boolean;
  signIn: (credential: string) => Promise<void>;
}

export function useGoogleSignIn({
  onError,
}: UseGoogleSignInOptions): UseGoogleSignInResult {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [pending, setPending] = useState(false);

  const signIn = async (credential: string) => {
    if (pending) return;
    setPending(true);
    try {
      const { data, error: apiError } = await api.api.auth.google.post({
        credential,
      });
      if (apiError) {
        onError(
          (apiError.value as ApiErrorPayload)?.error ||
            t("auth.googleSignInFailed", "Google sign-in failed"),
        );
        return;
      }
      if (data?.user) {
        login(data.user);
        navigate("/");
      }
    } catch {
      onError(t("auth.googleSignInFailed", "Google sign-in failed"));
    } finally {
      setPending(false);
    }
  };

  return { pending, signIn };
}
