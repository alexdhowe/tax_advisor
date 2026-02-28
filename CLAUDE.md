# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server (Turbopack) at localhost:3000

# Production build
npm run build        # Build for production (outputs standalone bundle)
npm start            # Start production server

# Database
npx prisma generate              # Regenerate Prisma client after schema changes
npx prisma db push               # Push schema changes to DB (used in production deploys)
npx prisma migrate dev --name X  # Create a migration file for schema changes
npx prisma studio                # Open Prisma GUI (requires DATABASE_URL)
```

No test suite is configured. TypeScript type-checking: `npx tsc --noEmit` (slow — ~60s).

## Environment Variables

Required in `.env.local` for local development:
```
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
UPLOAD_DIR=./uploads              # defaults to ./uploads if unset
```

## Architecture

### Prisma 7 + pg Adapter
This project uses **Prisma 7**, which no longer accepts `url` in `schema.prisma`. The datasource URL lives exclusively in `prisma.config.ts` (for CLI operations) and is passed via the `PrismaPg` adapter at runtime (`lib/prisma.ts`). Schema changes require `prisma generate` after editing `prisma/schema.prisma`.

### Agent System (`lib/agents/`)
Four agents are defined, each as a config object with a `systemPrompt`:
- `individual.ts` — Dr. Sarah Chen, individual tax (1040, cap gains, AMT, QBI, estate)
- `corporate.ts` — Michael Torres, C-corp (GILTI/BEAT/FDII, M&A, NOLs, §174)
- `partnership.ts` — Jennifer Walsh, Subchapter K (§704, §751, §754, S-corps, PTET)
- `orchestrator.ts` — Lead Partner, routes to specialists via Claude tool_use, synthesizes

The **Orchestrator** is architecturally different from the three specialists: it makes 2 sequential Claude API calls. First call uses `tool_choice: { type: 'auto' }` with three tools (`call_individual_expert`, `call_corporate_expert`, `call_partnership_expert`). The tool results trigger real Claude calls to the specialist agents in parallel via `callSpecialist()`. The second orchestrator call synthesizes all responses. This costs ~4 Claude API calls per orchestrator request.

### Chat API (`app/api/chat/route.ts`)
All streaming uses a custom `ReadableStream` emitting newline-delimited JSON, **not** Vercel AI SDK's `toDataStreamResponse`. The frontend reads it with a raw `ReadableStream` reader in `ChatWindow`. Event types: `text`, `orchestrator_thinking`, `specialist_called`, `specialist_detail`, `done`, `error`.

Each chat request assembles a system prompt = agent system prompt + matter/client context + extracted document text (capped at 8K chars/doc, 40K total). Last 50 messages of conversation history are included.

### Document Pipeline
Upload → `app/api/upload/route.ts` → saved to `UPLOAD_DIR` with UUID filename → text extracted via `lib/documents.ts` (`pdf-parse` for PDFs, `xlsx` for spreadsheets) → stored in `Document.extractedText`. `pdf-parse` and `xlsx` are in `serverExternalPackages` in `next.config.ts` to prevent bundling issues.

**Scanned PDFs** (image-based) produce no extracted text — the app surfaces a note to the user in the extracted text field.

### Data Model
`Client → Matter → Message[]` and `Matter → Document[]`. All cascade-delete from Client. No auth — `Message.authorName` is a plain string from `localStorage`. Conversation history is shared across all team members per matter. Polling (`setInterval`, 10s) in `ChatWindow` provides multi-user awareness.

### UI Conventions
- **Tailwind v4** with CSS-first config (`app/globals.css` — no `tailwind.config.ts`)
- shadcn/ui components in `components/ui/`; custom components in `components/{agents,chat,clients,matters,documents}/`
- Agent color scheme: Individual=blue, Corporate=emerald, Partnership=violet, Orchestrator=amber
- The layout (`app/layout.tsx`) is a `'use client'` component (needed for `usePathname` active link state). Metadata is set via `<head>` tags directly rather than the Next.js `metadata` export.
- Chat markdown rendered via `react-markdown` with custom `.chat-prose` CSS class (defined in `globals.css`, not Tailwind `prose`)

### Deployment (Render)
Build command: `npm install && npx prisma generate && npx prisma db push && npm run build`
Start command: `node .next/standalone/server.js`
Persistent disk mounted at `/opt/render/project/src/uploads` for file storage.
