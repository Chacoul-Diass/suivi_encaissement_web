"use client";

import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import ContentAnimation from "@/components/layouts/content-animation";
import Footer from "@/components/layouts/footer";
import Header from "@/components/layouts/header";
import MainContainer from "@/components/layouts/main-container";
import ScrollToTop from "@/components/layouts/scroll-to-top";
import Sidebar from "@/components/layouts/sidebar";
import Portals from "@/components/portals";

export default function DefaultLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideSidebarAndHeader = pathname === "/";

  return (
    <>
      <Portals>
        <ScrollToTop />

        <MainContainer>
          {!hideSidebarAndHeader && (
            <div className="fixed left-0 top-0 z-50 flex h-full flex-col border-r border-gray-100 bg-white">
              <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <span className="text-lg font-bold text-white">S</span>
                  </div>
                  <span className="text-lg font-medium">Suivi</span>
                </div>
              </div>
              <Sidebar />
            </div>
          )}

          <div className={`main-content flex min-h-screen flex-col ${!hideSidebarAndHeader ? "ml-[280px]" : ""}`}>
            {!hideSidebarAndHeader && <Header />}

            <ContentAnimation>{children}</ContentAnimation>

            {!hideSidebarAndHeader && <Footer />}
          </div>
        </MainContainer>
      </Portals>
    </>
  );
}
