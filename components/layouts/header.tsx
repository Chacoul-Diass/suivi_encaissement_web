"use client";
import Dropdown from "@/components/dropdown";
import IconMenu from "@/components/icon/icon-menu";
import { getTranslation } from "@/i18n";
import { TRootState } from "@/store";
import { toggleSidebar } from "@/store/themeConfigSlice";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import IconCaretDown from "@/components/icon/icon-caret-down";
import IconLogout from "@/components/icon/icon-logout";
import IconMenuApps from "@/components/icon/menu/icon-menu-apps";
import IconMenuComponents from "@/components/icon/menu/icon-menu-components";
import IconMenuDashboard from "@/components/icon/menu/icon-menu-dashboard";

import { API_AUTH_SUIVI } from "@/config/constants";
import { handleApiError } from "@/utils/apiErrorHandler";
import axios from "@/utils/axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import IconArrowDown from "../icon/icon-arrow-down";
import IconSettings from "../icon/icon-settings";
import IconSquareRotated from "../icon/icon-square-rotated";
import IconUser from "../icon/icon-user";
import { useClientSide, safeDOM } from "@/hooks/useClientSide";
import getUserHabilitation from "@/utils/getHabilitation";

const Header = () => {
  const router = useRouter();
  const user = useSelector((state: TRootState) => state.auth?.user);
  const userLogin = useSelector((state: TRootState) => state.auth?.loading);
  const habilitation = getUserHabilitation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = usePathname();
  const dispatch = useDispatch();
  const { t } = getTranslation();

  const {
    email = "",
    matricule = "",
    firstname = "",
    lastname = "",
  } = user || {};

  const displayName = mounted ? `${firstname} ${lastname}`.trim() : "";

  const profile = user?.profile?.name;
  const [displayProfile, setDisplayProfile] = useState("");
  const isClient = useClientSide();

  useEffect(() => {
    if (isClient && profile) {
      setDisplayProfile(profile === "ADMIN" ? "ADMINISTRATEUR" : profile);
    }
  }, [isClient, profile]);

  const updateMenuActiveState = () => {
    const currentPath = window.location.pathname;
    const selector = safeDOM.querySelector(
      `ul.horizontal-menu a[href="${currentPath}"]`
    );

    if (selector) {
      const allActiveLinks = safeDOM.querySelectorAll(
        "ul.horizontal-menu .nav-link.active"
      );
      allActiveLinks.forEach((link) => {
        link.classList.remove("active");
      });

      selector.classList.add("active");
    }
  };

  useEffect(() => {
    if (isClient) {
      updateMenuActiveState();
    }
  }, [pathname, isClient]);

  const isRtl =
    useSelector((state: TRootState) => state.themeConfig.rtlClass) === "rtl";

  const themeConfig = useSelector((state: TRootState) => state.themeConfig);

  const [search, setSearch] = useState(false);

  const handleLogout = async () => {
    let refresh_token = localStorage.getItem("refresh_token");

    const payload = {
      refreshToken: refresh_token,
    };

    try {
      const response: any = await axios.post(
        `${API_AUTH_SUIVI}/auth/logout`,
        payload
      );

      if (response.statusCode === 201) {
        // localStorage.removeItem("persist:suivi-encaissement");
        // localStorage.removeItem("refresh_token");
        localStorage.clear();
        router.push("/login");
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    }
  };

  return (
    <header className="z-40">
      <div className="bg-white shadow-sm">
        <div className="relative flex w-full items-center justify-between px-5 py-2.5">
          <div className="ml-8 flex items-center">
            <div className="flex flex-col">
              <h1 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-2xl font-bold text-transparent">
                Suivi des Encaissements
              </h1>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-500">
                  Système de gestion
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative">
              <Dropdown
                offset={[0, 12]}
                placement={"bottom-end"}
                btnClassName="relative group"
                button={
                  <div className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 bg-white p-2.5 px-4 transition-all duration-300 hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-2 ring-white">
                      {userLogin ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <IconUser className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {displayName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{profile || "Utilisateur"}</span>
                        <span className="inline-block h-1 w-1 rounded-full bg-gray-300"></span>
                        <span>{matricule}</span>
                      </div>
                    </div>
                    <IconArrowDown className="h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:rotate-180" />
                  </div>
                }
              >
                <ul className="w-[320px] divide-y divide-gray-100 rounded-xl border border-gray-100/50 bg-white !py-2 font-medium text-gray-600 shadow-xl">
                  <li className="px-4 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                          <IconUser className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-base font-semibold text-gray-900">
                          {displayName}
                        </h4>
                        <p className="mt-0.5 truncate text-sm text-gray-500">
                          {email}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {profile || "Utilisateur"}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            {matricule}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <Link
                      href="/profil"
                      className="group flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300 hover:bg-gray-50"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 transition-colors duration-300 group-hover:bg-gray-200">
                        <IconSettings className="h-4.5 w-4.5 text-gray-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">
                          Paramètres du profil
                        </span>
                        <span className="text-xs text-gray-500">
                          Gérer vos préférences
                        </span>
                      </div>
                    </Link>
                  </li>
                  <li>
                    <button
                      className="group flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition-all duration-300 hover:bg-red-50"
                      onClick={handleLogout}
                      disabled={userLogin}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 transition-colors duration-300 group-hover:bg-red-200">
                        {userLogin ? (
                          <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <IconLogout className="h-4.5 w-4.5 text-red-600" />
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Se déconnecter</span>
                        <span className="text-xs text-red-500">
                          Terminer la session
                        </span>
                      </div>
                    </button>
                  </li>
                </ul>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
