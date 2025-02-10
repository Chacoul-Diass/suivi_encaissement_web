"use client";

import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import IconCaretDown from "../icon/icon-caret-down";
import IconX from "../icon/icon-x";
import { API_PHOTO_SUIVI } from "@/config/constants";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface DocumentType {
  id: number;
  encaissementId: number;
  fileName: string;
  filePath: string;
}

interface PreuvePhotoModalProps {
  preuvePhotoModal: boolean;
  setPreuvePhotoModal: (val: boolean) => void;
  documents?: DocumentType[];
}

export default function PreuvePhotoModal({
  preuvePhotoModal,
  setPreuvePhotoModal,
  documents = [],
}: PreuvePhotoModalProps) {
  const swiperRef = useRef<any>(null);

  // URLs locales (blob) pour chaque document
  const [localImageUrls, setLocalImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // État du second modal (plein écran)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // État du zoom
  const [zoomScale, setZoomScale] = useState<number>(1);

  // État du pan/déplacement
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startOffset, setStartOffset] = useState({ x: 0, y: 0 });

  /** Charger chaque fichier en blob => URL locale **/
  async function fetchImage(doc: DocumentType): Promise<string> {
    const url = `${API_PHOTO_SUIVI}uploads/${doc?.encaissementId}/${doc?.fileName}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Impossible de récupérer l'image : ${url}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  useEffect(() => {
    if (preuvePhotoModal && documents.length > 0) {
      setLocalImageUrls([]);
      setIsLoading(true);

      Promise.all(documents.map(fetchImage))
        .then((results) => {
          setLocalImageUrls(results);
        })
        .catch((error) => {
          console.error("Erreur lors du fetch des images :", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setLocalImageUrls([]);
    }
  }, [preuvePhotoModal, documents]);

  /** Ouvrir l'image en fullscreen, reset zoom & offset **/
  const handleOpenFullscreen = (imgUrl: string) => {
    setFullscreenImage(imgUrl);
    setZoomScale(1);
    setOffset({ x: 0, y: 0 });
  };

  /** Fermer le fullscreen **/
  const handleCloseFullscreen = () => {
    setFullscreenImage(null);
    setZoomScale(1);
    setOffset({ x: 0, y: 0 });
    setIsDragging(false);
  };

  /** Zoom in / out / reset **/
  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.25, 5));
  const handleZoomOut = () =>
    setZoomScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => {
    setZoomScale(1);
    setOffset({ x: 0, y: 0 });
  };

  /** Drag / pan events **/
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartOffset({ x: offset.x, y: offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setOffset({
      x: startOffset.x + deltaX,
      y: startOffset.y + deltaY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  /** Rendu principal **/
  return (
    <Dialog
      as="div"
      open={preuvePhotoModal}
      onClose={() => setPreuvePhotoModal(false)}
    >
      {/* Overlay du premier modal */}
      <div className="fixed inset-0 z-[999] overflow-y-auto bg-black/60">
        <div className="flex min-h-screen items-start justify-center px-4">
          <Dialog.Panel className="panel animate__animated animate__fadeIn my-8 w-full max-w-3xl overflow-hidden rounded-lg border-0 bg-white px-4 py-1 dark:bg-[#1b2e4b]">
            {/* Header */}
            <div className="flex items-center justify-between py-5 text-lg font-semibold dark:text-white">
              <span>Preuves photos</span>
              <button
                onClick={() => setPreuvePhotoModal(false)}
                type="button"
                className="text-white-dark hover:text-dark dark:hover:text-gray-300"
              >
                <IconX />
              </button>
            </div>

            {/* Loader conditionnel */}
            {isLoading && (
              <div className="mb-5 flex justify-center">
                <div className="flex items-center gap-2 text-primary">
                  <span className="animate-pulse">Chargement...</span>
                  <span className="h-3 w-3 animate-ping rounded-full bg-primary"></span>
                </div>
              </div>
            )}

            {/* Swiper Carrousel */}
            <Swiper
              ref={swiperRef}
              modules={[Navigation, Pagination]}
              navigation={{
                nextEl: ".swiper-button-next-ex1",
                prevEl: ".swiper-button-prev-ex1",
              }}
              observer
              observeParents
              pagination={{ clickable: true }}
              className="swiper mx-auto mb-5 h-auto w-full max-w-3xl"
              id="slider1"
              parallax
            >
              <div className="swiper-wrapper">
                {localImageUrls.length > 0
                  ? localImageUrls.map((blobUrl, index) => (
                      <SwiperSlide key={index}>
                        <div className="flex h-[500px] items-center justify-center bg-[#f8f9fa] dark:bg-[#0b1a2b]">
                          <img
                            src={blobUrl}
                            alt={`Preuve photo ${index + 1}`}
                            className="mx-auto max-h-full max-w-full cursor-pointer object-contain transition-transform duration-200 hover:scale-105"
                            // Ouvrir l'image en plein écran
                            onClick={() => handleOpenFullscreen(blobUrl)}
                          />
                        </div>
                      </SwiperSlide>
                    ))
                  : !isLoading && (
                      <SwiperSlide>
                        <div className="flex h-40 items-center justify-center text-center dark:text-white">
                          Aucune preuve photo disponible
                        </div>
                      </SwiperSlide>
                    )}
              </div>

              {/* Bouton "Précédent" */}
              <button
                type="button"
                className="swiper-button-prev-ex1 absolute top-1/2 z-[999] grid -translate-y-1/2 place-content-center rounded-full border border-primary bg-white p-1 text-primary shadow transition hover:bg-primary hover:text-white dark:bg-[#1b2e4b] dark:hover:bg-primary ltr:left-2 rtl:right-2"
              >
                <IconCaretDown className="h-5 w-5 rotate-90 rtl:-rotate-90" />
              </button>

              {/* Bouton "Suivant" */}
              <button
                type="button"
                className="swiper-button-next-ex1 absolute top-1/2 z-[999] grid -translate-y-1/2 place-content-center rounded-full border border-primary bg-white p-1 text-primary shadow transition hover:bg-primary hover:text-white dark:bg-[#1b2e4b] dark:hover:bg-primary ltr:right-2 rtl:left-2"
              >
                <IconCaretDown className="h-5 w-5 -rotate-90 rtl:rotate-90" />
              </button>

              <div className="swiper-pagination" />
            </Swiper>
          </Dialog.Panel>
        </div>
      </div>

      {/* SECOND MODAL : IMAGE EN FULLSCREEN (ZOOM + PAN) */}
      {fullscreenImage && (
        <Dialog
          as="div"
          className="fixed inset-0 z-[9999]"
          open={true}
          onClose={handleCloseFullscreen}
        >
          <div className="flex h-full w-full select-none flex-col bg-black/90">
            {/* Bouton Fermer */}
            <button
              type="button"
              className="absolute right-5 top-5 z-50 text-3xl text-white"
              onClick={handleCloseFullscreen}
            >
              <IconX className="h-8 w-8" />
            </button>

            {/* Barre de Contrôle du Zoom (bas de l'écran) */}
            <div
              className="
                absolute bottom-10 left-1/2 z-50 flex
                -translate-x-1/2 items-center space-x-3
                rounded bg-black/50 p-3
              "
            >
              <button
                type="button"
                onClick={handleZoomOut}
                className="btn btn-danger text-lg font-bold"
              >
                −
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="btn btn-success text-lg font-bold"
              >
                +
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="btn btn-secondary text-sm font-semibold"
              >
                Reset
              </button>
              <span className="text-white">
                Zoom : {Math.round(zoomScale * 100)}%
              </span>
            </div>

            {/* Conteneur pour l'image (flex:1 = tout l'espace) */}
            <div
              className="relative flex flex-1 items-center justify-center overflow-hidden"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                src={fullscreenImage}
                alt="Plein Écran"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoomScale})`,
                  transition: isDragging ? "none" : "transform 0.2s",
                  cursor: isDragging
                    ? "grabbing"
                    : zoomScale > 1
                    ? "grab"
                    : "auto",
                }}
                className="
                  pointer-events-auto
                  max-h-full
                  max-w-full object-contain
                "
              />
            </div>
          </div>
        </Dialog>
      )}
    </Dialog>
  );
}
