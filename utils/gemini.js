// Next.js uses React under the hood. All components and utilities here are standard React/Next.js patterns.
// This file fetches color palettes from the Gemini API or returns mock data if no API key is set.

export async function fetchPalettes(roomType, stylePref) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  
  if (!apiKey) {
    // Return mocked palettes when no API key is provided
    return getMockPalettes(roomType, stylePref)
  }

  if (typeof fetch !== 'function') {
    console.warn('fetch is not available in this environment. Are you running on the server without a fetch polyfill?')
    return getMockPalettes(roomType, stylePref)
  }

  try {
    const prompt = `Generate 5 color palettes for a ${stylePref} ${roomType}. Each palette should include:
1. A creative title
2. 3-5 HEX color codes with descriptive names
3. A brief style description (1-2 sentences)

Format the response as JSON with this structure:
{
  "palettes": [
    {
      "title": "Palette Name",
      "description": "Style description",
      "colors": [
        {"name": "Color Name", "hex": "#HEXCODE"},
        {"name": "Color Name", "hex": "#HEXCODE"}
      ]
    }
  ]
}

Focus on colors that work well together and suit the ${stylePref} style for a ${roomType}. Include a mix of wall colors, accent colors, and complementary shades.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    })

    if (!response.ok) {
      // Log the error details for debugging
      const errorText = await response.text().catch(() => '')
      console.error(`Gemini API error: ${response.status} ${response.statusText}\n${errorText}`)
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API')
    }

    const text = data.candidates[0].content.parts[0].text
    
    // Try to parse JSON from the response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.palettes && Array.isArray(parsed.palettes)) {
          return parsed.palettes
        }
      }
    } catch (parseError) {
      console.warn('Failed to parse JSON from Gemini response:', parseError)
    }

    // Fallback: try to extract colors from text response
    return parseColorsFromText(text, roomType, stylePref)

  } catch (error) {
    console.error('Gemini API Error:', error)
    // Return mock data on error
    return getMockPalettes(roomType, stylePref)
  }
}

function getMockPalettes(roomType, stylePref) {
  const mockPalettes = {
    modern: [
      {
        title: "Modern Minimalist",
        description: "Clean, sophisticated palette with neutral tones and subtle accents",
        colors: [
          { name: "Pure White", hex: "#ffffff" },
          { name: "Charcoal Gray", hex: "#2c3e50" },
          { name: "Warm Beige", hex: "#f5f5dc" },
          { name: "Navy Blue", hex: "#1e3a8a" },
          { name: "Sage Green", hex: "#9ca3af" }
        ]
      },
      {
        title: "Contemporary Cool",
        description: "Sleek palette featuring cool grays and bold accent colors",
        colors: [
          { name: "Light Gray", hex: "#f8fafc" },
          { name: "Steel Blue", hex: "#475569" },
          { name: "Coral Accent", hex: "#f97316" },
          { name: "Deep Teal", hex: "#0f766e" },
          { name: "Warm White", hex: "#fefefe" }
        ]
      }
    ],
    cozy: [
      {
        title: "Warm & Cozy",
        description: "Inviting palette with warm earth tones and soft neutrals",
        colors: [
          { name: "Cream", hex: "#fef7e0" },
          { name: "Taupe", hex: "#8b7355" },
          { name: "Terracotta", hex: "#d97706" },
          { name: "Sage", hex: "#84cc16" },
          { name: "Warm Gray", hex: "#6b7280" }
        ]
      },
      {
        title: "Comfortable Neutral",
        description: "Soft, welcoming colors that create a peaceful atmosphere",
        colors: [
          { name: "Ivory", hex: "#fafaf9" },
          { name: "Mushroom", hex: "#a8a29e" },
          { name: "Dusty Rose", hex: "#e11d48" },
          { name: "Olive", hex: "#65a30d" },
          { name: "Warm Beige", hex: "#f5f5dc" }
        ]
      }
    ],
    vibrant: [
      {
        title: "Bold & Bright",
        description: "Energetic palette with vibrant colors and high contrast",
        colors: [
          { name: "Electric Blue", hex: "#3b82f6" },
          { name: "Sunny Yellow", hex: "#eab308" },
          { name: "Hot Pink", hex: "#ec4899" },
          { name: "Lime Green", hex: "#84cc16" },
          { name: "Pure White", hex: "#ffffff" }
        ]
      },
      {
        title: "Tropical Paradise",
        description: "Vibrant tropical-inspired colors that bring energy to the space",
        colors: [
          { name: "Turquoise", hex: "#06b6d4" },
          { name: "Coral", hex: "#f97316" },
          { name: "Lime", hex: "#84cc16" },
          { name: "Purple", hex: "#8b5cf6" },
          { name: "Warm White", hex: "#fefefe" }
        ]
      }
    ],
    minimal: [
      {
        title: "Pure Minimal",
        description: "Ultra-clean palette with maximum whites and subtle grays",
        colors: [
          { name: "Pure White", hex: "#ffffff" },
          { name: "Off White", hex: "#fafafa" },
          { name: "Light Gray", hex: "#f3f4f6" },
          { name: "Charcoal", hex: "#374151" },
          { name: "Warm Gray", hex: "#9ca3af" }
        ]
      },
      {
        title: "Minimal Accent",
        description: "Clean minimal base with one carefully chosen accent color",
        colors: [
          { name: "White", hex: "#ffffff" },
          { name: "Light Gray", hex: "#f8fafc" },
          { name: "Navy Blue", hex: "#1e3a8a" },
          { name: "Warm Gray", hex: "#6b7280" },
          { name: "Cream", hex: "#fef7e0" }
        ]
      }
    ],
    rustic: [
      {
        title: "Rustic Charm",
        description: "Natural, earthy palette inspired by rustic farmhouse style",
        colors: [
          { name: "Warm White", hex: "#fef7e0" },
          { name: "Barn Red", hex: "#dc2626" },
          { name: "Sage Green", hex: "#84cc16" },
          { name: "Warm Brown", hex: "#92400e" },
          { name: "Stone Gray", hex: "#6b7280" }
        ]
      },
      {
        title: "Country Comfort",
        description: "Cozy rustic colors that evoke warmth and tradition",
        colors: [
          { name: "Cream", hex: "#fafaf9" },
          { name: "Olive", hex: "#65a30d" },
          { name: "Terracotta", hex: "#d97706" },
          { name: "Navy", hex: "#1e3a8a" },
          { name: "Warm Gray", hex: "#8b7355" }
        ]
      }
    ]
  }

  return mockPalettes[stylePref] || mockPalettes.modern
}

function parseColorsFromText(text, roomType, stylePref) {
  // Simple fallback parsing - extract hex colors and create basic palettes
  const hexMatches = text.match(/#[0-9a-fA-F]{6}/g) || []
  const colors = hexMatches.slice(0, 15).map((hex, index) => ({
    name: `Color ${index + 1}`,
    hex: hex.toLowerCase()
  }))

  if (colors.length === 0) {
    return getMockPalettes(roomType, stylePref)
  }

  // Group colors into palettes
  const palettes = []
  for (let i = 0; i < colors.length; i += 5) {
    const paletteColors = colors.slice(i, i + 5)
    palettes.push({
      title: `${stylePref.charAt(0).toUpperCase() + stylePref.slice(1)} Palette ${Math.floor(i / 5) + 1}`,
      description: `A ${stylePref} color palette for your ${roomType}`,
      colors: paletteColors
    })
  }

  return palettes.slice(0, 3) // Return max 3 palettes
}
