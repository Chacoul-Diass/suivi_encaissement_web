"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import GlobalLoader from "../common/GlobalLoader";
import { useSelector } from "react-redux";
import { TRootState } from "@/store";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const user = useSelector((state: TRootState) => state.auth?.user);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (!user) {
          router.replace("/login");
          return;
        }
        setIsVerifying(false);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        router.replace("/login");
      }
    };

    verifyAuth();
  }, [router, user]);

  if (isVerifying) {
    return (
      <GlobalLoader
        type="auth"
        message="Vérification de l'authentification..."
      />
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
