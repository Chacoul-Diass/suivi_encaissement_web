"use client";

import Link from "next/link";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useDispatch, useSelector } from "react-redux";

import { getTranslation } from "@/i18n";
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
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// -- Icônes
import IconCaretsDown from "@/components/icon/icon-carets-down";
import IconMinus from "@/components/icon/icon-minus";
import IconBank from "@/components/icon/icon-bank";
import IconCash from "@/components/icon/icon-cash";
import IconClipboardCheck from "@/components/icon/icon-clipboard-check";
import IconFileCheck from "@/components/icon/icon-file-check";
import IconSettings from "@/components/icon/icon-settings";
import IconUserCheck from "@/components/icon/icon-user-check";

import { safeLocalStorage } from "@/hooks/useLocalStorage";
import { TRootState } from "@/store";

type MenuItem = {
  href: string;
  icon: React.ElementType;
  label: string;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const { t } = getTranslation();
  const pathname = usePathname();
  const [habilitation, setHabilitation] = useState<any>(null);
  const themeConfig = useSelector((state: TRootState) => state.themeConfig);

  const { initLocale } = getTranslation();
  const [isLoading, setIsLoading] = useState(true);

  const menuSections: MenuSection[] = [
    {
      title: t("Encaissements"),
      items: [
        {
          href: "/encaissements/nouveau",
          icon: IconCash,
          label: t("Nouveau"),
        },
        {
          href: "/encaissements/validation",
          icon: IconClipboardCheck,
          label: t("Validation"),
        },
        {
          href: "/encaissements/reverses",
          icon: IconBank,
          label: t("Reversés"),
        },
        {
          href: "/encaissements/traites",
          icon: IconFileCheck,
          label: t("Traités"),
        },
      ],
    },
    {
      title: t("Administration"),
      items: [
        {
          href: "/utilisateurs",
          icon: IconUserCheck,
          label: t("Utilisateurs"),
        },
        {
          href: "/parametres",
          icon: IconSettings,
          label: t("Paramètres"),
        },
      ],
    },
  ];

  useEffect(() => {
    const selector = document.querySelector(
      '.sidebar ul a[href="' + window.location.pathname + '"]'
    );

    if (selector) {
      selector.classList.add("active");
      const ul: any = selector.closest("ul.sub-menu");
      if (ul) {
        let ele: any =
          ul.closest("li.menu")?.querySelectorAll(".nav-link") || [];
        if (ele.length) {
          ele = ele[0];
          setTimeout(() => {
            ele.click();
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    setActiveRoute();
    if (window.innerWidth < 1024) {
      dispatch(toggleSidebar());
    }
  }, [pathname]);

  const setActiveRoute = () => {
    const allLinks = document.querySelectorAll(".sidebar ul a.active");
    allLinks.forEach((link) => link.classList.remove("active"));

    const selector = document.querySelector(
      '.sidebar ul a[href="' + window.location.pathname + '"]'
    );
    selector?.classList.add("active");
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
          className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] text-white-dark shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300`}
        >
          <div className="h-full bg-gradient-to-b from-black to-gray-900">
            <div className="pt-4">
              <div className="mx-auto flex max-w-sm items-center justify-center gap-1 rounded-xl bg-black/40 backdrop-blur-sm px-6 py-4 shadow-lg">
                <img
                  src="/assets/images/logo-cie.png"
                  alt="Logo CIE"
                  className="h-[130px] w-[130px] hover:scale-105 transition-transform duration-300"
                />
              </div>

              <h1 className="text-center text-3xl font-extrabold text-[#1DCCF7] mt-2 tracking-wider">
                <span className="text-[#FB5283] hover:text-pink-400 transition-colors duration-300">Suivi</span>
                <span className="text-[#C9CC27] hover:text-yellow-300 transition-colors duration-300">Encaissement</span>
              </h1>

              <div className="flex items-center justify-end px-4 py-2">
                <button
                  type="button"
                  className="collapse-icon flex h-8 w-8 items-center justify-center rounded-full bg-gray-800/50 hover:bg-gray-700 transition-all duration-300"
                  onClick={() => dispatch(toggleSidebar())}
                >
                  <IconCaretsDown className="rotate-90 text-red-500 hover:text-red-400 transition-colors duration-300" />
                </button>
              </div>
            </div>

            <PerfectScrollbar className="relative h-[calc(100vh-250px)] px-4">
              {menuSections.map((section, idx) => (
                <div key={idx} className="mb-4">
                  <h2 className="mb-2 flex items-center rounded-lg bg-black/30 px-4 py-2.5 font-bold uppercase text-sm tracking-wider text-gray-300">
                    <IconMinus className="mr-2 h-4 w-4 text-gray-500" />
                    <span>{section.title}</span>
                  </h2>

                  <ul className="list-none space-y-1 pl-2">
                    {section.items.map((item, indexItem) => {
                      const IconComponent = item.icon;
                      return (
                        <li key={indexItem} className="sub-menu nav-item">
                          <Link href={item.href} className="group">
                            <div className="flex items-center rounded-lg px-3 py-2.5 transition-all duration-300 hover:bg-blue-500/10 hover:backdrop-blur-sm">
                              <IconComponent className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-[#1DCCF7] transition-colors duration-300" />
                              <span className="ml-3 text-gray-300 group-hover:text-white transition-colors duration-300">
                                {item.label}
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </PerfectScrollbar>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
