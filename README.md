# AI Image Canvas

An interactive AI-powered image canvas where you can generate images using text prompts and arrange them by dragging or organizing them in a grid layout.

## Features

- 🎨 **AI Image Generation**: Generate images from text prompts using FAI API
- 🖱️ **Drag & Drop**: Freely drag images anywhere on the canvas
- 📐 **Grid Organization**: Automatically organize images in a neat grid layout
- 🗑️ **Image Management**: Delete individual images or clear the entire canvas
- 💾 **Document Saving**: Save and load your canvas creations with shareable URLs
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Real-time Updates**: See your changes instantly

## Tech Stack

- **Frontend**: React 19, Next.js 15.3.5, TypeScript
- **Styling**: Tailwind CSS
- **Drag & Drop**: react-draggable
- **AI Integration**: FAI API (Fal.ai)
- **Database**: PostgreSQL
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- FAI API key (get one from [fal.ai](https://fal.ai/))
- OpenAI api key

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-canvas
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local and add your configuration
DATABASE_URL=<your postgresql database>
FAI_API_KEY=your_fai_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Generate Images**: Enter a text prompt in the input field and click "Generate"
2. **Drag Images**: Click and drag any image to move it around the canvas
3. **Organize Grid**: Click "Organize Grid" to arrange all images in a neat grid layout
4. **Delete Images**: Hover over an image and click the × button to delete it
5. **Save Documents**: Click "Save" to save your canvas and get a shareable URL
6. **Load Documents**: Open shared URLs to load saved canvases
7. **Clear Canvas**: Click "Clear All" to remove all images from the canvas

## API Configuration

The app uses secure server-side API routes and automatically detects your configuration:

- **Real AI Generation**: Add your `FAI_API_KEY` to your environment for image generation
- **Prompt Variations**: Add your `OPENAI_API_KEY` for AI-powered prompt suggestions
- **Document Storage**: Add your `DATABASE_URL` for saving and loading canvases
- **Demo Mode**: Automatically enabled when no API keys are present (uses placeholder images)

No configuration needed to get started - the app works out of the box in demo mode! All API keys are secure on the server and never exposed to the client.

## Deploy on Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add your environment variables in the Vercel dashboard:
   - `DATABASE_URL` - Your PostgreSQL database connection string
   - `FAI_API_KEY` - Your FAI API key for image generation
   - `OPENAI_API_KEY` - Your OpenAI API key for prompt variations
4. Deploy!

The app is optimized for Vercel deployment and will work out of the box.

## Contributing

Feel free to submit issues and pull requests to improve the application!

## License

This project is open source and available under the [MIT License](LICENSE).
