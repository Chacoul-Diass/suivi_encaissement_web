"use client";
import { TRootState } from "@/store";
import React from "react";
import { useSelector } from "react-redux";

const MainContainer = ({ children }: { children: React.ReactNode }) => {
  const themeConfig = useSelector((state: TRootState) => state.themeConfig);
  return (
    <div
      className={`${themeConfig.navbar} main-container text-black dark:text-white-dark`}
    >
      {children}
    </div>
  );
};

export default MainContainer;
