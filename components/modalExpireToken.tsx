import React from "react";

interface PopupProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
}

const Popup: React.FC<PopupProps> = ({ isOpen, message, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[300px] rounded-lg bg-white p-6 text-center shadow-lg">
        <p className="mb-4 text-lg">{message}</p>
        <button
          className="hover:bg-primary-dark rounded-md bg-primary px-4 py-2 text-white"
          onClick={onConfirm}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default Popup;
