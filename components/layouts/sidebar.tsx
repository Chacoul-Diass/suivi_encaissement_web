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
// import IconHistory from "@/components/icon/icon-history";
import getUserHabilitation from "@/utils/getHabilitation";
import { TRootState } from "@/store";
import { safeLocalStorage } from "@/hooks/useLocalStorage";
import IconCaretsDown from "@/components/icon/icon-carets-down";
import IconHistory from "../icon/icon-history";
import IconMenu2 from "../icon/icon-menu-2";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { t } = getTranslation();
  const pathname = usePathname();
  const [habilitation, setHabilitation] = useState<any>(null);
  console.log(habilitation, "Habilitation");
  const themeConfig = useSelector((state: TRootState) => state.themeConfig);
  const auth = useSelector((state: TRootState) => state.auth);

  const { initLocale } = getTranslation();
  const [isLoading, setIsLoading] = useState(true);

  // Get habilitation on client side only
  useEffect(() => {
    if (auth?.user) {
      setHabilitation(getUserHabilitation());
    }
  }, [auth?.user]);

  useEffect(() => {
    if (!isLoading && !auth?.user) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
      window.location.href = "/auth/login";
      return;
    }
  }, [isLoading, auth?.user]);

  const allowedMenus = [
    {
      id: 1,
      name: "DASHBOARD",
      icon: <IconMenuCharts />,
      path: "/dashboard",
      section: "Analyse",
    },
    {
      id: 2,
      name: "MES ENCAISEMENTS",
      icon: <IconDesktop />,
      path: "/encaissement",
      section: "Menu",
    },
    {
      id: 3,
      name: "RECLAMATION",
      icon: <IconNotesEdit />,
      path: "/reclamation",
      section: "Menu",
    },
    {
      id: 4,
      name: "RAPPROCHEMENT",
      icon: <IconLink />,
      path: "/rapprochement",
      section: "Menu",
    },
    {
      id: 5,
      name: "HABILITATIONS",
      icon: <IconBellBing />,
      path: "/habilitation",
      section: "Administration",
    },
    {
      id: 6,
      name: "UTILISATEURS",
      icon: <IconUsersGroup />,
      path: "/user",
      section: "Administration",
    },
    {
      id: 7,
      name: "HISTORIQUE CONNEXIONS",
      icon: <IconHistory />,
      path: "/historique",
      section: "Administration",
    },
    {
      id: 8,
      name: "PARAMETRES",
      icon: <IconMenu2 />,
      path: "/parametres",
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
      case "HISTORIQUE CONNEXIONS":
        return t("Historique");
      case "PARAMETRES":
        return t("Paramètres email");
      default:
        return t(name);
    }
  };

  const hasAnyPermission = (item: any) => {
    return item.CREER || item.LIRE || item.MODIFIER || item.SUPPRIMER;
  };

  const renderMenu = (section: string) => {
    if (!habilitation) return null;

    return habilitation
      .filter(
        (item: {
          name: string;
          LIRE: boolean;
          CREER: boolean;
          MODIFIER: boolean;
          SUPPRIMER: boolean;
        }) => {
          const menu = allowedMenus.find(
            (menu) =>
              menu.name === item.name &&
              menu.section === section &&
              hasAnyPermission(item)
          );
          return !!menu;
        }
      )
      .map((item: { name: string; id: Key | null | undefined }) => {
        const menu = allowedMenus.find((menu) => menu.name === item.name);
        if (!menu) return null;

        return (
          <li key={item.id || menu.id} className="nav-item">
            <Link
              href={menu.path}
              className={`group relative flex items-center rounded-xl px-4 py-2.5 text-sm transition-all duration-500 hover:bg-white/10 ${
                pathname === menu.path
                  ? "bg-primary/20 text-white"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="relative flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-500 ${
                    pathname === menu.path
                      ? "bg-primary/20 text-primary"
                      : "bg-black/20 text-white group-hover:bg-black/40 group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20"
                  }`}
                >
                  {menu.icon}
                </div>
                <span className="font-medium tracking-wide text-white transition-all duration-500 group-hover:translate-x-1">
                  {translateMenuName(menu.name)}
                </span>
              </div>
            </Link>
          </li>
        );
      });
  };

  const hasMenuInSection = (section: string) => {
    if (!habilitation) return false;

    return habilitation.some((item: any) => {
      const menu = allowedMenus.find(
        (menu) =>
          menu.name === item.name &&
          menu.section === section &&
          hasAnyPermission(item)
      );
      return !!menu;
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
          className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[280px] animate-slideIn bg-gradient-to-br from-[#0E1726] via-[#162236] to-[#1a2941] text-white-dark shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] backdrop-blur-sm transition-all duration-500 ease-in-out`}
        >
          <div className="h-full">
            {/* Header avec effet glassmorphism amélioré et animation */}
            <div className="relative border-b border-white/10 bg-gradient-to-r from-[#1a2941]/80 to-[#0E1726]/80 px-6 py-5 backdrop-blur-md">
              <div className="flex items-center justify-center">
                <div className="group relative rounded-2xl bg-white/5 p-3 transition-all duration-500 hover:bg-white/10 hover:shadow-lg hover:shadow-primary/20">
                  <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/50 to-[#1a2941]/50 opacity-0 blur transition duration-500 group-hover:opacity-100"></div>
                  <img
                    className="relative h-[50px] w-auto transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                    src="/assets/images/suivi.png"
                    alt="logo"
                  />
                </div>
              </div>
            </div>

            {/* Contenu avec animations améliorées */}
            <div className="flex h-[calc(100%-88px)] flex-col justify-between p-4">
              <PerfectScrollbar className="relative -mr-4 h-full pr-4">
                <div className="space-y-8">
                  {/* Section Statistiques */}

                  {hasMenuInSection("Analyse") && (
                    <div className="animate-fadeIn overflow-hidden rounded-2xl bg-black/20 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-black/30 hover:shadow-lg hover:shadow-primary/10">
                      <h2 className="mb-4 flex items-center gap-3 px-2 text-sm font-bold uppercase tracking-wider text-white/90">
                        <IconMinus className="h-4 w-4 text-primary/80" />
                        <span className="animate-slideRight">
                          {t("Analyse")}
                        </span>
                      </h2>
                      <ul className="space-y-2 px-2">
                        {renderMenu("Analyse")}
                      </ul>
                    </div>
                  )}

                  {hasMenuInSection("Menu") && (
                    <div className="animate-fadeIn overflow-hidden rounded-2xl bg-black/20 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-black/30 hover:shadow-lg hover:shadow-primary/10">
                      <h2 className="mb-4 flex items-center gap-3 px-2 text-sm font-bold uppercase tracking-wider text-white/90">
                        <IconMinus className="h-4 w-4 text-primary/80" />
                        <span className="animate-slideRight">{t("Menu")}</span>
                      </h2>
                      <ul className="space-y-2 px-2">{renderMenu("Menu")}</ul>
                    </div>
                  )}

                  {/* Section Administration */}
                  {hasMenuInSection("Administration") && (
                    <div className="animate-fadeIn overflow-hidden rounded-2xl bg-black/20 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-black/30 hover:shadow-lg hover:shadow-primary/10">
                      <h2 className="mb-4 flex items-center gap-3 px-2 text-sm font-bold uppercase tracking-wider text-white/90">
                        <IconMinus className="h-4 w-4 text-primary/80" />
                        <span className="animate-slideRight">
                          {t("Administration")}
                        </span>
                      </h2>
                      <ul className="space-y-2 px-2">
                        {renderMenu("Administration")}
                      </ul>
                    </div>
                  )}
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
