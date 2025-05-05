"use client";

import IconEye from "@/components/icon/icon-eye";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { Toastify } from "@/utils/toast";
import { TRootState } from "@/store";
import { OTPresetPassword } from "@/store/reducers/auth/reset-password-otp.slice";
import IconEyeSlash from "@/components/icon/icon-eye-slash";

interface ResetPasswordModalProps {
  closeModal: () => void;
}

export default function ResetPasswordModal({
  closeModal,
}: ResetPasswordModalProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading, success, error } = useSelector(
    (state: TRootState) => state.reset
  );

  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // États pour la validation
  const [isMinLength, setIsMinLength] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasDigit, setHasDigit] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Valider le mot de passe en temps réel
  useEffect(() => {
    setIsMinLength(password.length >= 8);
    setHasUppercase(/[A-Z]/.test(password));
    setHasDigit(/[0-9]/.test(password));

    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    }
  }, [password, confirmPassword]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const isPasswordValid = () => {
    return isMinLength && hasUppercase && hasDigit;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid()) {
      Toastify("error", "Le mot de passe ne respecte pas les critères requis");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      Toastify("error", "Les mots de passe ne correspondent pas !");
      return;
    }

    const result = await dispatch(
      OTPresetPassword({ otpCode, password, confirmPassword })
    );

    if (OTPresetPassword.fulfilled.match(result)) {
      Toastify("success", result.payload.message || "Mot de passe modifié !");
      closeModal();
      router.push("/login");
    } else {
      Toastify("error", error || "Une erreur est survenue !");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg">
        {/* Header avec titre et bouton fermer */}
        <div className="bg-orange-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-medium">Changer mon mot de passe</h3>
            <button
              type="button"
              className="text-white hover:text-gray-200"
              onClick={closeModal}
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* Code OTP */}
            <div>
              <label
                htmlFor="otpCode"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Code OTP
              </label>
              <input
                id="otpCode"
                type="text"
                placeholder="Entrez votre code OTP"
                className="w-full text-black rounded-md border border-gray-300 px-4 py-2.5 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                required
              />
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre nouveau mot de passe"
                  className="w-full text-black rounded-md border border-gray-300 px-4 py-2.5 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-gray-500 hover:text-orange-500 focus:outline-none"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <IconEye className="h-5 w-5 text-orange-500" />
                  ) : (
                    <IconEyeSlash className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Critères du mot de passe */}
              <div className="mt-2 space-y-1 text-xs text-gray-600">
                <p className={isMinLength ? "text-green-600" : "text-gray-600"}>
                  • Au moins 8 caractères
                </p>
                <p className={hasUppercase ? "text-green-600" : "text-gray-600"}>
                  • Au moins une majuscule
                </p>
                <p className={hasDigit ? "text-green-600" : "text-gray-600"}>
                  • Au moins un chiffre
                </p>
              </div>
            </div>

            {/* Confirmer le nouveau mot de passe */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmez votre nouveau mot de passe"
                  className={`w-full rounded-md border text-black ${!passwordsMatch && confirmPassword ? "border-red-500" : "border-gray-300"
                    } px-4 py-2.5 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500`}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-gray-500 hover:text-orange-500 focus:outline-none"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? (
                    <IconEye className="h-5 w-5 text-orange-500" />
                  ) : (
                    <IconEyeSlash className="h-5 w-5" />
                  )}
                </button>
              </div>
              {!passwordsMatch && confirmPassword && (
                <p className="mt-1 text-xs text-red-500">
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                className="rounded-md px-4 py-2 text-gray-700 hover:text-gray-900"
                onClick={closeModal}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:bg-orange-300"
                disabled={isLoading || !isPasswordValid() || !passwordsMatch || !confirmPassword}
              >
                Enregistrer
              </button>
            </div>
          </form>

          {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
