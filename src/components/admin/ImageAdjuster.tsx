'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ZoomIn, ZoomOut, Check, X, RotateCcw, Move } from 'lucide-react'

interface ImageAdjusterProps {
  imageSrc: string
  onConfirm: (croppedFile: File) => void
  onCancel: () => void
  aspectRatio?: number // width/height, e.g. 16/5 for banner, undefined for free
  outputWidth?: number // px, default 1920
}

export default function ImageAdjuster({
  imageSrc,
  onConfirm,
  onCancel,
  aspectRatio,
  outputWidth = 1920,
}: ImageAdjusterProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 })
  const [processing, setProcessing] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Container height based on aspect ratio
  const containerAspect = aspectRatio || 16 / 9

  const handleImageLoad = () => {
    if (imgRef.current) {
      setImgNaturalSize({
        w: imgRef.current.naturalWidth,
        h: imgRef.current.naturalHeight,
      })
    }
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }, [position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y })
  }, [position])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    const touch = e.touches[0]
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    })
  }, [isDragging, dragStart])

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Mouse up outside container
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    window.addEventListener('touchend', handleGlobalMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
      window.removeEventListener('touchend', handleGlobalMouseUp)
    }
  }, [])

  const handleZoomChange = (newZoom: number) => {
    const clampedZoom = Math.max(0.5, Math.min(3, newZoom))
    setZoom(clampedZoom)
  }

  const handleReset = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleConfirm = async () => {
    if (!containerRef.current || !imgRef.current) return
    setProcessing(true)

    try {
      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const img = imgRef.current

      // Calculate the visible area in natural image coordinates
      const imgDisplayWidth = containerRect.width * zoom
      const imgDisplayHeight = (containerRect.width / (imgNaturalSize.w / imgNaturalSize.h)) * zoom

      const scaleX = imgNaturalSize.w / imgDisplayWidth
      const scaleY = imgNaturalSize.h / imgDisplayHeight

      // The center of the container maps to position in the image
      const centerOffsetX = (containerRect.width / 2 - position.x) * scaleX
      const centerOffsetY = (containerRect.height / 2 - position.y) * scaleY

      const cropWidth = containerRect.width * scaleX
      const cropHeight = containerRect.height * scaleY

      const sx = Math.max(0, centerOffsetX - cropWidth / 2)
      const sy = Math.max(0, centerOffsetY - cropHeight / 2)
      const sw = Math.min(cropWidth, imgNaturalSize.w - sx)
      const sh = Math.min(cropHeight, imgNaturalSize.h - sy)

      // Output dimensions
      const outWidth = outputWidth
      const outHeight = Math.round(outWidth / containerAspect)

      const canvas = document.createElement('canvas')
      canvas.width = outWidth
      canvas.height = outHeight
      const ctx = canvas.getContext('2d')!

      // Fill background
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, outWidth, outHeight)

      // Draw the cropped portion
      ctx.drawImage(
        img,
        sx, sy, sw, sh,
        0, 0, outWidth, outHeight
      )

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], 'adjusted-image.jpg', { type: 'image/jpeg' })
            onConfirm(file)
          }
          setProcessing(false)
        },
        'image/jpeg',
        0.9
      )
    } catch {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-navy-800 flex items-center gap-2">
            <Move size={20} className="text-iznik-600" />
            Görseli Ayarla
          </h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Image area */}
        <div className="p-5">
          <p className="text-xs text-gray-500 mb-3 text-center">
            Fareyi sürükleyerek konumu, kaydırma ile yakınlaştırmayı ayarlayın
          </p>

          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-900 mx-auto select-none"
            style={{
              width: '100%',
              paddingBottom: `${(1 / containerAspect) * 100}%`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={(e) => {
              e.preventDefault()
              handleZoomChange(zoom + (e.deltaY > 0 ? -0.1 : 0.1))
            }}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Ayarlama"
              onLoad={handleImageLoad}
              className="absolute top-0 left-0 w-full h-auto pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
              draggable={false}
            />
            {/* Grid overlay */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '33.333% 33.333%',
              }}
            />
          </div>

          {/* Zoom controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={() => handleZoomChange(zoom - 0.1)}
              className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              title="Uzaklaştır"
            >
              <ZoomOut size={18} />
            </button>

            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-iznik-600"
              />
              <span className="text-xs font-mono text-gray-500 w-12 text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleZoomChange(zoom + 0.1)}
              className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              title="Yakınlaştır"
            >
              <ZoomIn size={18} />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
              title="Sıfırla"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing}
            className="flex-1 flex items-center justify-center gap-2 bg-iznik-600 hover:bg-iznik-700 disabled:bg-iznik-400 text-white font-medium py-3 rounded-xl transition-colors text-sm"
          >
            <Check size={18} />
            {processing ? 'İşleniyor...' : 'Onayla'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  )
}
