import { toast, ToastOptions } from "react-toastify";

type NotificationKind = "info" | "success" | "warning" | "error";

type ShowOptions = ToastOptions & {
  sound?: boolean;
  soundPath?: string;
  volume?: number; // 0..1
  dedupeKey?: string; // clé pour éviter les doublons
};

const DEFAULT_SOUND = "/assets/sounds/notification.mp3";

let lastToastAt = 0;
let lastDedupeKey = "";

function playSound(path: string = DEFAULT_SOUND, volume: number = 0.5) {
  try {
    const audio = new Audio(path);
    audio.volume = volume;
    // Ne pas bloquer le thread en attendant la promesse
    audio.play().catch(() => {});
  } catch {}
}

function shouldThrottle(minIntervalMs = 2000) {
  const now = Date.now();
  if (now - lastToastAt < minIntervalMs) return true;
  lastToastAt = now;
  return false;
}

function shouldDedupe(dedupeKey?: string) {
  if (!dedupeKey) return false;
  if (dedupeKey === lastDedupeKey) return true;
  lastDedupeKey = dedupeKey;
  return false;
}

function show(
  kind: NotificationKind,
  content: React.ReactNode,
  options?: ShowOptions
) {
  // Anti-spam simple
  if (shouldThrottle(1500)) return;
  if (shouldDedupe(options?.dedupeKey)) return;

  const base: ToastOptions = {
    position: "top-center",
    autoClose: 8000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    style: {
      background: "transparent",
      boxShadow: "none",
      padding: 0,
      marginTop: "20px",
      minWidth: "500px",
      maxWidth: "500px",
      width: "500px",
    },
    ...options,
  };

  const id = toast(content, base);

  if (options?.sound !== false) {
    playSound(options?.soundPath ?? DEFAULT_SOUND, options?.volume ?? 0.5);
  }

  return id;
}

export const notify = {
  info: (content: React.ReactNode, options?: ShowOptions) =>
    show("info", content, options),
  success: (content: React.ReactNode, options?: ShowOptions) =>
    show("success", content, options),
  warning: (content: React.ReactNode, options?: ShowOptions) =>
    show("warning", content, options),
  error: (content: React.ReactNode, options?: ShowOptions) =>
    show("error", content, options),
  playSound,
};
