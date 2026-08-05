# Recruiter AI v0.1 — Design & Architecture

## Design Approach: Emerald AI

This project follows the explicit "Emerald AI" design specification provided by the user.
The design is treated as a ground-truth reference — no alternative approaches are considered.

### Design Movement
Clean, professional B2B SaaS with emerald-green AI accents. Light, spacious, minimal.

### Core Principles
1. **Light & Spacious** — White/light-green backgrounds, generous whitespace, no dark themes
2. **Emerald AI Identity** — #10B981 as the signature brand color for all AI-related actions
3. **Professional Clarity** — Structured layouts, clear hierarchy, readable typography
4. **Human-in-the-Loop** — AI assists but never decides; always show HR decision points

### Color Philosophy
- Primary emerald (#10B981) = growth, efficiency, trust, AI progress
- Secondary emerald (#34D399) = hover states, soft gradients, secondary indicators
- Limited blue (#3B82F6) = informational, links, HR-decision elements
- Warm neutrals for text hierarchy (#1E293B → #64748B → #94A3B8)
- Light backgrounds (#F8FAFC app, #F0F7F2 sections, #FFFFFF cards, #ECFDF5 highlights)

### Layout Paradigm
- Fixed left sidebar navigation (240px)
- Sticky top header bar
- Main content area with max-width constraint
- Card-based content organization with consistent 24-32px padding
- Desktop-first (1280-1440px primary)

### Signature Elements
1. AI Activity Stepper — animated green progress indicators showing agent work stages
2. Emerald gradient cards — subtle #34D399→#10B981 gradients on key metrics
3. Status badge system — consistent rounded pills with color coding per spec

### Typography System
- Font: Inter (with Manrope for display headings)
- Page titles: 24-28px semibold/bold
- Card titles: 16-18px medium/semibold
- Body: 14px regular
- Metrics: 28-36px bold
- Captions: 12-13px muted

### Brand Essence
AI recruitment automation platform for Russian B2B market — efficient, trustworthy, human-centered.
Personality: Professional, Efficient, Trustworthy.

### Brand Voice
Headlines sound confident and action-oriented in Russian:
- "Recruiter AI анализирует кандидатов — вы принимаете решения"
- "Автономный подбор. Контроль за вами."

### Signature Brand Color
Emerald Green #10B981 — unmistakably this brand's color.

---

## Architecture Plan

### Tech Stack
- React 19 + TypeScript (strict)
- Tailwind CSS 4
- Wouter (client routing)
- Recharts (charts)
- Lucide React (icons)
- Framer Motion (animations)
- localStorage for demo persistence
- shadcn/ui components as base

### Route Structure
```
/                    → redirect to /dashboard
/dashboard           → Overview page
/vacancies           → Vacancies list
/vacancies/new       → Create vacancy (multi-step form)
/vacancies/:id       → Vacancy detail
/candidates          → Candidates list
/candidates/:id      → Candidate card (tabbed)
/interviews          → AI Interviews list
/ai-activity         → AI Activity feed
/analytics           → Analytics dashboard
/integrations        → Integrations cards
/settings            → Settings page
```

### Component Structure
```
components/
  layout/           → AppLayout, Sidebar, TopBar
  dashboard/        → StatCard, AIControlCenter, FunnelWidget, RecentActivity
  vacancies/        → VacancyCard, VacancyForm, AILaunchAnimation
  candidates/       → CandidateRow, CandidateFilters, StatusBadge
  interviews/       → InterviewCard, InterviewDetail, QABlock
  activity/         → ActivityFeed, ActivityItem
  analytics/        → ChartCard, FunnelChart, MetricCard
  integrations/     → IntegrationCard
  ui/               → (shadcn/ui base components)
```

### Data Layer
```
data/
  vacancies.ts      → 3+ vacancies with full detail
  candidates.ts     → 12+ candidates linked to vacancies
  interviews.ts     → 5+ interviews linked to candidates
  activities.ts     → 25+ AI activity events
  analytics.ts      → Chart data, metrics
  integrations.ts   → 7 integration cards
  messages.ts       → Demo chat messages per candidate
  company.ts        → Demo company & user profile
```

### Types
```
types/
  index.ts          → All TypeScript interfaces exported from one barrel file
```

### Utilities
```
lib/
  storage.ts        → localStorage wrapper for demo persistence
  formatters.ts     → Date, salary, status formatting
  status-config.ts  → Centralized status labels, colors, icons
```

### State Management
- React Context for global app state (vacancies, candidates)
- localStorage persistence for user-created vacancies and status changes
- No external state library needed for demo scope
