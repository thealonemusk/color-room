import { useState, useRef, useEffect } from 'react'

export default function BeforeAfterSlider({ original, recolored }) {
  const [pos, setPos] = useState(50)

  if (!original) return <div className="p-4 bg-white rounded shadow text-gray-500">Upload an image to see comparison.</div>

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="relative w-full overflow-hidden border" style={{ height: 400 }}>
        <img src={original} alt="original" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute', left: 0, top: 0 }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: `${pos}%`, height: '100%', overflow: 'hidden' }}>
          <img src={recolored || original} alt="recolor" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ position: 'absolute', left: `${pos}%`, top: 0, bottom: 0, width: 2, background: '#fff', transform: 'translateX(-1px)' }} />
      </div>
      <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(e.target.value)} className="w-full mt-3" />
    </div>
  )
}
