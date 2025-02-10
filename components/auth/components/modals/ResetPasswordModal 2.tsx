"use client";

import IconEye from "@/components/icon/icon-eye";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { Toastify } from "@/utils/toast";
import { TRootState } from "@/store";
import { OTPresetPassword } from "@/store/reducers/auth/reset-password-otp.slice";

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
  const [showPassword1, setShowPassword1] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const togglePasswordVisibility1 = () => setShowPassword1(!showPassword1);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
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
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h3 className="mb-4 text-2xl font-bold">
          Réinitialisation du mot de passe
        </h3>
        <p className="mb-4 text-gray-500">
          Votre nouveau mot de passe doit être différent des précédents.
        </p>
        <form onSubmit={handleResetPassword}>
          <div>
            <label
              htmlFor="otpCode"
              className="block text-sm font-medium text-gray-700"
            >
              Code OTP
            </label>
            <input
              id="otpCode"
              type="text"
              placeholder="Entrez votre code OTP"
              className="mb-4 w-full rounded-md border px-4 py-3 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Nouveau mot de passe
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nouveau mot de passe"
                className="w-full rounded-md border px-4 py-3 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={togglePasswordVisibility}
              >
                <IconEye
                  className={showPassword ? "text-orange-500" : "text-gray-500"}
                />
              </span>
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirmer le mot de passe
            </label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                type={showPassword1 ? "text" : "password"}
                placeholder="Confirmer le mot de passe"
                className="w-full rounded-md border px-4 py-3 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                onClick={togglePasswordVisibility1}
              >
                <IconEye
                  className={
                    showPassword1 ? "text-orange-500" : "text-gray-500"
                  }
                />
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              className="rounded-md bg-gray-300 px-4 py-2 hover:bg-gray-400"
              onClick={closeModal}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
              disabled={isLoading}
            >
              {isLoading ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </form>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
}
