# Security Implementation

## ✅ Secure API Key Management

This application now uses **secure server-side API routes** to protect your API keys:

### Environment Variables

Create a `.env.local` file in your project root with:

```env
# Database connection (required for saving/loading documents)
DATABASE_URL=<setup a connection to a postgresql database. I used neon.>

# FAI API Key (for image generation)
FAI_API_KEY=your_fai_api_key_here

# OpenAI API Key (for prompt variations) 
OPENAI_API_KEY=your_openai_api_key_here

# Demo mode is now automatic - no configuration needed
```

### 🔒 Security Benefits

- **API keys are server-side only** - Never exposed to client
- **No `NEXT_PUBLIC_` prefix** - Keys stay secure on backend
- **API routes handle external calls** - Client never sees external APIs
- **Request validation** - Server validates all inputs
- **Error handling** - Graceful fallbacks without exposing internals
- **Database security** - Connection strings never exposed to client

### 🛡️ API Routes

- `/api/generate-image` - Secure image generation
- `/api/generate-variations` - Secure prompt variations
- `/api/documents` - Secure document saving/loading







### 🗄️ Database Setup

The application requires a PostgreSQL database for saving and loading documents:
- Set `DATABASE_URL` environment variable with your database connection string
- The application will automatically create the required tables on first run
- Database errors are sanitized before being sent to the client 