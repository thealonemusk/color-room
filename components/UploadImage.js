import { useRef } from 'react'

export default function UploadImage({ onSelect }) {
  const ref = useRef()

  function handleFiles(e) {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onSelect(file, url)
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <label className="block text-sm font-medium mb-2">Upload image (JPEG / PNG)</label>
      <input ref={ref} type="file" accept="image/*" onChange={handleFiles} />
      <p className="text-xs text-gray-500 mt-2">Tip: Upload a photo of the room. You can draw masks on walls to recolor them.</p>
    </div>
  )
}
