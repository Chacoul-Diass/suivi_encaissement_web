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
import IconHistory from "../icon/icon-history";
import IconMenu2 from "../icon/icon-menu-2";
import { IconReport, IconChevronDown, IconChevronUp } from "@tabler/icons-react";

// Style pour les animations des bulles
import { createGlobalStyle } from 'styled-components';

const BubbleAnimations = createGlobalStyle`
  .bubble-1, .bubble-2, .bubble-3, .bubble-4 {
    position: absolute;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.01));
    box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(1px);
  }
  
  .bubble-1 {
    width: 150px;
    height: 150px;
    top: 10%;
    left: -75px;
    opacity: 0.2;
  }
  
  .bubble-2 {
    width: 80px;
    height: 80px;
    top: 30%;
    right: -40px;
    opacity: 0.15;
  }
  
  .bubble-3 {
    width: 200px;
    height: 200px;
    bottom: 20%;
    left: -100px;
    opacity: 0.1;
  }
  
  .bubble-4 {
    width: 120px;
    height: 120px;
    bottom: 10%;
    right: -60px;
    opacity: 0.2;
  }
  
  @keyframes float1 {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-20px) scale(1.05); }
  }
  
  @keyframes float2 {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(15px) scale(1.1); }
  }
  
  @keyframes float3 {
    0%, 100% { transform: translateY(0) scale(1); }
    33% { transform: translateY(-15px) scale(1.08); }
    66% { transform: translateY(10px) scale(0.95); }
  }
  
  @keyframes float4 {
    0%, 100% { transform: translateY(0) scale(1) rotate(0); }
    50% { transform: translateY(20px) scale(1.05) rotate(5deg); }
  }
  
  .animate-float1 { animation: float1 15s ease-in-out infinite; }
  .animate-float2 { animation: float2 12s ease-in-out infinite; }
  .animate-float3 { animation: float3 18s ease-in-out infinite; }
  .animate-float4 { animation: float4 20s ease-in-out infinite; }
`;

