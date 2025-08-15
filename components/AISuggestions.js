import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiZap, FiPalette, FiLoader, FiStar } from 'react-icons/fi'
import { fetchPalettes } from '../utils/gemini'

export default function AISuggestions({ onApply = () => {}, onPreview = null, autoSuggestions = [] }) {
  const [roomType, setRoomType] = useState('bedroom')
  const [stylePref, setStylePref] = useState('modern')
  const [loading, setLoading] = useState(false)
  const [palettes, setPalettes] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (autoSuggestions && autoSuggestions.length > 0) {
      setPalettes(prev => [{ title: 'Auto Suggestions', description: 'Colors extracted from your image', colors: autoSuggestions.map((hex, i) => ({ name: `Auto ${i+1}`, hex })) }, ...prev])
    }
  }, [autoSuggestions])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetchPalettes(roomType, stylePref)
      setPalettes(res)
    } catch (err) {
      console.error('AI Suggestions Error:', err)
      setError('Failed to get AI suggestions. Please try again.')
      setPalettes([])
    } finally {
      setLoading(false)
    }
  }

  function handleColorClick(color) {
    // default apply behaviour
    onApply(color.hex)
  }

  async function handlePreview(color) {
    if (onPreview) {
      await onPreview(color.hex)
    } else {
      // fallback to apply behaviour if preview not provided
      onApply(color.hex)
    }
  }

  return (
    <div className="tool-panel fade-in">
      <div className="flex items-center gap-2 mb-4">
        <FiZap className="text-2xl text-yellow-500" />
        <h2 className="text-xl font-semibold">AI Color Suggestions</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Room Type</label>
            <select 
              value={roomType} 
              onChange={(e) => setRoomType(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="bedroom">Bedroom</option>
              <option value="living room">Living Room</option>
              <option value="kitchen">Kitchen</option>
              <option value="bathroom">Bathroom</option>
              <option value="dining room">Dining Room</option>
              <option value="home office">Home Office</option>
              <option value="exterior">Exterior</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Style Preference</label>
            <select 
              value={stylePref} 
              onChange={(e) => setStylePref(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="modern">Modern</option>
              <option value="cozy">Cozy</option>
              <option value="vibrant">Vibrant</option>
              <option value="minimal">Minimal</option>
              <option value="rustic">Rustic</option>
              <option value="elegant">Elegant</option>
              <option value="bohemian">Bohemian</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <FiLoader className="animate-spin" />
              Generating Suggestions...
            </>
          ) : (
            <>
              <FiZap />
              Get AI Suggestions
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Palettes */}
      <AnimatePresence>
        {palettes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <FiPalette className="text-lg" />
              <h3 className="font-medium">Suggested Color Palettes</h3>
            </div>
            
            {palettes.map((palette, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <FiStar className="text-yellow-500" />
                      {palette.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {palette.description}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {palette.colors.map((color, idx) => (
                    <div key={idx} className="flex flex-col items-stretch gap-2">
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (i * 0.1) + (idx * 0.05) }}
                        onClick={() => handleColorClick(color)}
                        className="group relative aspect-square rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        style={{ backgroundColor: color.hex }}
                        title={`${color.name} (${color.hex})`}
                      >
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-lg" />
                      </motion.button>
                      <div className="flex gap-2">
                        <button onClick={() => handlePreview(color)} className="btn-secondary text-sm flex-1">Preview</button>
                        <button onClick={() => onApply(color.hex)} className="btn-primary text-sm flex-1">Apply</button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!loading && palettes.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          <FiPalette className="mx-auto text-4xl mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No suggestions yet</p>
          <p className="text-sm">Select your room type and style preference, then click "Get AI Suggestions" to see color palettes.</p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>💡 Tip: AI suggestions are powered by Gemini. Set your API key in .env.local for real suggestions.</p>
      </div>
    </div>
  )
}
