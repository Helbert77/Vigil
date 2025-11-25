# Technical Setup Guide
# Odigo Unified Messenger

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Backend Setup (Supabase)](#backend-setup-supabase)
4. [Frontend Setup (React + TypeScript)](#frontend-setup-react--typescript)
5. [Environment Variables](#environment-variables)
6. [Database Schema](#database-schema)
7. [Deployment](#deployment)

---

## 1. Prerequisites

### Required Software

- **Node.js**: v18+ (LTS recommended)
- **npm** or **yarn**: Latest version
- **Git**: Latest version
- **Supabase Account**: Free tier available at [supabase.com](https://supabase.com)
- **Code Editor**: VS Code recommended

### Optional Tools

- **Supabase CLI**: For local development
- **Postman**: For API testing
- **Docker**: For local Supabase instance (optional)

---

## 2. Project Structure

```
odigo-unified/
├── frontend/                    # React + TypeScript
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/        # Buttons, Inputs, etc.
│   │   │   ├── chat/          # Chat-related components
│   │   │   ├── radar/         # Radar view components
│   │   │   └── layout/        # Layout components
│   │   ├── pages/             # Page components
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Main.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API services
│   │   │   ├── supabase.ts
│   │   │   ├── auth.ts
│   │   │   ├── chat.ts
│   │   │   └── encryption.ts
│   │   ├── store/             # State management (Zustand)
│   │   │   ├── authStore.ts
│   │   │   ├── chatStore.ts
│   │   │   └── uiStore.ts
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── styles/            # Global styles
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                     # Supabase configuration
│   ├── supabase/
│   │   ├── migrations/         # Database migrations
│   │   │   └── 001_initial_schema.sql
│   │   ├── functions/          # Edge Functions
│   │   │   ├── get-radar-users/
│   │   │   └── send-notification/
│   │   └── config.toml
│   ├── scripts/               # Utility scripts
│   │   └── seed-data.sql
│   └── README.md
│
├── docs/                       # Documentation
│   ├── PRD.md
│   ├── SETUP.md
│   └── API.md
│
├── .gitignore
├── README.md
└── package.json               # Root package.json (optional)
```

---

## 3. Backend Setup (Supabase)

### 3.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Fill in:
   - **Name**: odigo-unified
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
6. Click "Create new project"
7. Wait 2-3 minutes for provisioning

### 3.2 Get API Keys

1. In Supabase dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (for client-side)
   - **service_role key**: `eyJhbG...` (for server-side, keep secret!)

### 3.3 Database Setup

#### Option A: Using Supabase SQL Editor

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Paste the migration SQL (see below)
4. Click "Run"

#### Option B: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 3.4 Enable Realtime

1. Go to **Database** > **Replication**
2. Enable realtime for tables:
   - `room_messages`
   - `private_messages`
   - `user_presence`
   - `buddies`

### 3.5 Storage Setup

1. Go to **Storage**
2. Create new bucket: `avatars`
3. Set to **Public**
4. Add policy:
```sql
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );
```

---

## 4. Frontend Setup (React + TypeScript)

### 4.1 Create React App with Vite

```bash
# Navigate to project root
cd odigo-unified

# Create frontend with Vite
npm create vite@latest frontend -- --template react-ts

# Navigate to frontend
cd frontend

# Install dependencies
npm install
```

### 4.2 Install Required Packages

```bash
# Supabase client
npm install @supabase/supabase-js

# State management
npm install zustand

# Routing
npm install react-router-dom

# Forms
npm install react-hook-form zod @hookform/resolvers

# UI/Styling
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Encryption
npm install tweetnacl tweetnacl-util

# Date/Time
npm install date-fns

# Icons (optional)
npm install lucide-react

# Dev dependencies
npm install -D @types/node
```

### 4.3 Configure Tailwind CSS

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'odigo-blue': '#0066cc',
        'odigo-lightblue': '#3399ff',
        'odigo-orange': '#ff6600',
        'odigo-yellow': '#ffcc00',
        'odigo-green': '#00cc66',
        'odigo-red': '#ff3366',
        'odigo-purple': '#8338ec',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### 4.4 Configure TypeScript

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 4.5 Configure Vite

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
})
```

---

## 5. Environment Variables

### 5.1 Frontend Environment

Create `.env.local` in `/frontend`:

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Config
VITE_APP_NAME=Odigo Unified
VITE_APP_URL=http://localhost:3000

# Feature Flags
VITE_ENABLE_E2EE=true
VITE_ENABLE_RADAR=true
```

### 5.2 Backend Environment (Supabase Functions)

Create `.env` in `/backend/supabase/functions`:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 6. Database Schema

See the complete SQL migration in `/backend/supabase/migrations/001_initial_schema.sql`

Key points:
- All tables have Row Level Security (RLS) enabled
- Indexes on foreign keys and frequently queried columns
- Triggers for updated_at timestamps
- Functions for user search and matching

---

## 7. Deployment

### 7.1 Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Follow prompts
# Set environment variables in Vercel dashboard
```

### 7.2 Backend (Supabase)

Backend is already hosted on Supabase! No additional deployment needed.

For Edge Functions:
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy get-radar-users
```

---

## 8. Development Workflow

### 8.1 Start Development Servers

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

**Terminal 2 - Supabase (local, optional):**
```bash
supabase start
# Supabase runs on http://localhost:54321
```

### 8.2 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests (Playwright)
npm run test:e2e
```

### 8.3 Build for Production

```bash
cd frontend
npm run build

# Preview production build
npm run preview
```

---

## 9. Common Issues & Solutions

### Issue: CORS errors

**Solution:** Configure CORS in Supabase dashboard under Authentication > URL Configuration

### Issue: Realtime not working

**Solution:** Check that Realtime is enabled for the table in Database > Replication

### Issue: RLS policies blocking queries

**Solution:** Verify policies in Database > Policies, test with service_role key

### Issue: Large bundle size

**Solution:** Use code splitting, lazy loading, and tree shaking

---

## 10. Next Steps

1. ✅ Set up Supabase project
2. ✅ Create database schema
3. ✅ Set up frontend project
4. ✅ Configure environment variables
5. ⬜ Implement authentication
6. ⬜ Build chat functionality
7. ⬜ Implement radar view
8. ⬜ Add E2E encryption
9. ⬜ Test thoroughly
10. ⬜ Deploy to production

---

## 11. Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite**: https://vitejs.dev

---

**Happy Coding! 🚀**
