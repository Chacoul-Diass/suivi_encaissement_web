"use client";

import { useSelector } from "react-redux";
import { TRootState } from "@/store";
import IconUser from "@/components/icon/icon-user";
import IconMail from "@/components/icon/icon-mail";
import IconPhone from "@/components/icon/icon-phone";
import IconId from "@/components/icon/icon-id";
import IconEdit from "@/components/icon/icon-pencil";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import axiosInstance from "@/utils/axios";
import { API_AUTH_SUIVI } from "@/config/constants";

export default function Profil() {
  const user = useSelector((state: TRootState) => state.auth?.user);
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedUser, setEditedUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    matricule: "",
    directionRegionales: "all",
    secteurs: "",
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  // État pour suivre la force du mot de passe
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasNumber: false,
    matches: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    id,
    email = "",
    matricule = "",
    firstname = "",
    lastname = "",
    phoneNumber = "",
    profile = { name: "" },
  } = user || {};

  useEffect(() => {
    setMounted(true);
    setEditedUser({
      firstname,
      lastname,
      email,
      phoneNumber,
      matricule,
      directionRegionales: "all",
      secteurs: "",
    });
  }, [firstname, lastname, email, phoneNumber, matricule]);

  if (!mounted) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const response: any = await axiosInstance.patch(
        `${API_AUTH_SUIVI}/users/${id}`,
        editedUser,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Vérifier si la mise à jour a réussi
      if (response?.error === false && response?.statusCode === 200) {
        // Fermer le modal et réinitialiser le loading
        setIsLoading(false);
        setIsEditing(false);

        // Afficher le message de succès
        toast.success(
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-semibold">{response.data.message}</p>
            </div>
            <div className="mt-1 rounded-md bg-blue-50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-800">⚠️</span>
                <p className="text-sm font-medium text-blue-800">
                  Vous allez être déconnecté dans quelques instants pour
                  appliquer les modifications...
                </p>
              </div>
            </div>
          </div>,
          {
            position: "top-center",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            className: "toast-success-container",
            style: {
              minWidth: "400px",
              background: "#ffffff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e2e8f0",
            },
          }
        );

        // Déconnexion après 3 secondes
        setTimeout(() => {
          localStorage.clear();
          window.location.href = "/login";
        }, 5000);

        return;
      }

      // Si on arrive ici, c'est qu'il y a eu une erreur
      throw new Error(response?.data?.message || "La mise à jour a échoué");
    } catch (error: any) {
      setIsLoading(false);
      console.error("Error updating profile:", error);

      toast.error(
        <div className="flex items-center gap-2 p-1">
          <svg
            className="h-5 w-5 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <p className="font-medium">
            {error.response?.data?.message ||
              error.message ||
              "Erreur lors de la mise à jour du profil"}
          </p>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "toast-error-container",
          style: {
            minWidth: "400px",
            background: "#ffffff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #fee2e2",
          },
        }
      );
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Réinitialiser l'erreur lors de la saisie
    setPasswordErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Mettre à jour la force du mot de passe
    if (name === "password") {
      setPasswordStrength({
        hasMinLength: value.length >= 5,
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
    let isValid = true;
    const errors = {
      password: "",
      confirmPassword: "",
    };

    // Validation du mot de passe
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

    // Validation de la confirmation
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "La confirmation du mot de passe est requise";
      isValid = false;
    } else if (passwordForm.confirmPassword !== passwordForm.password) {
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
      const response: any = await axiosInstance.post(
        `${API_AUTH_SUIVI}/auth/change-password`,
        {
          email: email,
          password: passwordForm.password,
          confirmPassword: passwordForm.confirmPassword,
        }
      );

      if (response?.error === false && response?.statusCode === 201) {
        setIsLoading(false);
        setIsChangingPassword(false);
        setPasswordForm({
          password: "",
          confirmPassword: "",
        });

        toast.success(
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="font-semibold">
                {response.message || "Mot de passe modifié avec succès !"}
              </p>
            </div>
            <div className="mt-1 rounded-md bg-blue-50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-blue-800">⚠️</span>
                <p className="text-sm font-medium text-blue-800">
                  Vous allez être redirigé vers la page de connexion dans
                  quelques instants...
                </p>
              </div>
            </div>
          </div>,
          {
            position: "top-center",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            className: "toast-success-container",
            style: {
              minWidth: "400px",
              background: "#ffffff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              border: "1px solid #e2e8f0",
            },
          }
        );

        // Réinitialiser les états de force du mot de passe
        setPasswordStrength({
          hasMinLength: false,
          hasUpperCase: false,
          hasNumber: false,
          matches: false,
        });

        // Déconnexion et redirection
        setTimeout(() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }, 3000);
      } else {
        throw new Error(
          response?.message || "Erreur lors du changement de mot de passe"
        );
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Error updating password:", error);

      toast.error(
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <p className="font-medium">
            {error.response?.data?.message ||
              error.message ||
              "Erreur lors du changement de mot de passe"}
          </p>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "toast-error-container",
          style: {
            minWidth: "400px",
            background: "#ffffff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            border: "1px solid #fee2e2",
          },
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2 className="text-3xl font-bold text-gray-800">Mon Profil</h2>
        <p className="mt-2 text-gray-600">
          Gérez vos informations personnelles
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow duration-300 hover:shadow-md lg:col-span-2"
        >
          <div className="relative">
            <div className="flex h-48 items-center justify-center bg-gradient-to-r from-[#1e293b] to-[#334155]">
              <h1 className="px-4 text-center text-4xl font-bold text-white">
                {`${lastname} ${firstname}`}
              </h1>
            </div>
            <div className="absolute -bottom-16 left-6 flex items-end space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.4,
                }}
                className="flex h-32 w-32 items-center justify-center rounded-full bg-[#ff6c17] ring-4 ring-white"
              >
                <IconUser className="h-16 w-16 text-white" />
              </motion.div>
              <div className="mb-4">
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mt-1 inline-block rounded-full bg-success-light px-4 py-1.5 text-sm font-medium text-success"
                >
                  {profile.name === "ADMIN" ? "ADMINISTRATEUR" : profile.name}
                </motion.span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="mb-4 rounded-full bg-white p-2 shadow-md transition-colors duration-300 hover:bg-gray-50"
              >
                <IconEdit className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="mt-20 p-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="space-y-8"
              >
                <div className="group flex items-center rounded-lg bg-gray-50 p-4 transition-colors duration-300 hover:bg-primary/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                    <IconId className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Matricule
                    </p>
                    <p className="font-semibold text-gray-800 transition-colors duration-300 group-hover:text-primary">
                      {matricule}
                    </p>
                  </div>
                </div>

                <div className="group flex items-center rounded-lg bg-gray-50 p-4 transition-colors duration-300 hover:bg-primary/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                    <IconMail className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="font-semibold text-gray-800 transition-colors duration-300 group-hover:text-primary">
                      {email}
                    </p>
                  </div>
                </div>

                <div className="group flex items-center rounded-lg bg-gray-50 p-4 transition-colors duration-300 hover:bg-primary/5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                    <IconPhone className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Téléphone
                    </p>
                    <p className="font-semibold text-gray-800 transition-colors duration-300 group-hover:text-primary">
                      {phoneNumber || "Non renseigné"}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="space-y-6"
              >
                <div className="rounded-lg bg-gray-50 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <svg
                      className="h-5 w-5 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <h4 className="font-semibold text-gray-800">
                      Statistiques
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-gray-600">
                          Dernière connexion
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">
                        Aujourd'hui
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-gray-600">Status</span>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                        Actif
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="rounded-xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
        >
          <h4 className="mb-4 font-semibold text-gray-800">Accès rapides</h4>
          <div className="space-y-4">
            <button
              onClick={() => setIsChangingPassword(true)}
              className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors duration-300 hover:bg-primary/5"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <svg
                    className="h-5 w-5 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">Changer mon mot de passe</span>
              </div>
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modal d'édition */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative m-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm font-medium text-gray-600">
                    Mise à jour en cours...
                  </p>
                </div>
              </div>
            )}

            <div className="relative">
              {/* Header avec dégradé */}
              <div className="bg-gradient-to-r from-primary/90 to-primary p-6 pb-14">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">
                    Modifier mon profil
                  </h3>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Formulaire avec effet de chevauchement */}
              <div className="relative -mt-8 rounded-t-[2rem] bg-white px-6 pb-6 pt-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Nom
                      </label>
                      <input
                        type="text"
                        name="lastname"
                        value={editedUser.lastname}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-700 transition-all duration-200 focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                        placeholder="Votre nom"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Prénom
                      </label>
                      <input
                        type="text"
                        name="firstname"
                        value={editedUser.firstname}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-700 transition-all duration-200 focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                        placeholder="Votre prénom"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="group relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <IconMail className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={editedUser.email}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2.5 pl-11 pr-4 text-gray-700 transition-all duration-200 focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Téléphone
                    </label>
                    <div className="group relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <IconPhone className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary" />
                      </div>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={editedUser.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2.5 pl-11 pr-4 text-gray-700 transition-all duration-200 focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                        placeholder="Votre numéro de téléphone"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Matricule
                    </label>
                    <div className="group relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <IconId className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-primary" />
                      </div>
                      <input
                        type="text"
                        name="matricule"
                        value={editedUser.matricule}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2.5 pl-11 pr-4 text-gray-700 transition-all duration-200 focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                        placeholder="Votre matricule"
                        disabled={true}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl px-6 py-2.5 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center rounded-xl bg-primary px-6 py-2.5 font-medium text-white transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span>Enregistrer</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de changement de mot de passe */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative m-4 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm font-medium text-gray-600">
                    Modification en cours...
                  </p>
                </div>
              </div>
            )}

            <div className="relative">
              {/* Header avec dégradé */}
              <div className="bg-gradient-to-r from-primary/90 to-primary p-6 pb-14">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">
                    Changer mon mot de passe
                  </h3>
                  <button
                    onClick={() => setIsChangingPassword(false)}
                    className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Formulaire avec effet de chevauchement */}
              <div className="relative -mt-8 rounded-t-[2rem] bg-white px-6 pb-6 pt-4">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
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
                      {passwordErrors.password && (
                        <p className="mt-1 text-sm text-red-500">
                          {passwordErrors.password}
                        </p>
                      )}
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
                          Au moins 5 caractères
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Confirmer le nouveau mot de passe
                    </label>
                    <div className="group relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
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
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
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
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    onClick={() => setIsChangingPassword(false)}
                    className="rounded-xl px-6 py-2.5 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handlePasswordSubmit}
                    disabled={isLoading}
                    className="flex items-center rounded-xl bg-primary px-6 py-2.5 font-medium text-white transition-all duration-200 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span>Enregistrer</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
