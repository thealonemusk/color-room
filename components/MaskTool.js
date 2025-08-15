import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FiEdit3, FiTrash2, FiZoomIn, FiZoomOut, FiMove, FiRotateCcw } from 'react-icons/fi'

function useKonvaImage(src) {
  const [img, setImg] = useState(null)
  useEffect(() => {
    if (!src) return setImg(null)
    const i = new Image()
    i.crossOrigin = 'anonymous'
    i.src = src
    i.onload = () => setImg(i)
  }, [src])
  return img
}

export default function MaskTool({ 
  imageURL, 
  onAddMask, 
  masks = [], 
  onClear,
  onUpdateMask,
  onDeleteMask,
  selectedMaskIndex,
  onSelectMask
}) {
  // Load react-konva on the client at runtime
  const [KonvaModules, setKonvaModules] = useState(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    let mounted = true
    import('react-konva')
      .then(mod => { if (mounted) setKonvaModules(mod) })
      .catch(err => { console.error('Failed to load react-konva:', err) })
    return () => { mounted = false }
  }, [])

  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return (
      <div className="tool-panel fade-in">
        <div className="flex items-center gap-2 mb-4">
          <FiEdit3 className="text-2xl text-green-500" />
          <h2 className="text-xl font-semibold">Mask Editor</h2>
        </div>
        <div className="p-8 text-center text-gray-500">
          <p>Loading mask editor...</p>
        </div>
      </div>
    )
  }

  const img = useKonvaImage(imageURL)
  const stageRef = useRef()
  const transformerRef = useRef()
  const [drawing, setDrawing] = useState(false)
  const [currentPoints, setCurrentPoints] = useState([])
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [tool, setTool] = useState('draw') // 'draw', 'select', 'move'

  useEffect(() => {
    if (!imageURL) {
      setCurrentPoints([])
      setDrawing(false)
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [imageURL])

  useEffect(() => {
    if (selectedMaskIndex !== null && transformerRef.current && stageRef.current && KonvaModules) {
      const stage = stageRef.current
      const selectedNode = stage.findOne(`#mask-${selectedMaskIndex}`)
      if (selectedNode && transformerRef.current) {
        transformerRef.current.nodes([selectedNode])
        transformerRef.current.getLayer().batchDraw()
      }
    }
  }, [selectedMaskIndex, KonvaModules])

  function handleStageClick(e) {
    if (tool !== 'draw' || !drawing) return
    const stage = stageRef.current
    const pos = stage.getPointerPosition()
    const scaledPos = {
      x: (pos.x - position.x) / scale,
      y: (pos.y - position.y) / scale
    }
    setCurrentPoints((p) => [...p, scaledPos.x, scaledPos.y])
  }

  function handleMaskClick(index) {
    if (tool === 'select') {
      onSelectMask(index)
    }
  }

  function startDrawing() {
    setCurrentPoints([])
    setDrawing(true)
    setTool('draw')
    onSelectMask(null)
  }

  function finishDrawing() {
    if (currentPoints.length >= 6) {
      onAddMask({ points: currentPoints })
    }
    setCurrentPoints([])
    setDrawing(false)
  }

  function handleWheel(e) {
    e.evt.preventDefault()
    const stage = stageRef.current
    const oldScale = scale
    const pointer = stage.getPointerPosition()
    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    }

    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1
    setScale(newScale)

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    }
    setPosition(newPos)
  }

  function resetView() {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  function zoomIn() {
    setScale(scale * 1.2)
  }

  function zoomOut() {
    setScale(scale * 0.8)
  }

  const stageWidth = Math.min(800, img?.width || 800)
  const stageHeight = Math.min(600, img?.height || 600)

  return (
    <div className="tool-panel fade-in">
      <div className="flex items-center gap-2 mb-4">
        <FiEdit3 className="text-2xl text-green-500" />
        <h2 className="text-xl font-semibold">Mask Editor</h2>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button 
          className={`px-3 py-2 rounded-lg font-medium transition-all ${
            tool === 'draw' ? 'btn-primary' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setTool('draw')}
        >
          <FiEdit3 className="inline mr-1" />
          Draw
        </button>
        <button 
          className={`px-3 py-2 rounded-lg font-medium transition-all ${
            tool === 'select' ? 'btn-primary' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          onClick={() => setTool('select')}
        >
          <FiMove className="inline mr-1" />
          Select
        </button>
        <button 
          className="btn-success px-3 py-2 rounded-lg font-medium"
          onClick={startDrawing}
          disabled={drawing}
        >
          Start Mask
        </button>
        <button 
          className="btn-secondary px-3 py-2 rounded-lg font-medium"
          onClick={finishDrawing}
          disabled={!drawing}
        >
          Finish Mask
        </button>
        <button 
          className="btn-danger px-3 py-2 rounded-lg font-medium"
          onClick={() => { 
            setCurrentPoints([]); 
            setDrawing(false); 
            onClear(); 
            onSelectMask(null);
          }}
        >
          <FiTrash2 className="inline mr-1" />
          Clear All
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex gap-2 mb-4">
        <button 
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-lg"
          onClick={zoomIn}
        >
          <FiZoomIn className="w-4 h-4" />
        </button>
        <button 
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-lg"
          onClick={zoomOut}
        >
          <FiZoomOut className="w-4 h-4" />
        </button>
        <button 
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-lg"
          onClick={resetView}
        >
          <FiRotateCcw className="w-4 h-4" />
        </button>
        <span className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg">
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* Canvas Area */}
      <div className="border-2 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900">
        { !KonvaModules ? (
          <div className="p-8 text-center text-gray-500">
            <FiEdit3 className="mx-auto text-4xl mb-4 opacity-50" />
            <p>Loading mask editor...</p>
          </div>
        ) : img ? (
          // ...use the loaded Konva components...
          <KonvaModules.Stage 
            width={stageWidth} 
            height={stageHeight} 
            onMouseDown={handleStageClick}
            onWheel={handleWheel}
            ref={stageRef}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            draggable={tool === 'move'}
          >
            <KonvaModules.Layer>
              <KonvaModules.Image 
                image={img} 
                x={0} 
                y={0} 
                width={stageWidth} 
                height={stageHeight} 
              />

              {/* Existing Masks */}
              {masks.map((mask, i) => (
                <KonvaModules.Line
                  key={i}
                  id={`mask-${i}`}
                  points={mask.points}
                  closed={true}
                  stroke={selectedMaskIndex === i ? "#ef4444" : "#00b4d8"}
                  strokeWidth={selectedMaskIndex === i ? 3 : 2}
                  opacity={0.8}
                  fill={selectedMaskIndex === i ? "rgba(239,68,68,0.3)" : "rgba(0,180,216,0.2)"}
                  onClick={() => handleMaskClick(i)}
                  onTap={() => handleMaskClick(i)}
                />
              ))}

              {/* Current Drawing */}
              {currentPoints.length >= 2 && (
                <KonvaModules.Line 
                  points={currentPoints} 
                  stroke="#ef476f" 
                  strokeWidth={3} 
                  closed={false}
                  dash={[5, 5]}
                />
              )}

              {/* Transformer for selected mask */}
              <KonvaModules.Transformer ref={transformerRef} />
            </KonvaModules.Layer>
          </KonvaModules.Stage>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FiEdit3 className="mx-auto text-4xl mb-4 opacity-50" />
            <p>No image loaded for masking.</p>
            <p className="text-sm">Upload an image to start creating masks.</p>
          </div>
        )}
      </div>

      {/* Mask List */}
      {masks.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Masks ({masks.length})</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {masks.map((mask, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                  selectedMaskIndex === index 
                    ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700' 
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => onSelectMask(index)}
              >
                <span className="text-sm">Mask {index + 1}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteMask(index)
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 text-sm text-gray-500">
        <p>💡 Tip: Draw masks around walls or areas you want to recolor. Use zoom and pan to work with details.</p>
      </div>
    </div>
  )
}
