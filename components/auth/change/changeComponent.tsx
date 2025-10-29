"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import IconEye from "@/components/icon/icon-eye";
import IconTrashLines from "@/components/icon/icon-trash-lines"; // Importez l'icône de suppression
import ForgotPasswordModal from "@/components/auth/components/modals/ForgotPasswordModal";
import { useRouter } from "next/navigation";
import IconDownload from "@/components/icon/icon-download";
import { login } from "@/store/reducers/auth/user.slice";
import { TRootState, useAppDispatch } from "@/store";
import { Toastify } from "@/utils/toast";
import { useSelector } from "react-redux";

const ComponentsAuthLoginForm = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  //   const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [credential, setCredential] = useState(""); // Champ unique pour email ou matricule
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
    if (!credential || !password) {
      Toastify(
        "error",
        "Veuillez entrer un email ou un matricule et un mot de passe."
      );
      return;
    }

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
      <div className="fixed bottom-0 right-0 z-30 flex -translate-y-1/2 transform flex-col items-end gap-2">
        {/* Bouton d'upload */}
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex items-center gap-2 rounded-[10px] bg-white p-3 shadow-lg hover:bg-orange-100">
            <IconDownload className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary">
              Changer le Fond d'écran
            </span>
          </div>
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
            className="flex items-center gap-2 rounded-[10px] bg-white p-3 shadow-lg hover:bg-red-100"
          >
            <IconTrashLines className="h-6 w-6 text-red-500" />
            <span className="text-sm font-medium text-red-500">
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
        <Image
          src="/assets/images/auth/logo.png"
          alt="Logo"
          width={65}
          height={82}
        />
      </div>

      <div
        className={`right-50 absolute top-0 z-10 transition-transform duration-1000 ${
          isAnimating ? "translate-y-[35vh]" : ""
        }`}
      >
        <Image
          src="/assets/images/auth/light-vertical.png"
          alt="Vertical Light"
          className="h-72 w-auto"
          width={281}
          height={182}
        />
      </div>

      <div
        className={`relative z-20 w-full max-w-lg rounded-[30px] bg-white p-8 shadow-xl transition-opacity duration-500 ${
          isAnimating ? "opacity-0" : "opacity-100"
        } ${isSmallScreen ? "mx-4" : ""}`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">
            Modifier le mot de passe
          </h2>
          <Image
            src="/assets/images/logo2.png"
            alt=""
            width={100}
            height={100}
          />
        </div>
        <p className="font-bold text-gray-500">
          Bienvenue à Suivi Encaissement !
        </p>

        {/* <form className="space-y-6 pt-5" onSubmit={submitForm}>
          <div>
            <label
              htmlFor="Credential"
              className="block text-sm font-medium text-gray-700"
            >
              Email ou Matricule
            </label>
            <input
              id="Credential"
              type="text"
              placeholder="Entrez votre email ou matricule"
              className="w-full rounded-md border px-4 py-3 shadow-sm focus:border-primary focus:ring-primary"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="Password"
              className="block text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>
            <div className="relative mt-1">
              <input
                id="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="w-full rounded-md border px-4 py-3 shadow-sm focus:border-primary focus:ring-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                <IconEye
                  className={showPassword ? "text-primary" : "text-gray-500"}
                />
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-gray-500 hover:text-primary"
            //   onClick={() => setIsModalOpen(true)}
            >
              Mot de passe oublié?
            </button>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-primary py-3 text-white shadow-md hover:bg-orange-600"
          >
            Se connecter
          </button>
        </form> */}
      </div>

      {/* {isModalOpen && (
        <ForgotPasswordModal closeModal={() => setIsModalOpen(false)} />
      )} */}
    </div>
  );
};

export default ComponentsAuthLoginForm;
