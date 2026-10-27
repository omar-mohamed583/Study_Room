# Study Planner Frontend - Project Analysis

## Overview
This is a **Study Planner Frontend** built with React Router v8 in Framework mode (SPA-like with SSR disabled). It provides a comprehensive study management interface for tracking tasks, subjects, exams, study sessions, and focus time.

- **Framework**: React Router 8 (framework mode)
- **SSR**: Disabled (`ssr: false` in `react-router.config.ts`)
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4, with component libraries (HeroUI v3, Base UI, Radix-style components)
- **State Management**: TanStack Query (React Query) for server state
- **Authentication**: JWT-based auth with refresh tokens (cookies)
- **Backend**: Strapi CMS at `http://localhost:1337/api` (REST API)

## Project Structure

```
app/
├── api/                    # API utilities (api.ts, getEvents.ts)
├── assets/                 # Static assets (logos, images)
├── auth/                   # Auth/session management (session.ts)
├── components/
│   ├── layout/            # Layout components (Header, Footer, Main)
│   ├── providers/         # Context providers (Auth, Theme, StudyData)
│   ├── ui/                # UI components
│   └── ...
├── context/               # React contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utilities
├── pages/                 # Route pages (login, tasks, subjects, calendar, focus timer/mode, 404)
├── types/                 # TypeScript types
├── utils/                 # Utility functions
├── app.css               # Global styles
├── root.tsx              # App root with providers
└── routes.ts             # Route configuration
```

## Key Features

### Authentication
- **Login/Register** via Strapi's local auth (`/auth/local`, `/auth/local/register`)
- **Password Reset** with OTP flow (`/password-otp/send`, `/password-otp/verify`, `/password-otp/reset-password`)
- **Session Management**: Access token stored in memory, refresh token via httpOnly cookie
- **Auto-refresh**: On 401, automatically attempts token refresh
- **Protected Routes**: Main dashboard requires authentication via `clientMiddleware` in Main.tsx

### Dashboard (Home - `/`)
The main dashboard (`app/components/layout/Main.tsx`) displays:
- **Today's Tasks** - Tasks due today (incomplete), limited to 4 with "See more" link
- **Upcoming Deadlines** - Exams and tasks with upcoming due dates
- **Welcome Section** - Personalized greeting based on time of day with quick action buttons
- **Focus Timer** - Mini focus timer widget
- **Subjects** - Overview of subjects with their tasks
- **Statistics (Pie Chart)** - Time spent per subject (using @nivo/pie)
- **Progress** - Completion percentages per subject

Quick actions from dashboard: Start new task, Set new exam, Create new subject, See calendar, See progress.

### Routes
| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `components/layout/Main.tsx` | Dashboard/Home (protected) |
| `/login` | `pages/login.tsx` | Authentication |
| `/login/forget-password` | `pages/forgetPass.tsx` | Password recovery |
| `/tasks/:id?` | `pages/tasks.tsx` | Task management |
| `/subject/:id?` | `pages/subjects.tsx` | Subject management |
| `/focus-timer` | `pages/focusTimer.tsx` | Focus timer page |
| `/focus-mode` | `pages/focusMode.tsx` | Focus mode |
| `/calendar` | `pages/calendar.tsx` | Calendar view |
| `*` | `pages/404.tsx` | Not found |

### Data Model (from API endpoints)
The app fetches the following resources from Strapi:
- **Tasks** (`/tasks?populate=*`) - User tasks with due dates, completion status, subjects
- **Subjects** (`/subjects?populate=*`) - Study subjects
- **Exams** (`/exams?populate=*`) - Exams with dates
- **Study Sessions** (`/study-sessions?populate=*`) - Logged study time
- **Calendars** (`/calendars?populate=*`) - Calendar data

All managed through `StudyDataProvider` using TanStack Query via `useGetEvents` hook.

## Tech Stack Details

### Dependencies
- **UI/Animation**: framer-motion, gsap, motion, @gsap/react
- **Components**: @heroui/react v3, @base-ui/react, react-aria-components
- **Icons**: lucide-react, @hugeicons/react, @untitledui/icons
- **Charts**: @nivo/pie
- **Calendar**: @dayflow/core, @dayflow/react, @dayflow/plugin-drag
- **Date/Time**: @internationalized/date, react-aria
- **Utils**: tailwind-merge, class-variance-authority, cn

### Configuration
- **TypeScript**: Strict mode, path alias `~/*` → `./app/*`
- **Vite**: React Router plugin + Tailwind CSS v4 plugin
- **Fonts**: Outfit (Google Fonts), Geist Variable

## Authentication Flow
1. On app load, `AuthProvider` calls `ensureSession()` to try refreshing token from cookie
2. If token exists, fetches user via `GET /users/me`
3. `Main.tsx` has `clientMiddleware` that checks session - redirects to `/login` if not authenticated
4. Login/register update token and cache user in React Query
5. API calls automatically attach token and retry on 401

## Project Goal
This appears to be a **student study planning application** designed to help users:
- Organize tasks and assignments with due dates
- Track subjects and associate tasks with them
- Monitor upcoming exams/deadlines
- Use focus timer/Pomodoro-style functionality for study sessions
- Visualize study time distribution across subjects
- Track progress on task completion per subject
- Manage study schedule via calendar

The app is a frontend for a Strapi backend (study planner API) with full CRUD capabilities for tasks, subjects, exams, and study sessions.
