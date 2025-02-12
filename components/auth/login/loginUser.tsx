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
import { getFirstAccessibleRoute } from "@/utils/getFirstAccessibleRoute";
import getUserHabilitation from "@/utils/getHabilitation";
import { API_AUTH_SUIVI } from "@/config/constants";
import axiosInstance from "@/utils/axios";
import { decodeTokens } from "@/utils/tokendecod";

const ComponentsAuthLoginForm = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useSelector((state: TRootState) => state.auth?.user);
  const [showPassword, setShowPassword] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasNumber: false,
    matches: false,
  });
  const [isLoading, setIsLoading] = useState(false);

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
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setBackground(reader.result);
          setIsCustomBackground(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    return () => {
      if (isCustomBackground && background !== defaultBackground) {
        URL.revokeObjectURL(background);
      }
    };
  }, [background, isCustomBackground]);

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

  const { firstname = "", lastname = "" } = user || {};

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      setPasswordStrength({
        hasMinLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasNumber: /[0-9]/.test(value),
        matches: value === passwordForm.confirmPassword && value !== "",
      });
    } else if (name === "confirmPassword") {
      setPasswordStrength((prev) => ({
        ...prev,
        matches: value === passwordForm.password && value !== "",
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!passwordForm.password) {
      errors.password = "Le mot de passe est requis";
      isValid = false;
    } else {
      if (passwordForm.password.length < 5) {
        errors.password = "Le mot de passe doit contenir au moins 5 caractères";
        isValid = false;
      }
      if (!/[A-Z]/.test(passwordForm.password)) {
        errors.password =
          "Le mot de passe doit contenir au moins une majuscule";
        isValid = false;
      }
      if (!/[0-9]/.test(passwordForm.password)) {
        errors.password = "Le mot de passe doit contenir au moins un chiffre";
        isValid = false;
      }
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "La confirmation du mot de passe est requise";
      isValid = false;
    } else if (passwordForm.password !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  const handlePasswordSubmit = async () => {
    if (!validatePasswordForm()) return;

    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        `${API_AUTH_SUIVI}/auth/change-password`,
        {
          email: credential,
          password: passwordForm.password,
          confirmPassword: passwordForm.confirmPassword,
        }
      );

      if (response?.data?.error === false) {
        setIsLoading(false);
        setShowFirstLoginModal(false);

        Toastify("success", "Mot de passe modifié avec succès !");

        // Continuer avec la connexion normale
        const habilitation = getUserHabilitation();
        if (!habilitation) {
          Toastify("error", "Erreur lors de la récupération des permissions");
          setIsAnimating(false);
          return;
        }

        const redirectPath = getFirstAccessibleRoute(habilitation);
        if (redirectPath === "/login") {
          Toastify(
            "error",
            "Vous n'avez accès à aucune section de l'application"
          );
          setIsAnimating(false);
          return;
        }

        Toastify(
          "success",
          `Félicitation ${firstname} ${lastname} vous êtes connecté avec succès`
        );

        // Utiliser replace au lieu de push pour éviter les retours en arrière
        router.replace(redirectPath);
      }
    } catch (error: any) {
      setIsLoading(false);
      Toastify(
        "error",
        error.response?.data?.message ||
          "Erreur lors du changement de mot de passe"
      );
    }
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnimating(true);

    try {
      const result = await dispatch(login({ credential, password }));

      if (login.fulfilled.match(result)) {
        // Attendre un peu pour s'assurer que le token est bien enregistré
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Décoder le token pour obtenir les informations utilisateur
        const decodedUser = decodeTokens(result.payload);

        if (decodedUser?.isFirstLogin === 0) {
          setShowFirstLoginModal(true);
          setIsAnimating(false);
          return;
        }

        const habilitation = getUserHabilitation();
        if (!habilitation) {
          Toastify("error", "Erreur lors de la récupération des permissions");
          setIsAnimating(false);
          return;
        }

        // const redirectPath = getFirstAccessibleRoute(habilitation);
        // if (redirectPath === "/login") {
        //   Toastify(
        //     "error",
        //     "Vous n'avez accès à aucune section de l'application"
        //   );
        //   setIsAnimating(false);
        //   return;
        // }

        Toastify(
          "success",
          `Félicitation ${firstname} ${lastname} vous êtes connecté avec succès`
        );

        // Utiliser replace au lieu de push pour éviter les retours en arrière
        router.replace("dashboard");
      } else {
        setIsAnimating(false);
        Toastify("error", "Échec de la connexion. Vérifiez vos identifiants.");
      }
    } catch (error) {
      setIsAnimating(false);
      Toastify("error", "Une erreur est survenue lors de la connexion");
      console.error("Erreur de connexion:", error);
    }
  };

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={background}
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
          priority
          quality={75}
        />
      </div>
      {/* Boutons fixes pour changer le fond d'écran */}
      <div className="fixed right-6 top-6 z-20 flex items-center gap-3">
        <label className="group flex cursor-pointer items-center gap-2 rounded-xl bg-white/10 px-5 py-3 backdrop-blur-md transition-all duration-300 hover:bg-white/20">
          <div className="relative">
            <div className="absolute -inset-1 animate-pulse rounded-full bg-primary/20 blur-sm group-hover:bg-primary/30"></div>
            <IconDownload className="relative h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="text-sm font-medium text-white">
            Changer le fond d'ecran
          </span>
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </label>
        {isCustomBackground && (
          <button
            onClick={resetBackground}
            className="group flex items-center gap-2 rounded-xl bg-white/10 px-5 py-3 backdrop-blur-md transition-all duration-300 hover:bg-white/20"
          >
            <div className="relative">
              <div className="absolute -inset-1 animate-pulse rounded-full bg-red-500/20 blur-sm group-hover:bg-red-500/30"></div>
              <IconTrashLines className="relative h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110" />
            </div>
            <span className="text-sm font-medium text-white">
              Réinitialiser
            </span>
          </button>
        )}
      </div>

      {/* Affichage du fond et autres éléments */}
      {!isCustomBackground && (
        <>
          <div className="absolute inset-0 flex">
            <div className="w-1/2 border-r-4 border-white bg-[#FFDFBD]" />
            <div className="w-1/2 border-l-4 border-white bg-[#F07D00]" />
          </div>

          <Image
            src="/assets/images/auth/electric-circuit-white.svg"
            alt="Thunder Left"
            className="absolute bottom-0 left-0 h-[600px] w-auto rotate-90 opacity-90"
            width={181}
            height={82}
          />
          <Image
            src="/assets/images/auth/electric-circuit-white.svg"
            alt="Thunder Right"
            className="absolute right-0 top-0 h-[600px] w-auto -rotate-90 opacity-90"
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
            className="relative transition-transform duration-500 group-hover:scale-105"
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        <div className="relative">
          <div className="mb-10 flex items-center justify-between">
            <div className="relative">
              <div className="absolute -left-3 -top-3 h-16 w-16 animate-pulse rounded-full bg-primary/10 blur-lg" />
              <div className="absolute -left-2 -top-2 h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5" />
              <div className="relative">
                <h2 className="mb-3 text-4xl font-bold tracking-tight text-gray-900">
                  Connexion
                </h2>
                <p className="text-lg font-medium text-primary/90">
                  Bienvenue à Suivi Encaissement !
                </p>
              </div>
            </div>
            <div className="group relative h-[110px] w-[110px] overflow-hidden ">
              <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute -inset-1 animate-pulse transition-opacity duration-300 group-hover:opacity-100" />
              <Image
                src="/assets/images/suivi.png"
                alt="Logo"
                layout="fill"
                objectFit="contain"
                className="p-2 transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          </div>

          <form className="space-y-7" onSubmit={submitForm}>
            <div className="space-y-2.5">
              <label
                htmlFor="Credential"
                className="block text-base font-semibold text-gray-800"
              >
                Email ou Matricule
              </label>
              <div className="group relative transform transition-all duration-300 hover:scale-[1.01]">
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/50 to-primary/30 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative">
                  <input
                    id="Credential"
                    type="text"
                    placeholder="Entrez votre email ou matricule"
                    className="relative w-full rounded-xl border-2 border-gray-200 bg-white/90 px-5 py-4 text-base transition-all duration-300 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/20 group-hover:border-primary/60"
                    value={credential}
                    onChange={(e) => setCredential(e.target.value)}
                    required
                  />
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-all duration-300 group-focus-within:bg-primary/10 group-focus-within:text-primary group-hover:bg-primary/10 group-hover:text-primary">
                      <IconUserCheck className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <label
                htmlFor="Password"
                className="block text-base font-semibold text-gray-800"
              >
                Mot de passe
              </label>
              <div className="group relative transform transition-all duration-300 hover:scale-[1.01]">
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/50 to-primary/30 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative">
                  <input
                    id="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Entrez votre mot de passe"
                    className="relative w-full rounded-xl border-2 border-gray-200 bg-white/90 px-5 py-4 text-base transition-all duration-300 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/20 group-hover:border-primary/60"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={togglePasswordVisibility}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-all duration-300 hover:bg-primary/10 hover:text-primary">
                      {showPassword ? (
                        <IconEyeOff className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
                      ) : (
                        <IconEye className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                className="group relative text-sm font-medium text-gray-600 transition-all duration-300 hover:text-primary"
                onClick={() => setIsModalOpen(true)}
              >
                Mot de passe oublié ?
                <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            </div>

            <button
              type="submit"
              disabled={isAnimating}
              className="group relative w-full transform overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary/90 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="relative z-10 text-base font-semibold tracking-wide">
                {isAnimating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Connexion en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <IconUserCheck className="h-5 w-5" />
                    <span>Se connecter</span>
                  </div>
                )}
              </span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover:translate-x-full" />
              <div className="absolute inset-0 h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <ForgotPasswordModal closeModal={() => setIsModalOpen(false)} />
      )}

      {showFirstLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Changement de mot de passe requis
              </h3>
            </div>
            <p className="mb-6 text-base text-gray-600">
              Pour des raisons de sécurité, vous devez changer votre mot de
              passe lors de votre première connexion.
            </p>
            <div className="space-y-5">
              {/* Nouveau mot de passe */}
              <div>
                <label className="mb-2 block text-base font-semibold text-gray-800">
                  Nouveau mot de passe
                </label>
                <div className="group relative transform transition-all duration-300 hover:scale-[1.01]">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={passwordForm.password}
                    onChange={handlePasswordChange}
                    className={`w-full rounded-xl border-2 bg-white/80 px-5 py-4 text-base text-gray-700 transition-all duration-300 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/20 group-hover:border-primary/60 ${
                      passwordErrors.password
                        ? "border-red-300"
                        : "border-gray-200"
                    }`}
                    placeholder="Votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-300 hover:scale-110 hover:text-primary"
                  >
                    {showPassword ? (
                      <IconEyeOff className="h-6 w-6 text-gray-500 transition-colors duration-300 hover:text-primary" />
                    ) : (
                      <IconEye className="h-6 w-6 text-gray-500 transition-colors duration-300 hover:text-primary" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmation du mot de passe */}
              <div>
                <label className="mb-2 block text-base font-semibold text-gray-800">
                  Confirmer le mot de passe
                </label>
                <div className="group relative transform transition-all duration-300 hover:scale-[1.01]">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full rounded-xl border-2 bg-white/80 px-5 py-4 text-base text-gray-700 transition-all duration-300 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/20 group-hover:border-primary/60 ${
                      passwordErrors.confirmPassword
                        ? "border-red-300"
                        : passwordStrength.matches
                        ? "border-green-300"
                        : "border-gray-200"
                    }`}
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                </div>
                {passwordErrors.confirmPassword ? (
                  <p className="mt-1 text-sm text-red-500">
                    {passwordErrors.confirmPassword}
                  </p>
                ) : (
                  passwordStrength.matches && (
                    <p className="mt-1 text-sm text-green-500">
                      Les mots de passe correspondent
                    </p>
                  )
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handlePasswordSubmit}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Changer le mot de passe"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentsAuthLoginForm;
