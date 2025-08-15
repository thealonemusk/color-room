# Virtual House Painter

A Next.js application that allows users to upload room photos, create masks, and experiment with AI-powered color suggestions using the Gemini API.

## Features

- 📸 **Image Upload**: Drag and drop or click to upload room photos
- 🎨 **Mask Creation**: Create precise masks around walls and areas to recolor
- 🎨 **Color Picker**: Choose custom colors and save your favorites
- 🤖 **AI Suggestions**: Get AI-powered color palette suggestions (requires Gemini API key)
- 🔄 **Before/After Comparison**: Compare original and recolored images with a slider
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd color-room
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:
```bash
# Gemini API Configuration (optional)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Configuration

To use AI color suggestions, you'll need a Gemini API key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
```

Without an API key, the app will use mock color palettes.

## Usage

1. **Upload Images**: Use the Upload tab to add room photos
2. **Create Masks**: Switch to the Mask tab and draw around areas you want to recolor
3. **Choose Colors**: Use the Color tab to pick colors or get AI suggestions
4. **Compare Results**: Use the Compare tab to see before/after results
5. **Export**: Download your recolored images

## Troubleshooting

### Common Issues

**500 Server Error**: 
- Make sure all dependencies are installed: `npm install`
- Check that you're using Node.js 16+
- Clear browser cache and restart the dev server

**Import Errors**:
- The app uses React 18 and Next.js 13
- Make sure all dependencies are compatible
- Check that `react-konva` is properly installed

**Canvas Issues**:
- The app uses browser canvas APIs
- Make sure you're running in a modern browser
- Check that JavaScript is enabled

**AI Suggestions Not Working**:
- Verify your Gemini API key is correct
- Check the browser console for API errors
- Without an API key, mock data will be used

### Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- **Framework**: Next.js 13
- **UI Library**: React 18
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Canvas**: React Konva
- **Icons**: React Icons
- **AI**: Google Gemini API

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

If you encounter any issues, please:
1. Check the troubleshooting section above
2. Search existing issues
3. Create a new issue with detailed information