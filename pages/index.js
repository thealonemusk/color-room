import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiImage, FiPalette, FiZap, FiEye } from 'react-icons/fi'
import UploadImage from '../components/UploadImage'
import ColorPicker from '../components/ColorPicker'
import AISuggestions from '../components/AISuggestions'
import BeforeAfterSlider from '../components/BeforeAfterSlider'
import Toolbar from '../components/Toolbar'

export default function Home() {
  // Debug: log imported component types on client to find undefined exports
  useEffect(() => {
    if (typeof window === 'undefined') return
    console.log('component types:', {
      UploadImage: typeof UploadImage,
      ColorPicker: typeof ColorPicker,
      AISuggestions: typeof AISuggestions,
      BeforeAfterSlider: typeof BeforeAfterSlider,
      Toolbar: typeof Toolbar,
      FiImage: typeof FiImage,
    })
  }, [])

  // State management (no masking; AI-only workflow)
  const [images, setImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(null)
  const [recoloredDataUrl, setRecoloredDataUrl] = useState(null)
  const [currentColor, setCurrentColor] = useState('#ff0000')
  const [savedColors, setSavedColors] = useState([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const [error, setError] = useState(null)
  const [bestMatches, setBestMatches] = useState([])
  // mask sensitivity and preview UI
  const [maskSensitivity, setMaskSensitivity] = useState(1.0) // 0.6..1.6, higher => more permissive
  const [maskPreviewUrl, setMaskPreviewUrl] = useState(null)
  const [autoMaskPreview, setAutoMaskPreview] = useState(false)

  // Recompute best-match suggestions when image changes (no masks)
  useEffect(() => {
    async function computeMatches() {
      const url = currentImage?.url
      if (!url) return setBestMatches([])
      try {
        const matches = await extractBestMatchColors(url, 5)
        setBestMatches(matches)
      } catch (err) {
        console.error('Failed to compute best matches:', err)
        setBestMatches([])
      }
    }
    computeMatches()
  }, [currentImageIndex, currentImage?.url])

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [isDarkMode])

  // Compute simple palette from the whole image (sparse sampling)
  async function extractBestMatchColors(imageUrl, count = 5) {
    return new Promise((res, rej) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const w = img.naturalWidth || img.width
          const h = img.naturalHeight || img.height
          const maxSide = 300
          let sw = w, sh = h
          if (Math.max(w, h) > maxSide) {
            const scale = maxSide / Math.max(w, h)
            sw = Math.round(w * scale)
            sh = Math.round(h * scale)
          }
          canvas.width = sw
          canvas.height = sh
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, sw, sh)
          const data = ctx.getImageData(0, 0, sw, sh).data

          // simple palette: sparse sample + frequency
          const freq = {}
          for (let i = 0; i < data.length; i += 20 * 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2]
            const key = `${r},${g},${b}`
            freq[key] = (freq[key] || 0) + 1
          }
          const keys = Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, count)
          const toHex = (v) => ('0' + v.toString(16)).slice(-2)
          const palette = keys.map(k => {
            const [r, g, b] = k.split(',').map(n => parseInt(n, 10))
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`
          })
          res(palette)
        } catch (err) { rej(err) }
      }
      img.onerror = () => rej(new Error('Image load failed'))
      img.src = imageUrl
    })
  }

  // Get current image
  const currentImage = currentImageIndex !== null ? images[currentImageIndex] : null

  function handleSelectImage(file, url) {
    try {
      const newImage = { file, url }
      setImages(prev => [...prev, newImage])
      setCurrentImageIndex(images.length)
      setRecoloredDataUrl(null)
      // bestMatches will be recomputed by effect
    } catch (err) {
      setError('Failed to load image: ' + err.message)
    }
  }

  function handleRemoveImage(index) {
    setImages(prev => prev.filter((_, i) => i !== index))
    if (currentImageIndex === index) {
      setCurrentImageIndex(null)
      setRecoloredDataUrl(null)
      setBestMatches([])
    } else if (currentImageIndex > index) {
      setCurrentImageIndex(prev => prev - 1)
    }
  }

  function handleSaveColor(color) {
    if (!savedColors.includes(color)) {
      setSavedColors(prev => [...prev, color])
    }
  }

  function handleRemoveColor(index) {
    setSavedColors(prev => prev.filter((_, i) => i !== index))
  }

  // Heuristic wall mask detector and masked apply
  async function detectWallMask(imageUrl, opts = { maxSide: 300, sensitivity: 1.0 }) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width
          const h = img.naturalHeight || img.height
          const maxSide = opts.maxSide || 300
          let sw = w, sh = h
          if (Math.max(w, h) > maxSide) {
            const scale = maxSide / Math.max(w, h)
            sw = Math.round(w * scale)
            sh = Math.round(h * scale)
          }

          const canvas = document.createElement('canvas')
          canvas.width = sw
          canvas.height = sh
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, sw, sh)
          const imgData = ctx.getImageData(0, 0, sw, sh)
          const data = imgData.data

          // grayscale
          const gray = new Float32Array(sw * sh)
          for (let i = 0, p = 0; i < data.length; i += 4, p++) {
            gray[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
          }

          // compute local variance over a small window
          const radius = 2 // 5x5 neighborhood
          const variance = new Float32Array(sw * sh)
          for (let y = 0; y < sh; y++) {
            for (let x = 0; x < sw; x++) {
              let sum = 0, sumSq = 0, count = 0
              for (let oy = -radius; oy <= radius; oy++) {
                const ny = y + oy
                if (ny < 0 || ny >= sh) continue
                for (let ox = -radius; ox <= radius; ox++) {
                  const nx = x + ox
                  if (nx < 0 || nx >= sw) continue
                  const v = gray[ny * sw + nx]
                  sum += v
                  sumSq += v * v
                  count++
                }
              }
              const mean = sum / count
              variance[y * sw + x] = Math.max(0, sumSq / count - mean * mean)
            }
          }

          // adaptive threshold using sensitivity
          let totalVar = 0
          for (let i = 0; i < variance.length; i++) totalVar += variance[i]
          const avgVar = totalVar / variance.length
          const s = typeof opts.sensitivity === 'number' ? opts.sensitivity : 1.0
          const thresh = Math.max(40, avgVar * (0.9 * s))

          const mask = new Uint8ClampedArray(sw * sh)
          for (let i = 0; i < variance.length; i++) {
            mask[i] = variance[i] < thresh ? 1 : 0
          }

          // connected components to remove small regions
          const visited = new Uint8Array(sw * sh)
          const comps = []
          for (let i = 0; i < mask.length; i++) {
            if (visited[i] || mask[i] === 0) continue
            const queue = [i]
            visited[i] = 1
            let head = 0
            while (head < queue.length) {
              const idx = queue[head++];
              const y = Math.floor(idx / sw), x = idx % sw
              for (let ny = Math.max(0, y - 1); ny <= Math.min(sh - 1, y + 1); ny++) {
                for (let nx = Math.max(0, x - 1); nx <= Math.min(sw - 1, x + 1); nx++) {
                  const nidx = ny * sw + nx
                  if (visited[nidx] || mask[nidx] === 0) continue
                  visited[nidx] = 1
                  queue.push(nidx)
                }
              }
            }
            comps.push(queue)
          }

          const area = sw * sh
          const keep = new Uint8ClampedArray(sw * sh)
          const minSize = Math.max(40, Math.floor(area * 0.03 * (1 / s))) // sensitivity influences min size
          comps.forEach(c => {
            if (c.length >= minSize) {
              for (let j = 0; j < c.length; j++) keep[c[j]] = 1
            }
          })

          const keptCount = keep.reduce((s2, v) => s2 + v, 0)
          if (keptCount === 0) {
            for (let i = 0; i < variance.length; i++) {
              keep[i] = variance[i] < Math.max(30, avgVar * (1.2 * s)) ? 1 : 0
            }
          }

          // build mask canvas with alpha
          const maskCanvas = document.createElement('canvas')
          maskCanvas.width = sw
          maskCanvas.height = sh
          const mctx = maskCanvas.getContext('2d')
          const out = mctx.createImageData(sw, sh)
          for (let i = 0; i < sw * sh; i++) {
            const v = keep[i] ? 255 : 0
            out.data[i * 4 + 0] = 255
            out.data[i * 4 + 1] = 255
            out.data[i * 4 + 2] = 255
            out.data[i * 4 + 3] = v
          }
          mctx.putImageData(out, 0, 0)

          if (sw !== w || sh !== h) {
            const big = document.createElement('canvas')
            big.width = w
            big.height = h
            const bctx = big.getContext('2d')
            bctx.imageSmoothingEnabled = true
            bctx.drawImage(maskCanvas, 0, 0, w, h)
            resolve(big)
          } else {
            resolve(maskCanvas)
          }
        } catch (err) {
          reject(err)
        }
      }
      img.onerror = () => reject(new Error('Image load failed'))
      img.src = imageUrl
    })
  }

  async function applyColorToMasks(hex) {
    try {
      if (!currentImage?.url) return

      const img = await loadImage(currentImage.url)
      const w = img.width
      const h = img.height

      // generate a wall mask (canvas with alpha channel)
      const maskCanvas = await detectWallMask(currentImage.url, { maxSide: 400, sensitivity: maskSensitivity })
      let maskForUse = maskCanvas
      if (maskCanvas.width !== w || maskCanvas.height !== h) {
        const s = document.createElement('canvas')
        s.width = w
        s.height = h
        const sctx = s.getContext('2d')
        sctx.imageSmoothingEnabled = true
        sctx.drawImage(maskCanvas, 0, 0, w, h)
        maskForUse = s
      }

      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const ctx = off.getContext('2d')

      // draw original
      ctx.drawImage(img, 0, 0, w, h)

      // create color layer
      const colorLayer = document.createElement('canvas')
      colorLayer.width = w
      colorLayer.height = h
      const cctx = colorLayer.getContext('2d')
      cctx.fillStyle = hex
      cctx.fillRect(0, 0, w, h)

      // create masked color by keeping color only where mask alpha > 0
      const maskedColor = document.createElement('canvas')
      maskedColor.width = w
      maskedColor.height = h
      const mctx = maskedColor.getContext('2d')
      mctx.drawImage(colorLayer, 0, 0)
      mctx.globalCompositeOperation = 'destination-in'
      mctx.drawImage(maskForUse, 0, 0)
      mctx.globalCompositeOperation = 'source-over'

      // composite maskedColor onto original while preserving texture
      ctx.globalCompositeOperation = 'multiply'
      ctx.drawImage(maskedColor, 0, 0)
      ctx.globalCompositeOperation = 'screen'
      ctx.globalAlpha = 0.15
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

  async function generateMaskPreview() {
    if (!currentImage?.url) return setMaskPreviewUrl(null)
    try {
      const m = await detectWallMask(currentImage.url, { maxSide: 400, sensitivity: maskSensitivity })
      setMaskPreviewUrl(m.toDataURL())
    } catch (err) {
      console.warn('Failed to generate mask preview', err)
      setMaskPreviewUrl(null)
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
              Transform your room photos with AI-generated color suggestions
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container pb-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            {tabs.map((tab) => {
              const IconComp = tab.icon
              return (
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
                  {IconComp ? <IconComp className="w-4 h-4" /> : <span className="w-4 h-4 inline-block" />}
                  {tab.label}
                </motion.button>
              )
            })}
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
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <label className="text-sm">Mask sensitivity</label>
                  <input
                    type="range"
                    min="0.6"
                    max="1.6"
                    step="0.05"
                    value={maskSensitivity}
                    onChange={(e) => setMaskSensitivity(parseFloat(e.target.value))}
                    className="w-48"
                  />
                  <div className="text-sm px-2">{maskSensitivity.toFixed(2)}</div>
                  <button onClick={generateMaskPreview} className="btn-secondary text-sm">Preview Mask</button>
                  <label className="flex items-center gap-2 text-sm ml-3">
                    <input type="checkbox" checked={autoMaskPreview} onChange={(e) => setAutoMaskPreview(e.target.checked)} /> Auto-preview
                  </label>
                </div>

                <AISuggestions
                  onApply={(hex) => { applyColorToMasks(hex); setActiveTab('compare') }}
                  onPreview={(hex) => applyColorToMasks(hex)}
                  autoSuggestions={bestMatches}
                />

                {maskPreviewUrl && currentImage && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Detected mask preview</h4>
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg p-3 inline-block">
                      <img src={currentImage.url} alt="orig" className="max-h-40 rounded" />
                      <img src={maskPreviewUrl} alt="mask" style={{ position: 'absolute', top: 12, left: 12, maxHeight: 160, opacity: 0.45, mixBlendMode: 'screen' }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'compare' && (
              <BeforeAfterSlider
                original={currentImage?.url}
                recolored={recoloredDataUrl}
                onExport={() => handleExport('png')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
