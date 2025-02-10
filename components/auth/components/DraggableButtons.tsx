"use client";

import React, { useState, useEffect } from "react";
import IconDownload from "@/components/icon/icon-download";
import IconTrashLines from "@/components/icon/icon-trash-lines";

interface DraggableButtonsProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetBackground: () => void;
  isCustomBackground: boolean;
}

const DraggableButtons: React.FC<DraggableButtonsProps> = ({
  handleFileChange,
  resetBackground,
  isCustomBackground,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const savedPosition = localStorage.getItem("buttonsPosition");
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    } else {
      setPosition({ x: window.innerWidth - 200, y: window.innerHeight - 150 });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName.toLowerCase() !== "input" &&
      target.tagName.toLowerCase() !== "button"
    ) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      const maxX = window.innerWidth - 150;
      const maxY = window.innerHeight - 100;

      const boundedX = Math.min(Math.max(0, newX), maxX);
      const boundedY = Math.min(Math.max(0, newY), maxY);

      setPosition({ x: boundedX, y: boundedY });
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem("buttonsPosition", JSON.stringify(position));
    }
  };

  return (
    <div
      className={`fixed z-30 rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur-sm ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: "none",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="flex flex-col gap-3">
        {/* Bouton d'upload */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="file-upload"
            className="group relative flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-100 bg-white px-4 py-2.5 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg"
          >
            <IconDownload className="h-5 w-[20px] text-gray-600 transition-all duration-300 group-hover:scale-110" />
            <span className="text-sm font-medium text-gray-700">
              Changer le Fond d'ecran
            </span>
          </label>
        </div>
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
            className="group flex items-center justify-center gap-2 rounded-lg border border-gray-100 bg-white px-4 py-2.5 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-lg"
          >
            <IconTrashLines className="h-5 w-5 text-red-500 transition-all duration-300 group-hover:scale-110" />
            <span className="text-sm font-medium text-red-500">
              Réinitialiser
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DraggableButtons;
