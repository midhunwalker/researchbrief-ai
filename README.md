# ResearchBrief

ResearchBrief is a Next.js 14 web application that generates structured research briefs from multiple URLs. Users input URLs, and the application produces a comprehensive brief containing a summary, key findings with credibility ratings, conflicting claims, verification checklist, and source citations.

The application supports both real LLM integration (OpenAI) and mock mode for offline development and testing. Users can save briefs locally and view recent briefs. A status dashboard displays backend, database, and LLM health.

This project demonstrates modern full-stack development with TypeScript, server-side API routes, client-side React components, and structured LLM output validation using Zod schemas.

## Features Implemented

### Core Functionality
- **URL Input & Validation**: Accept multiple URLs with HTTP/HTTPS validation
- **Research Brief Generation**: Create structured briefs with summary, key points, conflicts, verification items, and sources
- **Local Persistence**: Save and retrieve briefs using file-based storage (`.data/briefs.json`)
- **Recent Briefs**: Display last 5 saved briefs on homepage
- **Brief Detail View**: Full brief display with all sections and interactive elements
- **Status Dashboard**: Monitor backend, database, and LLM health with auto-refresh

### LLM Integration
- **Mock Mode**: Works without API key using deterministic mock data
- **OpenAI Ready**: Structured to integrate OpenAI API with provided key
- **Schema Validation**: All outputs validated against Zod schemas

### UI/UX
- **Responsive Design**: Mobile, tablet, and desktop layouts
- **Accessibility**: ARIA labels, keyboard navigation, semantic HTML
- **Interactive Checklist**: Mark verification items as checked
- **Copy to Clipboard**: Copy summary text with visual feedback
- **Loading States**: Progress indicators during generation

## Tech Stack

- **Framework**: Next.js 14.1.0 (App Router + Pages API)
- **Language**: TypeScript 5.3.3 (strict mode)
- **Styling**: Tailwind CSS 3.4.1
- **Validation**: Zod 3.22.4
- **Runtime**: Node.js 18+
- **Persistence**: File system (JSON)
- **LLM**: OpenAI API (optional)

## How to Run Locally

### Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager

### Installation

```bash
# Navigate to project directory
cd next-app

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Environment Variables

The `.env.local` file should contain:

```bash
# Optional - leave blank to use mock data
OPENAI_API_KEY=

# Optional - defaults to 3000
PORT=3000

