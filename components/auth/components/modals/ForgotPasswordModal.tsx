import React, { useState } from "react";
import ResetPasswordModal from "./ResetPasswordModal";
import { useDispatch } from "react-redux";
import { sendResetEmail } from "@/store/reducers/auth/send-email-reset.slice";
import { Toastify } from "@/utils/toast";
import { handleApiError } from "@/utils/apiErrorHandler";
import { toast } from "react-toastify";

interface ForgotPasswordModalProps {
  closeModal: () => void;
}

export default function ForgotPasswordModal({
  closeModal,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [isModalResetOpen, setIsModalResetOpen] = useState(false);

  // Fonction pour fermer la modale de réinitialisation et la modale principale
  const handleCloseAll = () => {
    setIsModalResetOpen(false);
    closeModal();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Appel de l'action Redux
      const response = await dispatch(sendResetEmail({ email })).unwrap();

      // Accès au message directement
      if (!response.error) {
        Toastify("success", response.message || "E-mail envoyé avec succès !");
        setIsModalResetOpen(true); // Ouvre la modal de reset
      }
    } catch (error: any) {
      console.log('');
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
      <div className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h3 className="mb-4 text-2xl font-bold text-black">Mot de passe oublié</h3>
        <p className="mb-4 text-gray-500">
          Veuillez entrer votre adresse e-mail pour réinitialiser votre mot de
          passe.
        </p>
        <form onSubmit={handleForgotPassword} className="text-black">
          <input
            type="email"
            placeholder="Entrez votre adresse mail"
            className="mb-4 w-full rounded-md border border-gray-300 px-4 py-3 placeholder-gray-400 shadow-sm focus:border-primary focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="rounded-md bg-gray-300 px-4 py-2 hover:bg-gray-400"
              onClick={closeModal}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-white hover:bg-orange-600 flex items-center justify-center min-w-[100px]"
              disabled={loading}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
              ) : (
                "Envoyer"
              )}
            </button>
          </div>
        </form>
      </div>

      {isModalResetOpen && (
        <ResetPasswordModal closeModal={handleCloseAll} />
      )}
    </div>
  );
}
