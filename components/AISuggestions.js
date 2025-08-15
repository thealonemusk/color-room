import { useState } from 'react'
import { fetchPalettes } from '../utils/gemini'

export default function AISuggestions({ onApply = () => {} }) {
  const [roomType, setRoomType] = useState('bedroom')
  const [stylePref, setStylePref] = useState('modern')
  const [loading, setLoading] = useState(false)
  const [palettes, setPalettes] = useState([])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetchPalettes(roomType, stylePref)
      setPalettes(res)
    } catch (err) {
      console.error(err)
      setPalettes([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="block text-sm">Room type</label>
          <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="border rounded w-full">
            <option value="bedroom">Bedroom</option>
            <option value="living room">Living room</option>
            <option value="kitchen">Kitchen</option>
            <option value="exterior">Exterior</option>
          </select>
        </div>

        <div>
          <label className="block text-sm">Style preference</label>
          <select value={stylePref} onChange={(e) => setStylePref(e.target.value)} className="border rounded w-full">
            <option value="modern">Modern</option>
            <option value="cozy">Cozy</option>
            <option value="vibrant">Vibrant</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>

        <div>
          <button className="px-3 py-1 bg-indigo-600 text-white rounded" disabled={loading}>{loading ? 'Thinking...' : 'Get suggestions'}</button>
        </div>
      </form>

      <div className="mt-3">
        {palettes.map((p, i) => (
          <div key={i} className="mb-3 p-2 border rounded">
            <div className="text-sm font-medium">{p.title || `Palette ${i + 1}`}</div>
            <div className="text-xs text-gray-500">{p.description}</div>
            <div className="flex gap-2 mt-2">
              {p.colors.map((c, idx) => (
                <button key={idx} title={c.name} onClick={() => onApply(c.hex)} className="w-10 h-10 rounded" style={{ background: c.hex }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 mt-2">Note: Gemini API call is a placeholder; set NEXT_PUBLIC_GEMINI_API_KEY to enable real calls (client-side).</div>
    </div>
  )
}
