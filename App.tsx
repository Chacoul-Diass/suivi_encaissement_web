"use client";
import { PropsWithChildren, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthGuard from "./components/auth/AuthGuard";
import GlobalLoader from "./components/common/GlobalLoader";
import ConnectionStatus from "./components/common/ConnectionStatus";
import { usePathname } from "next/navigation";

function App({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/forgot-password";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <GlobalLoader type="default" message="Chargement en cours..." />;
  }

  return (
    <div className="min-h-screen">
      <ConnectionStatus />
      {isAuthPage ? children : <AuthGuard>{children}</AuthGuard>}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default App;
