export async function fetchPalettes(roomType, stylePref) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!apiKey) {
    // return mocked palettes
    return [
      {
        title: 'Calm Neutrals',
        description: `${stylePref} neutrals for a ${roomType}`,
        colors: [
          { hex: '#f4f1ea', name: 'Ivory' },
          { hex: '#c9c5b6', name: 'Stone' },
          { hex: '#7d7a70', name: 'Driftwood' }
        ]
      },
      {
        title: 'Warm Cozy',
        description: `${stylePref} warm palette for a ${roomType}`,
        colors: [
          { hex: '#fde2c8', name: 'Peach Puff' },
          { hex: '#f6a878', name: 'Terracotta' },
          { hex: '#b85c38', name: 'Cedar' }
        ]
      }
    ]
  }

  // Placeholder: example fetch structure. In production replace endpoint and body per Gemini API.
  try {
    const prompt = `Suggest 3 color palettes (each 3-5 HEX colors) for a ${stylePref} ${roomType}. Include a short title and 1-line description.`
    const resp = await fetch('https://api.openai.example/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ prompt, max_tokens: 300 })
    })
    const data = await resp.json()
    // NOTE: The response parsing below is placeholder and must be adapted to the real Gemini response format.
    if (!data || !data.choices) return []
    const text = data.choices[0].text || data.choices[0].message?.content || ''

    // very naive parsing of palettes from text - implement proper parsing for production
    // For scaffold return mocked if parsing fails
    return [
      {
        title: 'AI Palette A',
        description: 'Example palette from Gemini',
        colors: [
          { hex: '#e6eef6', name: 'Paper' },
          { hex: '#9fb3c8', name: 'Sea Fog' },
          { hex: '#2b6a7f', name: 'Deep Teal' }
        ]
      }
    ]
  } catch (err) {
    console.error('Gemini fetch failed', err)
    return []
  }
}
