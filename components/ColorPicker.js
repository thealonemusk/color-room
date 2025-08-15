export default function ColorPicker({ value = '#ff0000', onChange = () => {}, onApply = () => {}, onExport = () => {} }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <label className="block text-sm font-medium mb-2">Choose color (HEX)</label>
      <div className="flex items-center gap-2">
        <input className="w-12 h-10 p-0 border rounded" type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <input className="border rounded px-2 py-1" value={value} onChange={(e) => onChange(e.target.value)} />
        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={onApply}>Apply</button>
      </div>

      <div className="mt-3 text-xs text-gray-500">Tip: pick a HEX color or use AI suggestions.</div>
    </div>
  )
}
