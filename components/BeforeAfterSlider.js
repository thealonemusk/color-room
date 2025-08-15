import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiEye, FiEyeOff, FiDownload, FiRotateCcw } from 'react-icons/fi'

export default function BeforeAfterSlider({ original, recolored, onExport }) {
  const [position, setPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [showOriginal, setShowOriginal] = useState(true)
  const [showRecolored, setShowRecolored] = useState(true)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!original) {
      setPosition(50)
      setShowOriginal(true)
      setShowRecolored(true)
    }
  }, [original])

  function handleMouseDown(e) {
    setIsDragging(true)
    updatePosition(e)
  }

  function handleMouseMove(e) {
    if (isDragging) {
      updatePosition(e)
    }
  }

  function handleMouseUp() {
    setIsDragging(false)
  }

  function updatePosition(e) {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(percentage)
  }

  function handleTouchStart(e) {
    setIsDragging(true)
    updateTouchPosition(e)
  }

  function handleTouchMove(e) {
    if (isDragging) {
      updateTouchPosition(e)
    }
  }

  function handleTouchEnd() {
    setIsDragging(false)
  }

  function updateTouchPosition(e) {
    if (!containerRef.current || !e.touches[0]) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(percentage)
  }

  function resetSlider() {
    setPosition(50)
  }

  if (!original) {
    return (
      <div className="tool-panel fade-in">
        <div className="flex items-center gap-2 mb-4">
          <FiEye className="text-2xl text-blue-500" />
          <h2 className="text-xl font-semibold">Before / After Comparison</h2>
        </div>
        <div className="p-8 text-center text-gray-500">
          <FiEye className="mx-auto text-4xl mb-4 opacity-50" />
          <p>Upload an image and apply colors to see the comparison.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tool-panel fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiEye className="text-2xl text-blue-500" />
          <h2 className="text-xl font-semibold">Before / After Comparison</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetSlider}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-lg transition-colors"
            title="Reset slider"
          >
            <FiRotateCcw className="w-4 h-4" />
          </button>
          {onExport && (
            <button
              onClick={() => onExport('png')}
              className="btn-secondary flex items-center gap-2 px-3 py-2"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Visibility Toggles */}
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOriginal}
            onChange={(e) => setShowOriginal(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium">Show Original</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showRecolored}
            onChange={(e) => setShowRecolored(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium">Show Recolored</span>
        </label>
      </div>

      {/* Comparison Slider */}
      <div className="relative w-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900">
        <div
          ref={containerRef}
          className="relative w-full h-96 md:h-[500px] cursor-col-resize"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Original Image */}
          {showOriginal && (
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={original}
              alt="Original"
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}

          {/* Recolored Image (clipped) */}
          {showRecolored && recolored && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
              <img
                src={recolored}
                alt="Recolored"
                className="w-full h-full object-contain"
              />
            </motion.div>
          )}

          {/* Divider Line */}
          <motion.div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize"
            style={{ left: `${position}%` }}
            animate={{ left: `${position}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Divider Handle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-300 flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
            </div>
          </motion.div>

          {/* Labels */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
            Before
          </div>
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
            After
          </div>
        </div>
      </div>

      {/* Slider Control */}
      <div className="mt-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Drag to compare</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max="100"
              value={position}
              onChange={(e) => setPosition(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 pointer-events-none">
              <div className="flex justify-between text-xs text-gray-500 px-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
          <span className="text-sm font-medium w-12 text-right">{Math.round(position)}%</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-500">
        <p>💡 Tip: Drag the slider or use the range input to compare the original and recolored images.</p>
      </div>
    </div>
  )
}
