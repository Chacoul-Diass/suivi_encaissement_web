"use client";
import { PropsWithChildren, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./styles/global.css";
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
    return <GlobalLoader />;
  }

  return (
    <div className="min-h-screen">
      <ConnectionStatus />
      {children}
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