const Sidebar = () => {
  const dispatch = useDispatch();
  const { t } = getTranslation();
  const pathname = usePathname() || '';
  const [habilitation, setHabilitation] = useState<any>(null);
  console.log(habilitation, "Habilitation");
  const themeConfig = useSelector((state: TRootState) => state.themeConfig);
  const auth = useSelector((state: TRootState) => state.auth);

  // États pour les sections rétractables
  const [expandedSections, setExpandedSections] = useState({
    Analyse: true,
    Menu: true,
    Administration: false
  });

  // Fonction pour basculer l'état d'une section
  const toggleSection = (section: 'Analyse' | 'Menu' | 'Administration') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
      name: "MES ENCAISSEMENTS",
      icon: <IconDesktop />,
      path: "/encaissement",
      section: "Menu",
    },
    {
      id: 3,
      name: "LITIGES",
      icon: <IconNotesEdit />,
      path: "/litige",
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
      name: "ÉTAT DES ENCAISSEMENTS",
      icon: <IconReport />,
      path: "/etat",
      section: "Menu",
    },
    {
      id: 6,
      name: "HABILITATIONS",
      icon: <IconBellBing />,
      path: "/habilitation",
      section: "Administration",
    },
    {
      id: 7,
      name: "UTILISATEURS",
      icon: <IconUsersGroup />,
      path: "/user",
      section: "Administration",
    },
    {
      id: 8,
      name: "HISTORIQUE CONNEXIONS",
      icon: <IconHistory />,
      path: "/historique",
      section: "Administration",
    },
    {
      id: 9,
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

    // Trouver tous les liens correspondant au chemin actuel
    const currentLinks = document.querySelectorAll(
      `.sidebar ul a[href="${currentPath}"]`
    );

    currentLinks.forEach(currentLink => {
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
    });
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
      case "MES ENCAISSEMENTS":
        return t("Encaissements cloturés");
      case "LITIGES":
        return t("Réclamations");
      case "RAPPROCHEMENT":
        return t("Rapprochements");
      case "ÉTAT DES ENCAISSEMENTS":
        return t("État ");
      case "HABILITATIONS":
        return t("Habilitations");
      case "UTILISATEURS":
        return t("Utilisateurs");
      case "HISTORIQUE CONNEXIONS":
        return t("Historique");
      case "PARAMETRES":
        return t("Paramètres");
      default:
        return t(name);
    }
  };

  const hasAnyPermission = (item: any) => {
    return item.CREER || item.LIRE || item.MODIFIER || item.SUPPRIMER;
  };

  const renderMenu = (section: string) => {
    if (!habilitation) return null;

    // Récupérer tous les menus pour cette section
    const sectionMenus = allowedMenus.filter(menu => menu.section === section);

    // Menus avec permissions explicites
    const permissionMenus = sectionMenus.filter(menu =>
      habilitation.some((item: any) =>
        item.name === menu.name && hasAnyPermission(item)
      )
    );

    // Menus spéciaux ou toujours visibles (comme État des encaissements)
    const specialMenus = sectionMenus.filter(menu =>
      (menu.name === "ÉTAT DES ENCAISSEMENTS") &&
      !habilitation.some((item: any) => item.name === menu.name)
    );

    // Combiner les deux types de menus
    const allSectionMenus = [...permissionMenus, ...specialMenus];

    // Rendre chaque menu
    return allSectionMenus.map(menu => (
      <li key={menu.id} className="nav-item">
        <Link
          href={menu.path}
          className={`group relative flex items-center rounded-xl px-4 py-2.5 text-sm transition-all duration-500 hover:bg-white/10 ${pathname === menu.path
            ? "bg-primary/20 text-white"
            : "text-white/80 hover:text-white"
            }`}
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
          <div className="relative flex items-center gap-3">
            <div
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-500 ${pathname === menu.path
                ? "bg-primary/20 text-primary"
                : "bg-black/20 text-white group-hover:bg-black/40 group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20"
                }`}
            >
              {menu.icon}
              {pathname === menu.path && (
                <span className="absolute -inset-1 rounded-xl bg-primary/20 animate-pulse opacity-75"></span>
              )}
            </div>
            <span className="font-medium tracking-wide text-white transition-all duration-500 group-hover:translate-x-1">
              {translateMenuName(menu.name)}
            </span>
          </div>
        </Link>
      </li>
    ));
  };

  const hasMenuInSection = (section: string) => {
    if (!habilitation) return false;

    // Récupérer tous les menus pour cette section
    const sectionMenus = allowedMenus.filter(menu => menu.section === section);

    // Vérifier s'il y a des menus avec permissions
    const hasPermissionMenus = sectionMenus.some(menu =>
      habilitation.some((item: any) =>
        item.name === menu.name && hasAnyPermission(item)
      )
    );

    // Vérifier s'il y a des menus spéciaux
    const hasSpecialMenus = sectionMenus.some(menu =>
      menu.name === "ÉTAT DES ENCAISSEMENTS" &&
      !habilitation.some((item: any) => item.name === menu.name)
    );

    return hasPermissionMenus || hasSpecialMenus;
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
      <BubbleAnimations />
      <div className="dark">
        <nav
          className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[280px] animate-slideIn bg-gradient-to-br from-[#0E1726] via-[#162236] to-[#1a2941] text-white-dark shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] backdrop-blur-sm transition-all duration-500 ease-in-out overflow-hidden`}
        >
          {/* Bulles d'animation en arrière-plan */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="bubble-1 animate-float1"></div>
            <div className="bubble-2 animate-float2"></div>
            <div className="bubble-3 animate-float3"></div>
            <div className="bubble-4 animate-float4"></div>
          </div>

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
                      <h2
                        onClick={() => toggleSection("Analyse")}
                        className="relative mb-4 flex items-center justify-between cursor-pointer px-2 py-2 text-sm font-bold uppercase tracking-wider text-white/90 rounded-xl hover:bg-white/5 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">

                          <span className="animate-slideRight">
                            {t("Analyse")}
                          </span>
                        </div>
                        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-black/40 hover:bg-primary/30 transition-all duration-300">
                          {expandedSections.Analyse ?
                            <IconChevronUp className="h-4 w-4 text-white/80 transition-transform duration-300" /> :
                            <IconChevronDown className="h-4 w-4 text-white/80 transition-transform duration-300" />
                          }
                          {expandedSections.Analyse && pathname.startsWith('/dashboard') && (
                            <span className="absolute -inset-1 rounded-full bg-primary/20 animate-pulse opacity-75"></span>
                          )}
                        </div>
                      </h2>
                      <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.Analyse ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                          }`}
                      >
                        <ul className="space-y-2 px-2 animate-fadeIn">
                          {renderMenu("Analyse")}
                        </ul>
                      </div>
                    </div>
                  )}

                  {hasMenuInSection("Menu") && (
                    <div className="animate-fadeIn overflow-hidden rounded-2xl bg-black/20 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-black/30 hover:shadow-lg hover:shadow-primary/10">
                      <h2
                        onClick={() => toggleSection("Menu")}
                        className="relative mb-4 flex items-center justify-between cursor-pointer px-2 py-2 text-sm font-bold uppercase tracking-wider text-white/90 rounded-xl hover:bg-white/5 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">

                          <span className="animate-slideRight">{t("Menu")}</span>
                        </div>
                        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-black/40 hover:bg-primary/30 transition-all duration-300">
                          {expandedSections.Menu ?
                            <IconChevronUp className="h-4 w-4 text-white/80 transition-transform duration-300" /> :
                            <IconChevronDown className="h-4 w-4 text-white/80 transition-transform duration-300" />
                          }
                          {expandedSections.Menu && (pathname.startsWith('/encaissement') || pathname.startsWith('/litige') || pathname.startsWith('/rapprochement') || pathname.startsWith('/etat')) && (
                            <span className="absolute -inset-1 rounded-full bg-primary/20 animate-pulse opacity-75"></span>
                          )}
                        </div>
                      </h2>
                      <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.Menu ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                          }`}
                      >
                        <ul className="space-y-2 px-2 animate-fadeIn">
                          {renderMenu("Menu")}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Section Administration */}
                  {hasMenuInSection("Administration") && (
                    <div className="animate-fadeIn overflow-hidden rounded-2xl bg-black/20 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-black/30 hover:shadow-lg hover:shadow-primary/10">
                      <h2
                        onClick={() => toggleSection("Administration")}
                        className="relative mb-4 flex items-center justify-between cursor-pointer px-2 py-2 text-sm font-bold uppercase tracking-wider text-white/90 rounded-xl hover:bg-white/5 transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">

                          <span className="animate-slideRight">
                            {t("Administration")}
                          </span>
                        </div>
                        <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-black/40 hover:bg-primary/30 transition-all duration-300">
                          {expandedSections.Administration ?
                            <IconChevronUp className="h-4 w-4 text-white/80 transition-transform duration-300" /> :
                            <IconChevronDown className="h-4 w-4 text-white/80 transition-transform duration-300" />
                          }
                          {expandedSections.Administration && (pathname.startsWith('/habilitation') || pathname.startsWith('/user') || pathname.startsWith('/historique') || pathname.startsWith('/parametres')) && (
                            <span className="absolute -inset-1 rounded-full bg-primary/20 animate-pulse opacity-75"></span>
                          )}
                        </div>
                      </h2>
                      <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedSections.Administration ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                          }`}
                      >
                        <ul className="space-y-2 px-2 animate-fadeIn">
                          {renderMenu("Administration")}
                        </ul>
                      </div>
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
