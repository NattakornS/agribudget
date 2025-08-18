# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` or `pnpm dev`
- **Build for production**: `npm run build` or `pnpm build`
- **Lint code**: `npm run lint` or `pnpm lint`
- **Preview production build**: `npm run preview` or `pnpm preview`

The project uses pnpm as the package manager (evidenced by pnpm-lock.yaml).

## Project Architecture

This is an agricultural budget management application built with React, TypeScript, Vite, and Supabase. The app helps farmers track income, expenses, crops, and fertilizer planning.

### Tech Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite with SWC for fast refresh
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth with email/password
- **Styling**: TailwindCSS v4 with custom utilities
- **Forms**: React Hook Form with Zod validation
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **Routing**: React Router DOM v7

### Application Structure

#### Authentication Flow
- Unauthenticated users are redirected to `/login`
- Protected routes require authentication via `ProtectedRoute` component
- AuthContext provides session state and auth methods throughout the app

#### Layout & Navigation
- **Desktop**: Sidebar navigation (`Sidebar` component)
- **Mobile**: Bottom navigation (`BottomNav` component)  
- **Layout**: Responsive design with `Layout` component managing both navigation types

#### Core Pages & Features
- **Dashboard** (`/`): Overview with charts and summaries
- **Income** (`/income`): Track farm income by crop and category
- **Expenses** (`/expenses`): Track farm expenses by crop and category  
- **Fertilizer Planner** (`/planner`): Plan and track fertilizer applications
- **Settings** (`/settings`): User preferences and configuration

### Database Schema

The app uses Supabase with these main entities:

#### Core Tables
- **crops**: Farm crops with location, area, amount, and planting dates
- **categories**: Income/expense categories (user-defined)
- **expenses**: Expense records linked to crops and categories
- **income**: Income records with sub-totals, linked to crops and categories
- **fertilizer_plans**: Fertilizer application plans with status tracking

#### Key Relationships
- All tables have `user_id` for multi-tenant data isolation
- Many-to-many relationships between income and expenses (linked expenses)
- Many-to-many relationships between fertilizer plans and expenses
- Categories are shared between income and expenses via `type` field

### Service Layer Architecture

Services in `src/services/` handle all Supabase operations:

- **Authentication**: Handled in AuthContext and services check session validity
- **CRUD Operations**: Each service provides get, create, update, delete methods
- **Category Management**: `findOrCreateCategory()` automatically handles category creation
- **Data Relationships**: Services handle joins and related data fetching
- **Error Handling**: Services throw errors that components can handle

### Component Patterns

#### Reusable Components
- **EditModal**: Generic modal for create/edit operations
- **FloatingActionButton**: Add new records
- **RecordList**: Display lists of records with edit/delete actions

#### Form Handling
- React Hook Form with Zod schemas for validation
- Form data types separate from database types (e.g., `ExpenseFormData` vs `Expense`)
- Category handling: forms use category names, services handle ID resolution

### Development Patterns

#### Path Aliases
- `@/` maps to `./src/` for clean imports
- Configured in both Vite and TypeScript

#### Environment Variables
Required in `.env` file:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

#### Type Safety
- Strict TypeScript configuration
- Separate types for database entities and form data
- Optional fields properly handled with null/undefined

#### State Management
- React Context for authentication state
- Local component state for UI interactions
- Supabase real-time subscriptions where needed

## Code Conventions

- Components use default exports
- Services use named exports
- Async/await pattern for database operations
- Error boundaries and proper error handling
- Responsive design with Tailwind classes
- Semantic HTML and accessibility considerations