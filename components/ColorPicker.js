import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiDroplet, FiSave, FiTrash2, FiPalette } from 'react-icons/fi'

export default function ColorPicker({ 
  value = '#ff0000', 
  onChange = () => {}, 
  onApply = () => {}, 
  onExport = () => {},
  savedColors = [],
  onSaveColor = () => {},
  onRemoveColor = () => {}
}) {
  const [showPicker, setShowPicker] = useState(false)
  const [colorFormat, setColorFormat] = useState('hex')

  function handleColorChange(e) {
    onChange(e.target.value)
  }

  function handleSaveColor() {
    onSaveColor(value)
  }

  function isColorSaved(color) {
    return savedColors.some(saved => saved.toLowerCase() === color.toLowerCase())
  }

  return (
    <div className="tool-panel fade-in">
      <div className="flex items-center gap-2 mb-4">
        <FiPalette className="text-2xl text-purple-500" />
        <h2 className="text-xl font-semibold">Color Picker</h2>
      </div>

      {/* Current Color Display */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Current Color</label>
        <div className="flex items-center gap-3">
          <div
            className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer shadow-lg"
            style={{ backgroundColor: value }}
            onClick={() => setShowPicker(!showPicker)}
          />
          <div className="flex-1">
            <div className="flex gap-2 mb-2">
              <select
                value={colorFormat}
                onChange={(e) => setColorFormat(e.target.value)}
                className="px-3 py-1 border rounded-lg text-sm bg-white dark:bg-gray-800"
              >
                <option value="hex">HEX</option>
                <option value="rgb">RGB</option>
                <option value="hsl">HSL</option>
              </select>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 px-3 py-1 border rounded-lg text-sm bg-white dark:bg-gray-800"
                placeholder="#000000"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="btn-primary text-sm px-3 py-1"
              >
                <FiDroplet className="inline mr-1" />
                Pick Color
              </button>
              <button
                onClick={handleSaveColor}
                disabled={isColorSaved(value)}
                className={`text-sm px-3 py-1 rounded-lg font-medium ${
                  isColorSaved(value)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'btn-success'
                }`}
              >
                <FiSave className="inline mr-1" />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Color Picker Popup */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2"
          >
            <div className="relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
              <input
                type="color"
                value={value}
                onChange={handleColorChange}
                className="w-full h-12 cursor-pointer"
              />
              <button
                onClick={() => setShowPicker(false)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
              >
                <FiTrash2 className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Colors */}
      {savedColors.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Saved Colors</label>
          <div className="grid grid-cols-6 gap-2">
            {savedColors.map((color, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group"
              >
                <div
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: color }}
                  onClick={() => onChange(color)}
                  title={color}
                />
                <button
                  onClick={() => onRemoveColor(index)}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiTrash2 className="w-2 h-2" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onApply(value)}
          className="btn-primary flex-1"
        >
          Apply to Masks
        </button>
        <button
          onClick={() => onExport('png')}
          className="btn-secondary"
        >
          Export PNG
        </button>
      </div>

      <div className="mt-3 text-sm text-gray-500">
        <p>💡 Tip: Use the color picker to find the perfect shade for your room</p>
      </div>
    </div>
  )
}