# Optional - defaults to development
NODE_ENV=development
```

### Running the Application

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

Open http://localhost:3000 in your browser.

## Mock Mode

The application works fully **without** an OpenAI API key. When `OPENAI_API_KEY` is blank or not set:

1. The `/api/generate` endpoint uses `generateMockBrief()` from `lib/mockBrief.ts`
2. Mock briefs contain realistic data matching the Zod schema
3. All UI features work identically (save, view, status)
4. Perfect for development, testing, and demonstrations

To enable real LLM integration:
1. Get an API key from https://platform.openai.com/api-keys
2. Add `OPENAI_API_KEY=sk-...` to `.env.local`
3. Uncomment OpenAI API call in `pages/api/generate.ts`
4. Restart the server

## How to Deploy (Vercel)

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 2: GitHub Integration

1. Push code to GitHub repository
2. Connect repository to Vercel dashboard
3. Configure environment variables in Vercel project settings
4. Deploy automatically on push

### Environment Variables on Vercel

Add in project settings:
- `OPENAI_API_KEY` (your API key)
- `NODE_ENV=production`

## What Is Implemented

✅ **Home Page**: URL input with validation, example URLs, generate button  
✅ **Brief Generation**: POST `/api/generate` with mock/real LLM support  
✅ **Brief Detail Page**: Display all sections (summary, key points, conflicts, verify, sources)  
✅ **Save Functionality**: PUT `/api/briefs` to mark briefs as saved  
✅ **Recent Briefs**: GET `/api/briefs` returns last 5 saved briefs  
✅ **Status Page**: GET `/api/status` checks backend/database/LLM health  
✅ **Persistence**: File-based storage in `.data/briefs.json`  
✅ **Validation**: Zod schemas for all data structures  
✅ **Responsive UI**: Mobile-first design with Tailwind CSS  
✅ **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation  
✅ **Type Safety**: Full TypeScript coverage with strict mode  

## What Is Intentionally Not Implemented

❌ **Authentication**: No user accounts or login system  
❌ **Database**: Uses file storage instead of PostgreSQL/MongoDB  
❌ **Real OpenAI API Calls**: Commented out (TODO) in `pages/api/generate.ts`  
❌ **PDF Export**: No export functionality  
❌ **Search**: No full-text search across briefs  
❌ **Pagination**: Shows only last 5 briefs  
❌ **Edit/Delete**: Cannot modify or remove saved briefs  
❌ **Sharing**: No brief sharing or collaboration features  

These are documented in code with TODO comments for future implementation.

## Project Structure

```
next-app/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                 # Home page (URL input)
│   ├── layout.tsx               # Root layout with navigation
│   ├── brief/[id]/page.tsx      # Brief detail page (dynamic route)
│   ├── saved/page.tsx           # Saved briefs list
│   ├── status/page.tsx          # Status dashboard
│   └── components/              # React components
│       ├── InputUrlBlock.tsx    # URL input form
│       ├── LoadingOverlay.tsx   # Generation progress indicator
│       ├── RecentBriefs.tsx     # Last 5 briefs preview
│       ├── BriefSummary.tsx     # Brief header with actions
│       ├── KeyPointsList.tsx    # Key findings display
│       ├── ConflictsList.tsx    # Conflicting claims
│       ├── VerifyChecklist.tsx  # Verification items
│       ├── SourcesPanel.tsx     # Source citations
│       └── ui/                  # Reusable UI components
│           ├── Button.tsx       # Button with variants
│           ├── Card.tsx         # Card container
│           ├── Badge.tsx        # Badge with colors
│           ├── Checkbox.tsx     # Accessible checkbox
│           ├── Textarea.tsx     # Form textarea
│           └── Spinner.tsx      # Loading spinner
├── pages/api/                   # API routes (Pages API)
│   ├── generate.ts             # POST: Generate brief
│   ├── briefs.ts               # GET/PUT: CRUD operations
│   └── status.ts               # GET: Health checks
├── lib/                         # Shared utilities
│   ├── types.ts                # Zod schemas & TypeScript types
│   ├── storage.ts              # File persistence functions
│   ├── mockBrief.ts            # Mock data generator
│   └── api.ts                  # Client API helpers
├── public/                      # Static assets
│   ├── logo.svg                # Application logo
│   └── icons/                  # SVG icons
├── .data/                       # Local data storage (gitignored)
│   └── briefs.json             # Persisted briefs
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── README.md                    # This file
├── AI_NOTES.md                  # AI usage documentation
├── PROMPTS_USED.md              # LLM prompts & schemas
├── ABOUTME.md                   # Developer information
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
└── next.config.js               # Next.js configuration
```

## API Endpoints

### `POST /api/generate`
Generate a research brief from URLs.

**Request**:
```json
{
  "urls": ["https://example.com/article1", "https://example.com/article2"]
}
```

**Response**: Brief object (see `lib/types.ts`)

### `GET /api/briefs`
Retrieve saved briefs (last 5).

**Response**: Array of Brief objects

### `PUT /api/briefs`
Mark a brief as saved.

**Request**:
```json
{
  "id": "brief-uuid"
}
```

### `GET /api/status`
Check system health.

**Response**:
```json
{
  "backend": {"status": "ok", "message": "..."},
  "database": {"status": "ok", "message": "..."},
  "llm": {"status": "warning", "message": "..."}
}
```

## Documentation

- **README.md**: This file (setup and overview)
- **AI_NOTES.md**: AI tools used and manual verification
- **PROMPTS_USED.md**: LLM prompts and JSON schema
- **ABOUTME.md**: Developer information

## License

This project is for educational purposes.

## Deployment

### Vercel

```bash
vercel
```

Or push to GitHub and connect your repo to Vercel for automatic deployments.

### Docker

```bash
docker build -t researchbrief .
docker run -p 3000:3000 researchbrief
```

## Project Structure

```
app/
  ├─ page.tsx              # Home page (URL input + generation)
  ├─ status/page.tsx       # Health check dashboard
  ├─ saved/page.tsx        # Saved briefs list
  ├─ brief/[id]/page.tsx   # Brief detail view
  ├─ layout.tsx            # Root layout
  └─ components/           # Reusable UI components
pages/api/
  ├─ generate.ts           # Generate new brief (LLM integration)
  └─ briefs.ts             # CRUD operations for briefs
lib/
  ├─ types.ts              # TypeScript types & Zod schemas
  ├─ api.ts                # Client-side API helpers
  └─ figmaToComponents.md  # Component mapping from Figma
public/
  ├─ icons/                # Exported SVG icons
  └─ logo.svg
.data/
  └─ briefs.json           # Local brief storage (dev only)
```

## Usage

### Generate a Brief

1. Visit [http://localhost:3000](http://localhost:3000)
2. Enter URLs (one per line) or use the "Use Example" link
3. Click "Generate Brief"
4. Wait for processing (progress indicator shows steps)
5. View, save, and export the brief

### View Saved Briefs

Visit [http://localhost:3000/saved](http://localhost:3000/saved) to see your last 5 briefs.

### Check System Status

Visit [http://localhost:3000/status](http://localhost:3000/status) to see backend/DB/LLM health.

## Key Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Static type safety
- **Tailwind CSS** - Utility-first styling
- **Zod** - Runtime schema validation
- **OpenAI API** - Optional LLM integration

## Development Notes

See **AI_NOTES.md** for which AI tools were used and manual checks performed.

See **PROMPTS_USED.md** for the LLM prompts and schema specifications.

See **ABOUTME.md** for contributor information.

## License

Private project for research and development.
