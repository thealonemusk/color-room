import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FiUpload, FiImage, FiX, FiGrid } from 'react-icons/fi'

export default function UploadImage({ onSelect, images = [], onRemoveImage }) {
  const fileInputRef = useRef()
  const [isDragOver, setIsDragOver] = useState(false)

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        onSelect(file, url)
      }
    })
  }

  function handleFileInput(e) {
    const files = e.target.files
    if (files) handleFiles(files)
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files) handleFiles(files)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setIsDragOver(true)
  }

  function handleDragLeave(e) {
    e.preventDefault()
    setIsDragOver(false)
  }

  return (
    <div className="tool-panel fade-in">
      <div className="flex items-center gap-2 mb-4">
        <FiImage className="text-2xl text-blue-500" />
        <h2 className="text-xl font-semibold">Image Gallery</h2>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <FiUpload className="mx-auto text-4xl text-gray-400 mb-4" />
        <p className="text-lg font-medium mb-2">Drop images here or click to upload</p>
        <p className="text-sm text-gray-500 mb-4">Supports JPEG, PNG files</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary"
        >
          Choose Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <FiGrid className="text-lg" />
            <h3 className="font-medium">Uploaded Images ({images.length})</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative group cursor-pointer"
                onClick={() => onSelect(image.file, image.url)}
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={image.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveImage?.(index)
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {image.file.name.length > 15 
                    ? image.file.name.substring(0, 15) + '...' 
                    : image.file.name
                  }
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>💡 Tip: Upload multiple room photos to experiment with different color schemes</p>
      </div>
    </div>
  )
}
