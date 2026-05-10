"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BookOpen, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookGalleryProps {
  coverUrl?: string;
  previewUrls?: string[];
  title: string;
}

export function BookGallery({ coverUrl, previewUrls = [], title }: BookGalleryProps) {
  const allImages = [coverUrl, ...previewUrls].filter(Boolean) as string[];
  
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Обработчики управления Lightbox
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = useCallback(() => setIsOpen(false), []);
  
  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);
  
  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  // Управление скроллом и клавиатурой при открытом Lightbox
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // Блокировка скролла сайта

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = ""; // Восстановление скролла
    };
  }, [isOpen, closeLightbox, nextImage, prevImage]);

  if (allImages.length === 0) {
    return (
      <div className="w-full overflow-hidden rounded-2xl border bg-muted shadow-xl relative flex flex-col items-center justify-center text-muted-foreground gap-4 bg-secondary/20 py-20">
        <BookOpen className="h-16 w-16 opacity-20" />
        <span>Нет обложки</span>
      </div>
    );
  }

  // Вычисляем данные для нижнего ряда миниатюр (максимум 4)
  const visibleThumbnails = allImages.slice(1, 5);
  const remainingCount = allImages.length - 5;

  return (
    <>
      {/* ЧАСТЬ 1: Статичная галерея (Триггер) */}
      <div className="flex flex-col gap-3">
        {/* Главная обложка */}
        <div 
          onClick={() => openLightbox(0)}
          className="relative w-full cursor-pointer overflow-hidden rounded-2xl border shadow-xl group"
        >
          <img
            src={allImages[0]}
            alt={`Обложка книги ${title}`}
            className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
          />
          {/* Overlay при наведении (Увеличить) */}
          <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm font-medium">
              <ZoomIn className="w-4 h-4" /> Увеличить
            </span>
          </div>
        </div>

        {/* Ряд миниатюр (до 4 штук) */}
        {visibleThumbnails.length > 0 && (
          <div className="grid grid-cols-4 gap-3 items-center">
            {visibleThumbnails.map((url, idx) => {
              const isLast = idx === 3;
              const showOverlay = isLast && remainingCount > 0;

              return (
                <div
                  key={url + idx}
                  onClick={() => openLightbox(idx + 1)}
                  className="relative cursor-pointer overflow-hidden rounded-md border group"
                >
                  <img
                    src={url}
                    alt={`Миниатюра ${idx + 1}`}
                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-110"
                  />
                  {showOverlay && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-medium text-lg backdrop-blur-[1px]">
                      +{remainingCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ЧАСТЬ 2: Интерактивный Lightbox (Оверлей) */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex flex-col md:flex-row backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Кнопка "Закрыть" */}
          <button 
            onClick={(e) => { e.stopPropagation(); closeLightbox(); }} 
            className="absolute top-4 right-4 z-[60] p-2 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full"
            aria-label="Закрыть галерею"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Левая боковая панель (только десктоп) */}
          <div 
            className="hidden md:flex flex-col w-[120px] lg:w-[150px] p-4 gap-3 overflow-y-auto border-r border-white/10 shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onClick={(e) => e.stopPropagation()}
          >
            {allImages.map((url, idx) => (
              <button
                key={url + idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "relative aspect-[2/3] shrink-0 cursor-pointer overflow-hidden rounded-md border-2 transition-all",
                  currentIndex === idx 
                    ? "border-white opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                    : "border-transparent opacity-40 hover:opacity-100 hover:border-white/50"
                )}
              >
                <img src={url} alt={`Миниатюра ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Основная область */}
          <div 
            className="flex-1 relative flex items-center justify-center p-4"
          >
            <img 
              src={allImages[currentIndex]} 
              alt={`Изображение ${currentIndex + 1} книги ${title}`} 
              className="w-full h-full object-contain" 
            />
            
            {/* Стрелки перелистывания */}
            {allImages.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); prevImage(); }} 
                  className="absolute left-4 p-3 text-white/70 hover:text-white transition-colors bg-black/40 hover:bg-black/60 rounded-full"
                  aria-label="Предыдущее изображение"
                >
                  <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); nextImage(); }} 
                  className="absolute right-4 p-3 text-white/70 hover:text-white transition-colors bg-black/40 hover:bg-black/60 rounded-full"
                  aria-label="Следующее изображение"
                >
                  <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
                </button>
              </>
            )}

            {/* Счетчик */}
            <div 
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md font-medium tracking-wide"
              onClick={(e) => e.stopPropagation()}
            >
              {currentIndex + 1} / {allImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}