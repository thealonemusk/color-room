import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image as KonvaImage, Line, Polygon } from 'react-konva'

function useKonvaImage(src) {
  const [img, setImg] = useState(null)
  useEffect(() => {
    if (!src) return setImg(null)
    const i = new window.Image()
    i.crossOrigin = 'anonymous'
    i.src = src
    i.onload = () => setImg(i)
  }, [src])
  return img
}

export default function MaskTool({ imageURL, onAddMask, masks = [], onClear }) {
  const img = useKonvaImage(imageURL)
  const stageRef = useRef()
  const [drawing, setDrawing] = useState(false)
  const [currentPoints, setCurrentPoints] = useState([])

  useEffect(() => {
    if (!imageURL) {
      setCurrentPoints([])
      setDrawing(false)
    }
  }, [imageURL])

  function handleStageClick(e) {
    if (!drawing) return
    const stage = stageRef.current
    const pos = stage.getPointerPosition()
    setCurrentPoints((p) => [...p, pos.x, pos.y])
  }

  function startDrawing() {
    setCurrentPoints([])
    setDrawing(true)
  }
  function finishDrawing() {
    if (currentPoints.length >= 6) {
      onAddMask({ points: currentPoints })
    }
    setCurrentPoints([])
    setDrawing(false)
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex gap-2 mb-2">
        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={startDrawing}>Start Mask</button>
        <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={finishDrawing}>Finish Mask</button>
        <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => { setCurrentPoints([]); setDrawing(false); onClear() }}>Clear Masks</button>
      </div>

      <div style={{ border: '1px solid #e5e7eb' }}>
        {img ? (
          <Stage width={Math.min(800, img.width)} height={Math.min(600, img.height)} onMouseDown={handleStageClick} ref={stageRef}>
            <Layer>
              <KonvaImage image={img} x={0} y={0} width={Math.min(800, img.width)} height={Math.min(600, img.height)} />

              {masks.map((m, i) => (
                <Line key={i} points={m.points} closed stroke="#00b4d8" strokeWidth={2} opacity={0.6} fill={"rgba(0,180,216,0.2)"} />
              ))}

              {currentPoints.length >= 2 && (
                <Line points={currentPoints} stroke="#ef476f" strokeWidth={2} closed={false} />
              )}
            </Layer>
          </Stage>
        ) : (
          <div className="p-8 text-sm text-gray-500">No image loaded for masking.</div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-2">Drawing mode: click to add polygon points. Click "Finish Mask" to save the polygon.</p>
    </div>
  )
}
