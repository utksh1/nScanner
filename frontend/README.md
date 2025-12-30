# nScanner Next.js Implementation

This is a clean Next.js conversion of the original React + Vite nScanner application.

## Installation

1. Install dependencies:
```bash
cd nextjs
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Changes from Original

### Architecture
- **Framework**: Migrated from Vite + React to Next.js 14 with App Router
- **Routing**: React Router → Next.js App Router
- **API Integration**: Maintained same backend API endpoints
- **Styling**: Preserved Tailwind CSS configuration

### File Structure
```
nextjs/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page (was Landing.tsx)
│   ├── layout.tsx         # Root layout
│   ├── template.tsx       # Layout with Navbar
│   ├── dashboard/         # Dashboard page
│   ├── history/           # History page
│   └── results/           # Results page
├── components/            # Reusable components
│   ├── Navbar.tsx         # Navigation (converted for Next.js)
│   └── AnimatedGrid.tsx  # Background animation
├── lib/                   # Utilities
│   └── api.ts            # API client (same functionality)
├── types/                 # TypeScript types
│   └── index.ts          # API interfaces
└── package.json          # Dependencies
```

### Next.js Specific Changes
- **Navigation**: `react-router-dom` → `next/link` and `next/navigation`
- **Client Components**: Added `'use client'` directive where needed
- **Layout System**: Implemented Next.js layout and template pattern
- **API Proxy**: Configured in `next.config.js` for backend API

### Preserved Features
- ✅ All original UI components and styling
- ✅ API integration with backend
- ✅ Animations and interactions
- ✅ TypeScript type safety
- ✅ Tailwind CSS styling
- ✅ Responsive design

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Backend Compatibility

This frontend is designed to work with the existing FastAPI backend. Ensure the backend is running on `http://localhost:8000` before starting the frontend.

## Deployment

The Next.js version can be deployed on any platform that supports Next.js:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Railway
- Digital Ocean App Platform

## Migration Notes

1. **No Backend Changes**: The backend API remains unchanged
2. **Same Features**: All original functionality preserved
3. **Better SEO**: Next.js provides better server-side rendering
4. **Improved Performance**: Next.js optimizations built-in
5. **Easier Deployment**: Simplified deployment process
