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
  const habilitation = getUserHabilitation();
  console.log(habilitation, " habilitation");

  const pathname = usePathname();
  const dispatch = useDispatch();
  const { t } = getTranslation();

  const {
    email = "",
    matricule = "",
    firstname = "",
    lastname = "",
  } = user || {};

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
    <header
      className={`z-40 ${
        themeConfig.semidark && themeConfig.menu === "horizontal" ? "dark" : ""
      }`}
    >
      <div className="shadow-sm">
        <div className="relative flex w-full items-center bg-white px-5 py-2.5 dark:bg-black">
          <div className="horizontal-logo flex items-center justify-between lg:hidden ltr:mr-2 rtl:ml-2">
            <button
              type="button"
              className="collapse-icon flex flex-none rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:text-[#d0d2d6] dark:hover:bg-dark/60 dark:hover:text-primary lg:hidden ltr:ml-2 rtl:mr-2"
              onClick={() => dispatch(toggleSidebar())}
            >
              <IconMenu className="h-5 w-5" />
            </button>
            <Link
              href="/dashboard"
              className="main-logo ml-5 flex shrink-0 items-center"
            >
              <Image
                className="inline w-10 align-top ltr:-ml-1 rtl:-mr-1"
                src="/assets/images/logo.png"
                alt="logo"
                width={50}
                height={50}
              />
              <span className="textl hidden align-middle font-light text-[#C7493D] transition-all duration-300 md:inline ltr:ml-1.5 rtl:mr-1.5">
                Suivi encaissement
              </span>
            </Link>
          </div>

          <p className="ml-6 flex items-center text-success">
            <button
              type="button"
              className={`flex h-10 cursor-default items-center rounded-md font-medium text-success duration-300`}
            >
              <IconSquareRotated className="shrink-0 fill-success" />
            </button>
            <span className="ml-2">{isClient ? displayProfile : ""}</span>
          </p>

          <div className="flex items-center space-x-1.5 dark:text-[#d0d2d6] sm:flex-1 lg:space-x-2 ltr:ml-auto ltr:sm:ml-0 rtl:mr-auto rtl:space-x-reverse sm:rtl:mr-0">
            <div className="sm:ltr:mr-auto sm:rtl:ml-auto">
              <form
                className={`${
                  search && "!block"
                } absolute inset-x-0 top-1/2 z-10 mx-4 hidden -translate-y-1/2 sm:relative sm:top-0 sm:mx-0 sm:block sm:translate-y-0`}
                onSubmit={() => setSearch(false)}
              ></form>
            </div>

            <div className="dropdown right-4 flex shrink-0">
              <Dropdown
                offset={[0, 8]}
                placement={`${isRtl ? "bottom-start" : "bottom-end"}`}
                btnClassName="relative group block "
                button={
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="font-bold text-gray-800">{`${lastname} ${firstname}`}</div>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900">
                      <IconUser className="h-4.5 w-4.5 shrink-0 justify-center" />
                    </div>
                    <IconArrowDown className="absolute -right-5 top-2 h-5 w-5 " />
                  </div>
                }
              >
                <ul className="w-[430px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                  <li>
                    <div className="flex items-center px-4 py-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff6c17]">
                        <IconUser className="h-6 w-6 text-white" />
                      </div>

                      <div className="truncate ltr:pl-4 rtl:pr-4">
                        <h4 className="text-base">
                          {`${lastname} ${firstname}`}
                        </h4>
                        <div className="flex gap-2">
                          <span className="text-sm font-thin text-black hover:text-primary dark:text-dark-light/60 dark:hover:text-white">
                            {email}
                          </span>
                          <span className="rounded bg-success-light px-1 text-xs text-success ">
                            {isClient ? displayProfile : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>

                  <li className="border-t border-white-light dark:border-white-light/10">
                    <Link href="/change" className="!py-3 text-primary">
                      <IconSettings className="h-4.5 w-4.5 shrink-0 rotate-90 ltr:mr-2 rtl:ml-2" />
                      Changer de mot de passe
                    </Link>
                  </li>

                  <li className="border-t border-white-light hover:bg-[#e7515a] hover:bg-opacity-30 dark:border-white-light/10">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center space-x-2 !py-3 !text-[#e7515a]"
                    >
                      <IconLogout className="h-4.5 w-4.5 rotate-90" />
                      <span>Deconnexion</span>
                    </button>
                  </li>
                </ul>
              </Dropdown>
            </div>

            {/* <UserProfile /> */}
          </div>
        </div>

        {/* horizontal menu */}
        <ul className="horizontal-menu border-top hidden border-[#ebedf2] bg-white px-6 py-1.5 font-semibold text-black dark:border-[#191e3a] dark:bg-black dark:text-white-dark lg:space-x-1.5 xl:space-x-8 rtl:space-x-reverse">
          <li className="menu nav-item relative">
            <button type="button" className="nav-link">
              <div className="flex items-center">
                <IconMenuDashboard className="shrink-0" />
                <span className="px-1">{t("dashboard")}</span>
              </div>
              <div className="right_arrow">
                <IconCaretDown />
              </div>
            </button>
          </li>
          <li className="menu nav-item relative">
            <button type="button" className="nav-link">
              <div className="flex items-center">
                <IconMenuApps className="shrink-0" />
                <span className="px-1">{t("apps")}</span>
              </div>
              <div className="right_arrow">
                <IconCaretDown />
              </div>
            </button>
            <ul className="sub-menu">
              <li>
                <button type="button">
                  {t("invoice")}
                  <div className="-rotate-90 ltr:ml-auto rtl:mr-auto rtl:rotate-90">
                    <IconCaretDown />
                  </div>
                </button>
                <ul className="absolute top-0 z-[10] hidden min-w-[180px] rounded bg-white p-0 py-2 text-dark shadow dark:bg-[#1b2e4b] dark:text-white-dark ltr:left-[95%] rtl:right-[95%]">
                  <li>
                    <Link href="/encaissement">{t("Encaissement")}</Link>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li className="menu nav-item relative">
            <button type="button" className="nav-link">
              <div className="flex items-center">
                <IconMenuComponents className="shrink-0" />
                <span className="px-1">{t("components")}</span>
              </div>
              <div className="right_arrow">
                <IconCaretDown />
              </div>
            </button>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
