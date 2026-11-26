import React, { useEffect, useRef, useState } from 'react';
import { Mouse, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { GalleryImage } from '../data/razerProductData';

interface ProductGalleryProps {
  images: GalleryImage[];
  activeIndex: number;
  onSelectIndex: (idx: number) => void;
  previewImage?: { src: string; alt: string; caption?: string } | null;
}

const ZOOM_LEVELS = [2, 2.75] as const;

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  activeIndex,
  onSelectIndex,
  previewImage = null,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomIdx, setZoomIdx] = useState(0);
  const [panPct, setPanPct] = useState({ x: 50, y: 50 });
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});

  const baseImg = images[activeIndex] ?? images[0];
  const displaySrc = previewImage?.src ?? baseImg.src;
  const displayAlt = previewImage?.alt ?? baseImg.alt;
  const displayCaption = previewImage?.caption ?? baseImg.caption;
  const displayKey = previewImage ? `preview-${previewImage.src}` : baseImg.id;
  const isBroken = Boolean(failedIds[displayKey]);

  const zoomScale = ZOOM_LEVELS[zoomIdx] ?? 2;

  // Reset zoom pan smoothly when switching images or closing zoom with Escape
  useEffect(() => {
    setPanPct({ x: 50, y: 50 });
  }, [activeIndex, previewImage?.src]);

  useEffect(() => {
    if (!isZoomed) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isZoomed]);

  const updatePanFromPoint = (clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / Math.max(1, rect.width)) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / Math.max(1, rect.height)) * 100));
    setPanPct({ x, y });
  };

  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isBroken) return;
    if (!isZoomed) {
      updatePanFromPoint(e.clientX, e.clientY);
      setIsZoomed(true);
    } else {
      setIsZoomed(false);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || isBroken) return;
    updatePanFromPoint(e.clientX, e.clientY);
  };

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 lg:sticky lg:top-[108px]">
      {/* Thumbnail Rail — Hover or click to switch the main image */}
      <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 shrink-0">
        {images.map((img, idx) => {
          const isSelected = idx === activeIndex && !previewImage;
          return (
            <button
              key={img.id}
              type="button"
              onMouseEnter={() => onSelectIndex(idx)}
              onFocus={() => onSelectIndex(idx)}
              onClick={() => onSelectIndex(idx)}
              aria-label={`View ${img.caption}`}
              aria-pressed={isSelected}
              className={`w-16 h-14 sm:w-14 sm:h-12 rounded-md border overflow-hidden bg-white shrink-0 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007185] ${
                isSelected
                  ? 'border-[#007185] ring-2 ring-[#007185]/30 scale-[1.03]'
                  : 'border-[#D5D9D9] hover:border-[#007185]/70'
              }`}
            >
              {failedIds[img.id] ? (
                <div className="w-full h-full flex items-center justify-center bg-[#F7F8F8] text-[#565959]">
                  <Mouse className="w-4 h-4" />
                </div>
              ) : (
                <img
                  src={img.src}
                  alt={img.alt}
                  referrerPolicy="no-referrer"
                  onError={() => setFailedIds((p) => ({ ...p, [img.id]: true }))}
                  className="w-full h-full object-cover"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Stage — Click to zoom in-place so the item description column always stays in view */}
      <div className="flex-1 flex flex-col">
        <div
          ref={stageRef}
          onMouseMove={handlePointerMove}
          onClick={handleStageClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsZoomed((z) => !z);
            }
          }}
          aria-pressed={isZoomed}
          aria-label={
            isZoomed
              ? 'Zoomed product image. Move pointer to pan or click to zoom out.'
              : 'Product image. Click to zoom in while keeping item details visible.'
          }
          className={`relative aspect-[4/3] w-full rounded-lg border bg-white overflow-hidden select-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007185] ${
            isZoomed
              ? 'border-[#007185] ring-2 ring-[#007185]/20 cursor-zoom-out'
              : 'border-[#E7E7E7] hover:border-[#C7CCCC] cursor-zoom-in'
          }`}
        >
          {isBroken ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#F7F8F8] to-[#EAEDED] text-[#565959] p-6 text-center">
              <Mouse className="w-12 h-12 text-[#0F1111]" />
              <span className="text-sm font-medium text-[#0F1111]">{displayCaption}</span>
            </div>
          ) : (
            <img
              src={displaySrc}
              alt={displayAlt}
              referrerPolicy="no-referrer"
              onError={() => setFailedIds((p) => ({ ...p, [displayKey]: true }))}
              style={{
                transformOrigin: `${panPct.x}% ${panPct.y}%`,
                transform: isZoomed ? `scale(${zoomScale})` : 'scale(1)',
              }}
              className={`w-full h-full object-contain p-2 transition-transform ${
                isZoomed ? 'duration-100 ease-out' : 'duration-200 ease-out'
              }`}
            />
          )}

          {/* In-Stage Zoom Toolbar — stays strictly inside the image stage */}
          {!isBroken && (
            <div
              className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {isZoomed ? (
                <div className="flex items-center gap-1 rounded-md bg-white/95 border border-[#D5D9D9] shadow-sm px-1.5 py-1 text-[11px] font-medium text-[#0F1111]">
                  <button
                    type="button"
                    onClick={() => setZoomIdx((i) => (i + 1) % ZOOM_LEVELS.length)}
                    className="px-1.5 py-0.5 rounded hover:bg-[#F0F2F2] text-[#007185] tabular-nums cursor-pointer whitespace-nowrap"
                    title="Toggle zoom magnification"
                  >
                    {zoomScale}× Zoom
                  </button>
                  <span className="text-[#D5D9D9]" aria-hidden="true">
                    |
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsZoomed(false)}
                    aria-label="Reset zoom"
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-[#F0F2F2] text-[#0F1111] cursor-pointer whitespace-nowrap"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  aria-label="Zoom in to image"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/95 border border-[#D5D9D9] hover:border-[#007185] text-[11px] font-medium text-[#0F1111] shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-[#007185]" />
                  <span>Click to zoom</span>
                </button>
              )}
            </div>
          )}

          {isZoomed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPanPct({ x: 50, y: 50 });
                setIsZoomed(false);
              }}
              aria-label="Exit zoom"
              className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-white/95 border border-[#D5D9D9] text-[#0F1111] hover:bg-[#F0F2F2] shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <p className="text-xs text-[#565959] text-center mt-2.5">
          {isZoomed
            ? `Move cursor across image to pan (${zoomScale}×) · Click image to zoom out`
            : 'Hover thumbnails to switch view · Click image to zoom in'}
        </p>
      </div>
    </div>
  );
};
