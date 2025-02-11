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
import DraggableButtons from "../components/DraggableButtons";
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
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Décoder le token pour obtenir les informations utilisateur
        const decodedUser = decodeTokens(result.payload);
        console.log("Decoded user:", decodedUser);

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
      <DraggableButtons
        handleFileChange={handleFileChange}
        resetBackground={resetBackground}
        isCustomBackground={isCustomBackground}
      />

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
                  className="absolute right-4 top-1/2 z-20 -translate-y-1/2 cursor-pointer"
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

      {showFirstLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Changement de mot de passe requis
              </h3>
            </div>
            <p className="mb-6 text-sm text-gray-600">
              Pour des raisons de sécurité, vous devez changer votre mot de
              passe lors de votre première connexion.
            </p>
            <div className="space-y-4">
              {/* Nouveau mot de passe */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </label>
                <div className="group relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={passwordForm.password}
                    onChange={handlePasswordChange}
                    className={`w-full rounded-xl border bg-gray-50 px-4 py-2.5 pr-12 text-gray-700 transition-all duration-200 focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 ${
                      passwordErrors.password
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Indicateurs de force du mot de passe */}
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        passwordStrength.hasMinLength
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span
                      className={`text-xs ${
                        passwordStrength.hasMinLength
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      Au moins 8 caractères
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        passwordStrength.hasUpperCase
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span
                      className={`text-xs ${
                        passwordStrength.hasUpperCase
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      Au moins une majuscule
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        passwordStrength.hasNumber
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></div>
                    <span
                      className={`text-xs ${
                        passwordStrength.hasNumber
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      Au moins un chiffre
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmation du mot de passe */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <div className="group relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full rounded-xl border bg-gray-50 px-4 py-2.5 pr-12 text-gray-700 transition-all duration-200 focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 ${
                      passwordErrors.confirmPassword
                        ? "border-red-300"
                        : passwordStrength.matches
                        ? "border-green-300"
                        : "border-gray-300"
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
