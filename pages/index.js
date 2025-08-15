import { useState, useRef } from 'react'
import UploadImage from '../components/UploadImage'
import MaskTool from '../components/MaskTool'
import ColorPicker from '../components/ColorPicker'
import AISuggestions from '../components/AISuggestions'
import BeforeAfterSlider from '../components/BeforeAfterSlider'

export default function Home() {
  const [imageFile, setImageFile] = useState(null)
  const [imageURL, setImageURL] = useState(null)
  const [masks, setMasks] = useState([]) // each mask: {points: [x,y,...]}
  const [recoloredDataUrl, setRecoloredDataUrl] = useState(null)
  const [currentColor, setCurrentColor] = useState('#ff0000')
  const canvasRef = useRef(null)

  function handleSelectImage(file, url) {
    setImageFile(file)
    setImageURL(url)
    setMasks([])
    setRecoloredDataUrl(null)
  }

  function handleAddMask(mask) {
    setMasks((s) => [...s, mask])
  }

  function handleClearMasks() {
    setMasks([])
  }

  // Core: apply color to masked regions using an offscreen canvas
  async function applyColorToMasks(hex) {
    if (!imageURL) return
    const img = await loadImage(imageURL)
    const w = img.width
    const h = img.height

    const off = document.createElement('canvas')
    off.width = w
    off.height = h
    const ctx = off.getContext('2d')

    // draw original
    ctx.drawImage(img, 0, 0, w, h)

    // create colored layer only inside masks
    const colorLayer = document.createElement('canvas')
    colorLayer.width = w
    colorLayer.height = h
    const cctx = colorLayer.getContext('2d')

    // fill each mask path on color layer
    cctx.fillStyle = hex

    masks.forEach((m) => {
      const pts = m.points
      if (!pts || pts.length < 6) return
      cctx.beginPath()
      cctx.moveTo(pts[0], pts[1])
      for (let i = 2; i < pts.length; i += 2) cctx.lineTo(pts[i], pts[i + 1])
      cctx.closePath()
      cctx.fill()
    })

    // Blend the color layer onto original while preserving texture: use multiply then overlay original luminance
    // Strategy: create temp, draw original as grayscale alpha mask then composite. This is a simple approximation.

    // Option 1: use globalCompositeOperation 'source-in' to color only masked pixels, then draw over original with 'multiply'
    const maskedColor = document.createElement('canvas')
    maskedColor.width = w
    maskedColor.height = h
    const mctx = maskedColor.getContext('2d')

    // draw color layer
    mctx.drawImage(colorLayer, 0, 0)
    // keep color only where mask exists by using source-in with mask drawn from masks
    mctx.globalCompositeOperation = 'destination-in'
    // draw mask paths
    mctx.beginPath()
    masks.forEach((m) => {
      const pts = m.points
      if (!pts || pts.length < 6) return
      mctx.moveTo(pts[0], pts[1])
      for (let i = 2; i < pts.length; i += 2) mctx.lineTo(pts[i], pts[i + 1])
      mctx.closePath()
    })
    mctx.fill()

    // now composite: draw original then draw maskedColor with 'multiply' to preserve texture
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(img, 0, 0, w, h)
    ctx.globalCompositeOperation = 'multiply'
    ctx.drawImage(maskedColor, 0, 0)
    // draw maskedColor again with 'screen' at low alpha to bring back brightness (simple tweak)
    ctx.globalCompositeOperation = 'screen'
    ctx.globalAlpha = 0.2
    ctx.drawImage(maskedColor, 0, 0)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'

    const dataUrl = off.toDataURL('image/png')
    setRecoloredDataUrl(dataUrl)
    return dataUrl
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
    const url = recoloredDataUrl || imageURL
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `recolor.${format === 'jpeg' ? 'jpg' : 'png'}`
    a.click()
  }

  return (
    <div className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Virtual House Painter (scaffold)</h1>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <UploadImage onSelect={handleSelectImage} />

          {imageURL && (
            <div className="mt-4">
              <MaskTool imageURL={imageURL} onAddMask={handleAddMask} masks={masks} onClear={handleClearMasks} />
            </div>
          )}
        </div>

        <div>
          <ColorPicker value={currentColor} onChange={setCurrentColor} onApply={() => applyColorToMasks(currentColor)} onExport={handleExport} />

          <div className="mt-4">
            <AISuggestions onApply={(hex) => { setCurrentColor(hex); applyColorToMasks(hex) }} />
          </div>

          <div className="mt-4 space-y-2">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setRecoloredDataUrl(null)}>Reset Recolor</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => applyColorToMasks(currentColor)}>Apply color to masks</button>
            <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={() => handleExport('png')}>Download PNG</button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium mb-2">Before / After</h2>
        <BeforeAfterSlider original={imageURL} recolored={recoloredDataUrl} />
      </section>
    </div>
  )
}
