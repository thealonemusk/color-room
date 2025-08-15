import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiImage, FiEdit3, FiPalette, FiZap, FiEye } from 'react-icons/fi'
import UploadImage from '../components/UploadImage'
import ColorPicker from '../components/ColorPicker'
import AISuggestions from '../components/AISuggestions'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import MaskTool from '../components/MaskTool'
import Toolbar from '../components/Toolbar'

export default function Home() {
  // State management
  const [images, setImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(null)
  const [masks, setMasks] = useState([])
  const [selectedMaskIndex, setSelectedMaskIndex] = useState(null)
  const [recoloredDataUrl, setRecoloredDataUrl] = useState(null)
  const [currentColor, setCurrentColor] = useState('#ff0000')
  const [savedColors, setSavedColors] = useState([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const [error, setError] = useState(null)

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [isDarkMode])

  // Get current image
  const currentImage = currentImageIndex !== null ? images[currentImageIndex] : null

  function handleSelectImage(file, url) {
    try {
      const newImage = { file, url }
      setImages(prev => [...prev, newImage])
      setCurrentImageIndex(images.length)
      setMasks([])
      setRecoloredDataUrl(null)
      setSelectedMaskIndex(null)
    } catch (err) {
      setError('Failed to load image: ' + err.message)
    }
  }

  function handleRemoveImage(index) {
    setImages(prev => prev.filter((_, i) => i !== index))
    if (currentImageIndex === index) {
      setCurrentImageIndex(null)
      setMasks([])
      setRecoloredDataUrl(null)
    } else if (currentImageIndex > index) {
      setCurrentImageIndex(prev => prev - 1)
    }
  }

  function handleAddMask(mask) {
    setMasks(prev => [...prev, mask])
  }

  function handleDeleteMask(index) {
    setMasks(prev => prev.filter((_, i) => i !== index))
    if (selectedMaskIndex === index) {
      setSelectedMaskIndex(null)
    } else if (selectedMaskIndex > index) {
      setSelectedMaskIndex(prev => prev - 1)
    }
  }

  function handleClearMasks() {
    setMasks([])
    setSelectedMaskIndex(null)
  }

  function handleSaveColor(color) {
    if (!savedColors.includes(color)) {
      setSavedColors(prev => [...prev, color])
    }
  }

  function handleRemoveColor(index) {
    setSavedColors(prev => prev.filter((_, i) => i !== index))
  }

  // Core: apply color to masked regions using an offscreen canvas
  async function applyColorToMasks(hex) {
    try {
      if (!currentImage?.url) return
    
    const img = await loadImage(currentImage.url)
    const w = img.width
    const h = img.height

    const off = document.createElement('canvas')
    off.width = w
    off.height = h
    const ctx = off.getContext('2d')

    // draw original
    ctx.drawImage(img, 0, 0, w, h)

    if (masks.length === 0) {
      setRecoloredDataUrl(off.toDataURL('image/png'))
      return off.toDataURL('image/png')
    }

    // create colored layer only inside masks
    const colorLayer = document.createElement('canvas')
    colorLayer.width = w
    colorLayer.height = h
    const cctx = colorLayer.getContext('2d')

    // fill each mask path on color layer
    cctx.fillStyle = hex

    masks.forEach((m) => {
      const pts = m.points
      if (!pts || pts.length < 6) return
      cctx.beginPath()
      cctx.moveTo(pts[0], pts[1])
      for (let i = 2; i < pts.length; i += 2) cctx.lineTo(pts[i], pts[i + 1])
      cctx.closePath()
      cctx.fill()
    })

    // Blend the color layer onto original while preserving texture
    const maskedColor = document.createElement('canvas')
    maskedColor.width = w
    maskedColor.height = h
    const mctx = maskedColor.getContext('2d')

    // draw color layer
    mctx.drawImage(colorLayer, 0, 0)
    // keep color only where mask exists
    mctx.globalCompositeOperation = 'destination-in'
    // draw mask paths
    mctx.beginPath()
    masks.forEach((m) => {
      const pts = m.points
      if (!pts || pts.length < 6) return
      mctx.moveTo(pts[0], pts[1])
      for (let i = 2; i < pts.length; i += 2) mctx.lineTo(pts[i], pts[i + 1])
      mctx.closePath()
    })
    mctx.fill()

    // composite: draw original then draw maskedColor with 'multiply' to preserve texture
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(img, 0, 0, w, h)
    ctx.globalCompositeOperation = 'multiply'
    ctx.drawImage(maskedColor, 0, 0)
    // draw maskedColor again with 'screen' at low alpha to bring back brightness
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = 0.2
    ctx.drawImage(maskedColor, 0, 0)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'

    const dataUrl = off.toDataURL('image/png')
    setRecoloredDataUrl(dataUrl)
    return dataUrl
    } catch (err) {
      setError('Failed to apply color: ' + err.message)
      return null
    }
  }

  function loadImage(url) {
    return new Promise((res, rej) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => res(img)
      img.onerror = rej
      img.src = url
    })
  }

  function handleExport(format = 'png') {
    const url = recoloredDataUrl || currentImage?.url
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `virtual-house-painter-export.${format === 'jpeg' ? 'jpg' : 'png'}`
    a.click()
  }

  const tabs = [
    { id: 'upload', label: 'Upload', icon: FiImage },
    { id: 'mask', label: 'Mask', icon: FiEdit3 },
    { id: 'color', label: 'Color', icon: FiPalette },
    { id: 'ai', label: 'AI', icon: FiZap },
    { id: 'compare', label: 'Compare', icon: FiEye }
  ]

  // Error boundary
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Toolbar */}
      <Toolbar 
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
        isDarkMode={isDarkMode} 
      />

      {/* Header */}
      <header className="pt-8 pb-6">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Virtual House Painter
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Transform your room photos with AI-powered color suggestions and professional masking tools
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container pb-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {React.createElement(tab.icon, { className: 'w-4 h-4' })}
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Current Image Display */}
        {currentImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Current Image: {currentImage.file.name}</h3>
                <button
                  onClick={() => setCurrentImageIndex(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Change Image
                </button>
              </div>
              <div className="relative">
                <img
                  src={currentImage.url}
                  alt="Current"
                  className="max-h-64 w-auto mx-auto rounded-lg shadow-md"
                />
                {masks.length > 0 && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                    {masks.length} mask{masks.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'upload' && (
              <UploadImage
                onSelect={handleSelectImage}
                images={images}
                onRemoveImage={handleRemoveImage}
              />
            )}

            {activeTab === 'mask' && (
              <MaskTool
                imageURL={currentImage?.url}
                onAddMask={handleAddMask}
                masks={masks}
                onClear={handleClearMasks}
                onDeleteMask={handleDeleteMask}
                selectedMaskIndex={selectedMaskIndex}
                onSelectMask={setSelectedMaskIndex}
              />
            )}

            {activeTab === 'color' && (
              <ColorPicker
                value={currentColor}
                onChange={setCurrentColor}
                onApply={() => applyColorToMasks(currentColor)}
                onExport={handleExport}
                savedColors={savedColors}
                onSaveColor={handleSaveColor}
                onRemoveColor={handleRemoveColor}
              />
            )}

            {activeTab === 'ai' && (
              <AISuggestions
                onApply={(hex) => {
                  setCurrentColor(hex)
                  applyColorToMasks(hex)
                }}
              />
            )}

            {activeTab === 'compare' && (
              <BeforeAfterSlider
                original={currentImage?.url}
                recolored={recoloredDataUrl}
                onExport={handleExport}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Quick Actions */}
        {currentImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => applyColorToMasks(currentColor)}
                  className="btn-primary"
                >
                  Apply Current Color
                </button>
                <button
                  onClick={() => setRecoloredDataUrl(null)}
                  className="btn-secondary"
                >
                  Reset Recolor
                </button>
                <button
                  onClick={() => handleExport('png')}
                  className="btn-success"
                >
                  Export PNG
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
        <div className="container text-center text-gray-500 dark:text-gray-400">
          <p>Virtual House Painter • Built with Next.js, TailwindCSS & Gemini AI</p>
          <p className="text-sm mt-2">
            Upload your room photos, create masks, and experiment with AI-suggested color palettes
          </p>
        </div>
      </footer>
    </div>
  )
}
