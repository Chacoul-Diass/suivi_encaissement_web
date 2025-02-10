"use client";

import PerfectScrollbar from "react-perfect-scrollbar";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  toggleAnimation,
  toggleLayout,
  toggleMenu,
  toggleNavbar,
  toggleRTL,
  toggleSemidark,
  toggleSidebar,
  toggleTheme,
} from "@/store/themeConfigSlice";
import { useState, useEffect, Key } from "react";
import { usePathname } from "next/navigation";
import { getTranslation } from "@/i18n";
import IconDesktop from "../icon/icon-desktop";
import IconNotesEdit from "../icon/icon-notes-edit";
import IconMenuCharts from "../icon/menu/icon-menu-charts";
import IconBellBing from "../icon/icon-bell-bing";
import IconLink from "../icon/icon-link";
import IconUsersGroup from "../icon/icon-users-group";
import IconMinus from "@/components/icon/icon-minus";
import getUserHabilitation from "@/utils/getHabilitation";
import { TRootState } from "@/store";
import { safeLocalStorage } from "@/hooks/useLocalStorage";
import IconCaretsDown from "@/components/icon/icon-carets-down";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { t } = getTranslation();
  const pathname = usePathname();
  const [habilitation, setHabilitation] = useState<any>(null);
  const themeConfig = useSelector((state: TRootState) => state.themeConfig);

  const { initLocale } = getTranslation();
  const [isLoading, setIsLoading] = useState(true);

  // Get habilitation on client side only
  useEffect(() => {
    setHabilitation(getUserHabilitation());
  }, []);

  const allowedMenus = [
    {
      id: 1,
      name: "DASHBOARD",
      icon: <IconDesktop />,
      path: "/dashboard",
      section: "Tableau de bord",
    },
    {
      id: 2,
      name: "MES ENCAISEMENTS",
      icon: <IconNotesEdit />,
      path: "/encaissement",
      section: "Encaissements",
    },
    {
      id: 11,
      name: "RECLAMATION",
      icon: <IconBellBing />,
      path: "/reclamation",
      section: "Encaissements",
    },
    {
      id: 12,
      name: "RAPPROCHEMENT",
      icon: <IconLink />,
      path: "/rapprochement",
      section: "Encaissements",
    },
    {
      id: 5,
      name: "HABILITATIONS",
      icon: <IconMenuCharts />,
      path: "/profil",
      section: "Administration",
    },
    {
      id: 4,
      name: "UTILISATEURS",
      icon: <IconUsersGroup />,
      path: "/user",
      section: "Administration",
    },
  ];

  const updateActiveLink = () => {
    if (typeof window === "undefined") return;

    // Supprimer la classe active de tous les liens
    const allLinks = document.querySelectorAll(".sidebar ul a.active");
    allLinks.forEach((link) => link.classList.remove("active"));

    // Ajouter la classe active au lien correspondant à la page actuelle
    const currentPath = window.location.pathname;
    const currentLink = document.querySelector(
      `.sidebar ul a[href="${currentPath}"]`
    );

    if (currentLink) {
      currentLink.classList.add("active");

      // Gérer le sous-menu si nécessaire
      const subMenu = currentLink.closest("ul.sub-menu");
      if (subMenu) {
        const parentNavLink = subMenu
          .closest("li.menu")
          ?.querySelector(".nav-link");
        if (parentNavLink) {
          setTimeout(() => {
            parentNavLink.classList.add("active");
          });
        }
      }
    }
  };

  useEffect(() => {
    updateActiveLink();
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      dispatch(toggleSidebar());
    }
  }, [pathname]);

  const translateMenuName = (name: string) => {
    switch (name) {
      case "DASHBOARD":
        return t("Tableau de bord");
      case "MES ENCAISEMENTS":
        return t("Encaissements");
      case "RECLAMATION":
        return t("Réclamations");
      case "RAPPROCHEMENT":
        return t("Rapprochements");
      case "HABILITATIONS":
        return t("Habilitations");
      case "UTILISATEURS":
        return t("Utilisateurs");
      default:
        return t(name);
    }
  };

  const renderMenu = (section: string) => {
    return habilitation
      ?.filter((item: { name: string; LIRE: any }) => {
        const menu = allowedMenus.find(
          (menu) =>
            menu.name === item.name && menu.section === section && item.LIRE
        );
        return !!menu;
      })
      .map((item: { name: string; id: Key | null | undefined }) => {
        const menu = allowedMenus.find((menu) => menu.name === item.name);
        return (
          menu && (
            <li key={menu.id} className="nav-item">
              <Link
                href={menu.path}
                className={`group flex items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-300 hover:bg-white/5 ${
                  pathname === menu.path
                    ? "bg-primary/20 text-white"
                    : "text-white hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
                      pathname === menu.path
                        ? "bg-primary/20 text-primary"
                        : "text-white"
                    }`}
                  >
                    {menu.icon}
                  </div>
                  <span className="font-medium text-white">
                    {translateMenuName(menu.name)}
                  </span>
                </div>
              </Link>
            </li>
          )
        );
      });
  };

  useEffect(() => {
    dispatch(
      toggleTheme(safeLocalStorage.getItem("theme") || themeConfig.theme)
    );
    dispatch(toggleMenu(safeLocalStorage.getItem("menu") || themeConfig.menu));
    dispatch(
      toggleLayout(safeLocalStorage.getItem("layout") || themeConfig.layout)
    );
    dispatch(
      toggleRTL(safeLocalStorage.getItem("rtlClass") || themeConfig.rtlClass)
    );
    dispatch(
      toggleAnimation(
        safeLocalStorage.getItem("animation") || themeConfig.animation
      )
    );
    dispatch(
      toggleNavbar(safeLocalStorage.getItem("navbar") || themeConfig.navbar)
    );
    dispatch(
      toggleSemidark(
        safeLocalStorage.getItem("semidark") || themeConfig.semidark
      )
    );
    // locale
    initLocale(themeConfig.locale);

    setIsLoading(false);
  }, [
    dispatch,
    initLocale,
    themeConfig.theme,
    themeConfig.menu,
    themeConfig.layout,
    themeConfig.rtlClass,
    themeConfig.animation,
    themeConfig.navbar,
    themeConfig.locale,
    themeConfig.semidark,
  ]);

  return (
    <div
      className={`
      ${themeConfig.menu}
      ${themeConfig.layout}
      ${themeConfig.rtlClass}
      main-section relative font-nunito text-sm font-normal antialiased
    `}
    >
      <div className="dark">
        <nav
          className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[280px] bg-gradient-to-b from-[#0E1726] to-[#1a2941] text-white-dark shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300`}
        >
          <div className="h-full">
            {/* Header de la sidebar avec effet glassmorphism */}
            <div className="relative border-b border-white/20 bg-gradient-to-r from-[#1a2941] to-[#0E1726] px-4 py-4 shadow-lg">
              <div className="flex items-center justify-center">
                <div className="rounded-xl bg-white/10 p-2">
                  <img
                    className="h-[60px] w-auto drop-shadow-lg"
                    src="/assets/images/suivi.png"
                    alt="logo"
                  />
                </div>
              </div>
            </div>

            {/* Contenu de la sidebar avec effet glassmorphism */}
            <div className="flex h-[calc(100%-88px)] flex-col justify-between p-4">
              <PerfectScrollbar className="relative -mr-4 h-full pr-4">
                <div className="space-y-6">
                  {/* Section Statistiques */}
                  <div className="rounded-xl bg-black p-4">
                    <h2 className="mb-4 flex items-center gap-3 px-2 text-sm font-bold uppercase text-white">
                      <IconMinus className="h-4 w-4" />
                      <span>{t("Statistiques")}</span>
                    </h2>
                    <ul className="space-y-1 px-2">
                      {renderMenu("Tableau de bord")}
                    </ul>
                  </div>

                  {/* Section Gestion des Encaissements */}
                  <div className="rounded-xl bg-black p-4">
                    <h2 className="mb-4 flex items-center gap-3 px-2 text-sm font-bold uppercase text-white">
                      <IconMinus className="h-4 w-4" />
                      <span>{t("Gestion des Encaissements")}</span>
                    </h2>
                    <ul className="space-y-1 px-2">
                      {renderMenu("Encaissements")}
                    </ul>
                  </div>

                  {/* Section Administration */}
                  <div className="rounded-xl bg-black p-4">
                    <h2 className="mb-4 flex items-center gap-3 px-2 text-sm font-bold uppercase text-white">
                      <IconMinus className="h-4 w-4" />
                      <span>{t("Administration")}</span>
                    </h2>
                    <ul className="space-y-1 px-2">
                      {renderMenu("Administration")}
                    </ul>
                  </div>
                </div>
              </PerfectScrollbar>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};
export default Sidebar;
