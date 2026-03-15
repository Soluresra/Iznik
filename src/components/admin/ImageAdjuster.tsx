'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ZoomIn, ZoomOut, Check, X, RotateCcw, Maximize } from 'lucide-react'

interface ImageAdjusterProps {
  imageSrc: string
  onConfirm: (croppedFile: File) => void
  onCancel: () => void
  aspectRatio?: number // width/height, e.g. 16/5 for banner
  outputWidth?: number // px, default 1920
}

export default function ImageAdjuster({
  imageSrc,
  onConfirm,
  onCancel,
  aspectRatio = 16 / 9,
  outputWidth = 1920,
}: ImageAdjusterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Natural image dimensions
  const [naturalW, setNaturalW] = useState(0)
  const [naturalH, setNaturalH] = useState(0)
  // Container dimensions (px)
  const [containerW, setContainerW] = useState(0)
  const [containerH, setContainerH] = useState(0)
  // Base scale to "cover" the container
  const [baseScale, setBaseScale] = useState(1)
  // User zoom multiplier (1 = cover fit, >1 = zoomed in)
  const [zoomFactor, setZoomFactor] = useState(1)
  // Image offset from centered position (px in display space)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  // Drag state
  const [dragging, setDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragOffsetX, setDragOffsetX] = useState(0)
  const [dragOffsetY, setDragOffsetY] = useState(0)
  // Processing
  const [processing, setProcessing] = useState(false)
  const [ready, setReady] = useState(false)

  // Compute container size and base scale when image loads
  const handleImageLoad = useCallback(() => {
    const img = imgRef.current
    const container = containerRef.current
    if (!img || !container) return

    const nw = img.naturalWidth
    const nh = img.naturalHeight
    setNaturalW(nw)
    setNaturalH(nh)

    const cw = container.clientWidth
    const ch = container.clientHeight
    setContainerW(cw)
    setContainerH(ch)

    // Base scale: smallest scale that makes image cover container
    const scaleW = cw / nw
    const scaleH = ch / nh
    const bs = Math.max(scaleW, scaleH)
    setBaseScale(bs)

    // Reset
    setZoomFactor(1)
    setOffsetX(0)
    setOffsetY(0)
    setReady(true)
  }, [])

  // Listen for container resize
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => {
      if (imgRef.current && imgRef.current.naturalWidth > 0) {
        handleImageLoad()
      }
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [handleImageLoad])

  // Effective scale
  const scale = baseScale * zoomFactor

  // Displayed image size
  const dispW = naturalW * scale
  const dispH = naturalH * scale

  // Clamp offset so image always covers the container
  const clampOffset = useCallback((ox: number, oy: number, z: number) => {
    const s = baseScale * z
    const dw = naturalW * s
    const dh = naturalH * s

    // Maximum allowed offset (image edge should not go past container edge)
    const maxOx = Math.max(0, (dw - containerW) / 2)
    const maxOy = Math.max(0, (dh - containerH) / 2)

    return {
      x: Math.min(maxOx, Math.max(-maxOx, ox)),
      y: Math.min(maxOy, Math.max(-maxOy, oy)),
    }
  }, [baseScale, naturalW, naturalH, containerW, containerH])

  // --- Drag handlers ---
  const onDragStart = useCallback((clientX: number, clientY: number) => {
    setDragging(true)
    setDragStartX(clientX)
    setDragStartY(clientY)
    setDragOffsetX(offsetX)
    setDragOffsetY(offsetY)
  }, [offsetX, offsetY])

  const onDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragging) return
    const dx = clientX - dragStartX
    const dy = clientY - dragStartY
    const clamped = clampOffset(dragOffsetX + dx, dragOffsetY + dy, zoomFactor)
    setOffsetX(clamped.x)
    setOffsetY(clamped.y)
  }, [dragging, dragStartX, dragStartY, dragOffsetX, dragOffsetY, zoomFactor, clampOffset])

  const onDragEnd = useCallback(() => {
    setDragging(false)
  }, [])

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    onDragStart(e.clientX, e.clientY)
  }
  const handleMouseMove = (e: React.MouseEvent) => onDragMove(e.clientX, e.clientY)

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    onDragStart(t.clientX, t.clientY)
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0]
    onDragMove(t.clientX, t.clientY)
  }

  // Global mouse/touch up
  useEffect(() => {
    const up = () => setDragging(false)
    window.addEventListener('mouseup', up)
    window.addEventListener('touchend', up)
    return () => {
      window.removeEventListener('mouseup', up)
      window.removeEventListener('touchend', up)
    }
  }, [])

  // --- Zoom ---
  const setZoom = useCallback((newZ: number) => {
    const z = Math.max(1, Math.min(5, newZ))
    // Re-clamp offset for new zoom
    const clamped = clampOffset(offsetX, offsetY, z)
    setZoomFactor(z)
    setOffsetX(clamped.x)
    setOffsetY(clamped.y)
  }, [clampOffset, offsetX, offsetY])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.08 : 0.08
    setZoom(zoomFactor + delta)
  }, [zoomFactor, setZoom])

  const handleReset = () => {
    setZoomFactor(1)
    setOffsetX(0)
    setOffsetY(0)
  }

  // --- Fit modes ---
  const fitWidth = () => {
    if (!naturalW || !containerW) return
    const z = (containerW / naturalW) / baseScale
    setZoom(Math.max(1, z))
    setOffsetX(0)
    setOffsetY(0)
  }

  const fitHeight = () => {
    if (!naturalH || !containerH) return
    const z = (containerH / naturalH) / baseScale
    setZoom(Math.max(1, z))
    setOffsetX(0)
    setOffsetY(0)
  }

  // --- Export ---
  const handleConfirm = async () => {
    if (!imgRef.current) return
    setProcessing(true)

    try {
      const img = imgRef.current

      // The image is centered in the container at (containerW/2, containerH/2) + offset
      // The displayed image's top-left is at:
      const imgLeft = (containerW - dispW) / 2 + offsetX
      const imgTop = (containerH - dispH) / 2 + offsetY

      // The container's viewport in display coordinates: (0,0) to (containerW, containerH)
      // Map to natural image coordinates:
      const natPerPx = 1 / scale // natural pixels per display pixel
      const srcX = (0 - imgLeft) * natPerPx
      const srcY = (0 - imgTop) * natPerPx
      const srcW = containerW * natPerPx
      const srcH = containerH * natPerPx

      // Clamp to image bounds
      const sx = Math.max(0, Math.min(naturalW, srcX))
      const sy = Math.max(0, Math.min(naturalH, srcY))
      const sw = Math.min(srcW, naturalW - sx)
      const sh = Math.min(srcH, naturalH - sy)

      // Output dimensions
      const outW = outputWidth
      const outH = Math.round(outW / aspectRatio)

      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')!

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, outW, outH)

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], 'adjusted-image.jpg', { type: 'image/jpeg' })
            onConfirm(file)
          }
          setProcessing(false)
        },
        'image/jpeg',
        0.92
      )
    } catch {
      setProcessing(false)
    }
  }

  // Image position style
  const imgStyle: React.CSSProperties = ready
    ? {
        width: `${dispW}px`,
        height: `${dispH}px`,
        position: 'absolute' as const,
        left: `${(containerW - dispW) / 2 + offsetX}px`,
        top: `${(containerH - dispH) / 2 + offsetY}px`,
        transition: dragging ? 'none' : 'all 0.15s ease-out',
        pointerEvents: 'none' as const,
      }
    : {
        width: '100%',
        height: '100%',
        objectFit: 'cover' as const,
        position: 'absolute' as const,
        top: 0,
        left: 0,
        pointerEvents: 'none' as const,
      }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-navy-800">Görseli Ayarla</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Sürükle: konumla &bull; Kaydır: yakınlaştır &bull; Butonlar: hızlı sığdır
            </p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Canvas area */}
        <div className="flex-1 overflow-hidden p-4 bg-gray-100 min-h-0">
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-900 mx-auto select-none w-full"
            style={{
              aspectRatio: `${aspectRatio}`,
              cursor: dragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={onDragEnd}
            onMouseLeave={onDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={onDragEnd}
            onWheel={handleWheel}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Ayarlama"
              onLoad={handleImageLoad}
              style={imgStyle}
              draggable={false}
            />

            {/* Rule of thirds grid */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/20" />
              <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/20" />
              <div className="absolute top-1/3 left-0 right-0 h-px bg-white/20" />
              <div className="absolute top-2/3 left-0 right-0 h-px bg-white/20" />
            </div>

            {/* Corner brackets */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top-left */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white/50" />
              {/* Top-right */}
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/50" />
              {/* Bottom-left */}
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white/50" />
              {/* Bottom-right */}
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/50" />
            </div>

            {/* Zoom indicator */}
            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md font-mono pointer-events-none">
              {Math.round(zoomFactor * 100)}%
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            {/* Fit buttons */}
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={fitWidth}
                className="h-8 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-600 transition-colors flex items-center gap-1"
                title="Genişliğe sığdır"
              >
                <Maximize size={13} />
                Genişlik
              </button>
              <button
                type="button"
                onClick={fitHeight}
                className="h-8 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-medium text-gray-600 transition-colors flex items-center gap-1"
                title="Yüksekliğe sığdır"
              >
                <Maximize size={13} className="rotate-90" />
                Yükseklik
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                title="Sıfırla"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Zoom slider */}
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <button
                type="button"
                onClick={() => setZoom(zoomFactor - 0.1)}
                className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors flex-shrink-0"
              >
                <ZoomOut size={16} />
              </button>
              <input
                type="range"
                min="1"
                max="5"
                step="0.05"
                value={zoomFactor}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-iznik-600"
              />
              <button
                type="button"
                onClick={() => setZoom(zoomFactor + 0.1)}
                className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors flex-shrink-0"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-3.5 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={processing || !ready}
            className="flex-1 flex items-center justify-center gap-2 bg-iznik-600 hover:bg-iznik-700 disabled:bg-iznik-400 text-white font-medium py-2.5 rounded-xl transition-colors text-sm"
          >
            <Check size={18} />
            {processing ? 'İşleniyor...' : 'Onayla'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  )
}
