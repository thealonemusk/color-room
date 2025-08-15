# Virtual House Painter 🎨

A modern, AI-powered web application for virtual room painting and color visualization. Transform your room photos with professional masking tools and AI-generated color suggestions.

![Virtual House Painter](https://img.shields.io/badge/Next.js-13.5.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.7-38B2AC?style=for-the-badge&logo=tailwind-css)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-orange?style=for-the-badge)

## ✨ Features

### 🖼️ Image Management
- **Multiple Image Upload**: Drag & drop or click to upload multiple room photos
- **Image Gallery**: Browse and manage uploaded images with thumbnail previews
- **High-Resolution Support**: Works with JPEG and PNG files of any size

### 🎯 Professional Masking Tools
- **Polygon Masking**: Draw precise masks around walls and areas to recolor
- **Zoom & Pan**: Detailed work with zoom controls and pan functionality
- **Mask Management**: Select, edit, and delete individual masks
- **Visual Feedback**: Real-time preview of mask boundaries

### 🎨 Advanced Color Tools
- **Modern Color Picker**: Full-featured color picker with HEX, RGB, and HSL support
- **Color Library**: Save and organize your favorite colors
- **Live Preview**: See color changes applied in real-time
- **Texture Preservation**: Advanced blending algorithms preserve shadows and textures

### 🤖 AI-Powered Suggestions
- **Gemini AI Integration**: Get intelligent color palette suggestions
- **Room-Specific Recommendations**: Tailored suggestions for different room types
- **Style Preferences**: Choose from modern, cozy, vibrant, minimal, rustic, and more
- **5 Palette Options**: Each request generates 5 unique color combinations

### 🔄 Before/After Comparison
- **Interactive Slider**: Drag to compare original and recolored versions
- **Toggle Visibility**: Show/hide original or recolored images
- **Export Options**: Download high-quality PNG or JPEG files

### 🌙 Modern UI/UX
- **Dark/Light Mode**: Toggle between themes with smooth transitions
- **Glassmorphism Design**: Beautiful glass-like panels and effects
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Gemini API key (optional, for AI suggestions)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/virtual-house-painter.git
   cd virtual-house-painter
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables** (optional)
   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here" > .env.local
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Gemini API Setup

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a `.env.local` file in the project root
3. Add your API key:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Gemini API key for AI suggestions | No (uses mock data) |
| `NEXT_PUBLIC_DEBUG_MODE` | Enable debug logging | No |

## 📖 Usage Guide

### 1. Upload Images
- Click the "Upload" tab
- Drag and drop room photos or click "Choose Files"
- Select multiple images to work with different rooms

### 2. Create Masks
- Switch to the "Mask" tab
- Click "Start Mask" to begin drawing
- Click on the image to add polygon points
- Click "Finish Mask" to save the mask
- Use zoom controls for detailed work

### 3. Choose Colors
- Go to the "Color" tab
- Use the color picker or enter HEX codes
- Save favorite colors for quick access
- Click "Apply to Masks" to see changes

### 4. Get AI Suggestions
- Navigate to the "AI" tab
- Select room type and style preference
- Click "Get AI Suggestions"
- Click any color swatch to apply it

### 5. Compare Results
- Use the "Compare" tab
- Drag the slider to see before/after
- Toggle visibility of original/recolored
- Export your final result

## 🛠️ Tech Stack

- **Framework**: Next.js 13.5.6
- **UI Library**: React 18.2.0
- **Styling**: TailwindCSS 3.4.7
- **Canvas**: Konva.js with react-konva
- **Color Picker**: react-color
- **Animations**: Framer Motion
- **Icons**: React Icons
- **AI**: Google Gemini API

## 📁 Project Structure

```
virtual-house-painter/
├── components/           # React components
│   ├── UploadImage.js    # Image upload and gallery
│   ├── MaskTool.js       # Masking tools with Konva
│   ├── ColorPicker.js    # Color selection interface
│   ├── AISuggestions.js  # AI-powered suggestions
│   ├── BeforeAfterSlider.js # Comparison slider
│   └── Toolbar.js        # Top toolbar with controls
├── pages/               # Next.js pages
│   ├── index.js         # Main application page
│   └── _app.js          # App wrapper
├── styles/              # Global styles
│   └── globals.css      # TailwindCSS and custom styles
├── utils/               # Utility functions
│   └── gemini.js        # Gemini API integration
├── public/              # Static assets
└── package.json         # Dependencies and scripts
```

## 🎯 Key Features Explained

### Advanced Masking
The masking system uses Konva.js for precise polygon drawing with:
- Real-time visual feedback
- Zoom and pan capabilities
- Individual mask selection and editing
- Professional-grade precision

### AI Color Suggestions
Powered by Google's Gemini AI:
- Context-aware recommendations
- Room-specific color palettes
- Style preference matching
- Fallback to curated mock data

### Texture Preservation
Advanced canvas blending algorithms:
- Multiply blending for color application
- Screen blending for brightness restoration
- Preserves original shadows and textures
- Maintains realistic appearance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for intelligent color suggestions
- [Konva.js](https://konvajs.org/) for powerful canvas manipulation
- [TailwindCSS](https://tailwindcss.com/) for beautiful styling
- [Framer Motion](https://www.framer.com/motion/) for smooth animations

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/virtual-house-painter/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/virtual-house-painter/discussions)
- **Email**: your-email@example.com

---

Made with ❤️ by [Your Name]

# Troubleshooting

## Common Issues

### 1. HTTP 500 Errors in Browser Console
- **Missing .env.local file**: If you see HTTP 500 errors, especially when using AI Suggestions, you likely have not set up your Gemini API key. See below for instructions.
- **API Key Not Set**: The AI Suggestions feature requires a valid Gemini API key. If not set, the app will use mock data, but if the fetch fails, you may see errors.
- **Network Issues**: Ensure your internet connection is stable and the Google Gemini API is accessible from your region.

### 2. Why is React used in a Next.js project?
- **Next.js is built on React**: All Next.js pages and components are React components. This is standard and expected.
- **Dynamic Component Rendering**: The use of `React.createElement` is required when rendering a component from a variable (like an icon from a tab config). This is valid in both React and Next.js.

### 3. Export/Import Issues
- All components in `components/` use `export default` and are imported as default imports. If you see an error about a component being undefined, check for typos or missing files.

### 4. Setting up .env.local
- Create a `.env.local` file in the project root:
  ```
  NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
  ```
- If you do not have an API key, the app will use mock data for AI Suggestions, but you may see warnings or errors if the fetch fails.