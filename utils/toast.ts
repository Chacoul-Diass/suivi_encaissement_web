import Swal from "sweetalert2";
import { toast } from "react-toastify";

export const ToastSuccess = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  padding: "0.5rem",
  text: "Opération exécutée avec succès!",
  icon: "success",
});

export const ToastError = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  padding: "0.5rem",
  text: "Erreur survenue lors de l'opération!",
  icon: "error",
});

export const ToastErrorFileType = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  padding: "0.5rem",
  text: "Mauvais type de fichier!",
  icon: "error",
});

export const ToastGeneric = (
  msg: string,
  type: "success" | "error" | "warning",
  timer: number
) => {
  return Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: timer,
    timerProgressBar: true,
    padding: "0.5rem",
    text: msg,
    icon: type,
  });
};

export const Toastify = (
  type: "success" | "error" | "warning",
  msg: string
) => {
  switch (type) {
    case "success":
      toast.success(msg, {
        autoClose: 3000,
      });
      break;
    case "error":
      toast.error(msg, {
        autoClose: 3000,
      });
      break;
    case "warning":
      toast.warning(msg, {
        autoClose: 3000,
      });
      break;
  }
};
