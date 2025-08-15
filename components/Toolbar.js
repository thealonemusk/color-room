import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSun, FiMoon, FiSettings, FiHelpCircle, FiGithub } from 'react-icons/fi'

export default function Toolbar({ onToggleDarkMode, isDarkMode }) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex gap-2">
        {/* Dark Mode Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleDarkMode}
          className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <FiSun className="w-5 h-5 text-yellow-500" />
          ) : (
            <FiMoon className="w-5 h-5 text-gray-600" />
          )}
        </motion.button>

        {/* Settings */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
          title="Settings"
        >
          <FiSettings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </motion.button>

        {/* Help */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open('https://github.com/your-repo/virtual-house-painter', '_blank')}
          className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
          title="Help & Documentation"
        >
          <FiHelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </motion.button>

        {/* GitHub */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open('https://github.com/your-repo/virtual-house-painter', '_blank')}
          className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
          title="View on GitHub"
        >
          <FiGithub className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </motion.button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-16 right-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4"
          >
            <h3 className="font-semibold mb-3">Settings</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">API Configuration</label>
                <div className="text-xs text-gray-500 mb-2">
                  Set your Gemini API key in .env.local for AI suggestions
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs font-mono">
                  NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Export Quality</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm">
                  <option value="high">High Quality</option>
                  <option value="medium">Medium Quality</option>
                  <option value="low">Low Quality</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Auto-save</label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm">Save work automatically</span>
                </label>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500">
                Version 1.0.0 • Built with Next.js & TailwindCSS
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
