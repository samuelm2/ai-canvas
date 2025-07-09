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
- **AI Integration**: FAI API (Fal.ai) and OpenAI API
- **Database**: PostgreSQL
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (required for saving/loading canvas documents)
- FAI API key (get one from [fal.ai](https://fal.ai/))
- OpenAI API key (get one from [OpenAI](https://platform.openai.com/))

### Installation

1. Clone the repository:
```bash
git clone https://github.com/samuelm2/ai-canvas/
cd ai-canvas
```

2. Install dependencies:
```bash
npm install
```

3. Set up your PostgreSQL database:
   - Create a new PostgreSQL database for the application
   - Note down your database connection string

4. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
# Required for saving and loading canvas documents
DATABASE_URL=your_postgres_url_here

# FAI API key for image generation (get from https://fal.ai/)
FAI_API_KEY=your_fai_api_key_here

# OpenAI API key for prompt variations (get from https://platform.openai.com/)
OPENAI_API_KEY=your_openai_api_key_here
```

Replace the placeholder values with your actual credentials:
- `DATABASE_URL`: Your PostgreSQL connection string
- `FAI_API_KEY`: Your FAI API key for image generation
- `OPENAI_API_KEY`: Your OpenAI API key for prompt variations

5. Run the development server:
```bash
npx next dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

The application requires a PostgreSQL database for the saving functionality. Without a database:
- You can still generate and arrange images
- Document saving and loading features will not work
- You'll see errors when trying to save canvases

Make sure to set up your PostgreSQL database and configure the `DATABASE_URL` environment variable before using the save/load features.

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
- **Demo Mode**: Automatically enabled when no API keys are present (uses random placeholder images from Lorem Picsum)

## Security

This application uses **secure server-side API routes** to protect your API keys:

### 🔒 Security Benefits

- **API keys are server-side only** - Never exposed to client
- **API routes handle external calls** - Client never sees external APIs
- **Request validation** - Server validates all inputs
- **Error handling** - Graceful fallbacks without exposing internals
- **Database security** - Connection strings never exposed to client

### 🛡️ API Routes

- `/api/generate-image` - Secure image generation
- `/api/generate-variations` - Secure prompt variations
- `/api/documents` - Secure document saving/loading

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
