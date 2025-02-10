"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import IconEye from "@/components/icon/icon-eye";
import IconEyeOff from "@/components/icon/icon-eye-off";
import IconTrashLines from "@/components/icon/icon-trash-lines";
import ForgotPasswordModal from "@/components/auth/components/modals/ForgotPasswordModal";
import { useRouter } from "next/navigation";
import IconDownload from "@/components/icon/icon-download";
import { login } from "@/store/reducers/auth/user.slice";
import { TRootState, useAppDispatch } from "@/store";
import { Toastify } from "@/utils/toast";
import { useSelector } from "react-redux";
import IconUserCheck from "@/components/icon/icon-user-check";

const ComponentsAuthLoginForm = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");

  const defaultBackground = "/assets/images/auth/default-bg.jpg";
  const [background, setBackground] = useState(defaultBackground);
  const [isCustomBackground, setIsCustomBackground] = useState(false);

  useEffect(() => {
    const savedBackground = localStorage.getItem("userBackground");
    if (savedBackground) {
      setBackground(savedBackground);
      setIsCustomBackground(true);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [selectedImageName, setSelectedImageName] = useState(
    "Aucune image choisie"
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setBackground(base64);
        setIsCustomBackground(true);
        localStorage.setItem("userBackground", base64); // Sauvegarde l'image dans le localStorage
      };
      reader.readAsDataURL(file);
      setSelectedImageName(file.name);
    }
  };

  const resetBackground = () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir réinitialiser le fond d'écran par défaut ?"
      )
    ) {
      setBackground(defaultBackground);
      setIsCustomBackground(false);
      localStorage.removeItem("userBackground");
      setSelectedImageName("Aucune image choisie");
    }
  };

  const user = useSelector((state: TRootState) => state.auth?.user);

  const { firstname = "", lastname = "" } = user || {};

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!credential || !password) {
    //   Toastify(
    //     "error",
    //     "Veuillez entrer un email ou un matricule et un mot de passe."
    //   );
    //   return;
    // }

    setIsAnimating(true);

    const result = await dispatch(login({ credential, password }));
    if (login.fulfilled.match(result)) {
      Toastify(
        "success",
        `Félicitation ${firstname} ${lastname} vous êtes connecté avec succès`
      );
      router.push("/dashboard");
    } else {
      setIsAnimating(false);
      Toastify("error", "Échec de la connexion. Vérifiez vos identifiants.");
    }
  };

  return (
    <div
      className="relative flex h-screen items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Boutons flottants pour uploader et réinitialiser l'image */}
      <div className="fixed bottom-8 right-8 z-30 flex flex-col items-end gap-3">
        {/* Bouton d'upload */}
        <label
          htmlFor="file-upload"
          className="group relative flex cursor-pointer items-center gap-3 rounded-full bg-white/95 px-6 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-primary/10 hover:shadow-xl"
        >
          <IconDownload className="h-5 w-5 text-primary transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
          <span className="text-sm font-medium text-primary">
            Changer le Fond d'écran
          </span>
          <div className="absolute inset-0 rounded-full bg-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </label>
        <input
          type="file"
          name="file-upload"
          id="file-upload"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* Bouton de réinitialisation */}
        {isCustomBackground && (
          <button
            type="button"
            onClick={resetBackground}
            className="group relative flex items-center gap-3 rounded-full bg-white/95 px-6 py-3 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-red-50 hover:shadow-xl"
          >
            <IconTrashLines className="h-5 w-5 text-red-500 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-110" />
            <span className="text-sm font-medium text-red-500">
              Réinitialiser
            </span>
            <div className="absolute inset-0 rounded-full bg-red-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </button>
        )}
      </div>

      {/* Affichage du fond et autres éléments */}
      {!isCustomBackground && (
        <>
          <div className="absolute inset-0 flex">
            <div className="w-1/2 border-r-4 border-white bg-gradient-to-br from-[#FFDFBD] to-[#FFE8CF] transition-all duration-500" />
            <div className="w-1/2 border-l-4 border-white bg-gradient-to-tl from-[#F07D00] to-[#FF9B2B] transition-all duration-500" />
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-white/5" />

          <Image
            src="/assets/images/auth/electric-circuit-white.svg"
            alt="Thunder Left"
            className="absolute bottom-0 left-0 h-[600px] w-auto rotate-90 opacity-90 transition-transform duration-700 hover:scale-105"
            width={181}
            height={82}
          />
          <Image
            src="/assets/images/auth/electric-circuit-white.svg"
            alt="Thunder Right"
            className="absolute right-0 top-0 h-[600px] w-auto -rotate-90 opacity-90 transition-transform duration-700 hover:scale-105"
            width={181}
            height={82}
          />
        </>
      )}

      <div className="absolute left-5 top-5 z-10">
        <div className="group relative overflow-hidden rounded-lg p-1">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
          <Image
            src="/assets/images/auth/logo.png"
            alt="Logo"
            width={65}
            height={82}
            className="relative transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </div>

      <div
        className={`right-50 absolute top-0 z-10 transition-all duration-1000 ${
          isAnimating ? "translate-y-[35vh] scale-110 opacity-0" : ""
        }`}
      >
        <Image
          src="/assets/images/auth/light-vertical.png"
          alt="Vertical Light"
          className="h-72 w-auto animate-pulse"
          width={281}
          height={182}
        />
      </div>

      <div
        className={`relative z-20 w-full max-w-lg overflow-hidden rounded-[30px] bg-white/95 p-8 shadow-2xl backdrop-blur-sm transition-all duration-500 ${
          isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"
        } ${isSmallScreen ? "mx-4" : ""}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20" />
        <div className="relative">
          <div className="mb-8 flex items-center justify-between">
            <div className="relative">
              <div className="absolute -left-2 -top-2 h-12 w-12 rounded-full bg-primary/10" />
              <div className="relative">
                <h2 className="mb-2 text-3xl font-bold text-gray-900">
                  Connexion
                </h2>
                <p className="text-lg font-medium text-primary">
                  Bienvenue à Suivi Encaissement !
                </p>
              </div>
            </div>
            <div className="group relative h-[100px] w-[100px] overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <Image
                src="/assets/images/suivi.png"
                alt="Logo"
                layout="fill"
                objectFit="contain"
                className="transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          </div>

          <form className="space-y-6" onSubmit={submitForm}>
            <div className="space-y-2">
              <label
                htmlFor="Credential"
                className="block text-sm font-semibold text-gray-700"
              >
                Email ou Matricule
              </label>
              <div className="group relative">
                <input
                  id="Credential"
                  type="text"
                  placeholder="Entrez votre email ou matricule"
                  className="relative z-10 w-full rounded-lg border-2 border-gray-200 bg-gray-50/30 px-4 py-3.5 transition-all duration-300 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 group-hover:border-primary/50"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <IconUserCheck className="pointer-events-none h-5 w-5 text-gray-400 transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-primary group-hover:scale-110 group-hover:text-primary/70" />
                </div>
                <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="Password"
                className="block text-sm font-semibold text-gray-700"
              >
                Mot de passe
              </label>
              <div className="group relative">
                <input
                  id="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez votre mot de passe"
                  className="relative z-10 w-full rounded-lg border-2 border-gray-200 bg-gray-50/30 px-4 py-3.5 transition-all duration-300 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 group-hover:border-primary/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer z-20"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <IconEyeOff className="h-5 w-5 text-gray-500" />
                  ) : (
                    <IconEye className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="relative text-sm font-medium text-gray-500 transition-all duration-300 hover:text-primary"
                onClick={() => setIsModalOpen(true)}
              >
                Mot de passe oublié?
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-primary transition-all duration-300 hover:w-full" />
              </button>
            </div>

            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-lg bg-primary px-8 py-4 text-white shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/30 active:scale-[0.98]"
            >
              <span className="relative z-10 text-base font-semibold">
                Se connecter
              </span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 transition-transform duration-700 group-hover:translate-x-full" />
              <div className="absolute inset-0 h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <ForgotPasswordModal closeModal={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default ComponentsAuthLoginForm;
