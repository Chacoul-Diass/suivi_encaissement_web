"use client";

import React from "react";
import Image from "next/image";

interface GlobalLoaderProps {
  fullScreen?: boolean;
  message?: string;
  type?: "default" | "auth" | "table";
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({
  fullScreen = true,
  message = "Chargement en cours...",
  type = "default",
}) => {
  const baseClasses = `flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm ${
    fullScreen
      ? "fixed inset-0 z-[60]"
      : "absolute inset-0 z-50 min-h-[400px] rounded-xl"
  }`;

  const renderLoader = () => {
    switch (type) {
      case "auth":
        return (
          <div className={baseClasses}>
            <div className="relative mb-8 h-16 w-16">
              <Image
                src="/assets/images/auth/suivi.png"
                alt="Logo"
                layout="fill"
                className="animate-pulse object-contain"
              />
            </div>
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-12 w-12">
                  <div className="absolute h-full w-full animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <div className="absolute h-full w-full animate-pulse rounded-full border-4 border-primary/30" />
                </div>
              </div>
              <p className="mt-4 animate-pulse text-base font-medium text-gray-600">
                {message}
              </p>
            </div>
          </div>
        );

      case "table":
        return (
          <div className={baseClasses}>
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-10 w-10">
                  <div className="absolute h-full w-full animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <div className="absolute h-full w-full animate-pulse rounded-full border-4 border-primary/30" />
                </div>
              </div>
              <p className="animate-pulse text-base font-medium text-gray-600">
                {message}
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className={baseClasses}>
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="h-16 w-16">
                  <div className="absolute h-full w-full animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <div className="absolute h-full w-full animate-pulse rounded-full border-4 border-primary/30" />
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-2 w-36 animate-pulse rounded-full bg-primary/30" />
                <p className="animate-pulse text-base font-medium text-gray-600">
                  {message}
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderLoader();
};

export default GlobalLoader;
