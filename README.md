# Quizora-B

Quizora-B is an interactive quiz platform where users can discover quizzes,
attempt them, review their results, and compete on live leaderboards.

## Features

### User experience

- User registration, login, logout, and Supabase Auth sessions
- Google and GitHub OAuth sign-in
- Email confirmation and Supabase authentication callback routes
- Forgot-password and reset-password flows
- Branded landing page with an intro experience and animated quiz visuals
- Quiz listing with search, category filtering, and difficulty labels
- Quiz information and instructions before starting
- Timed quiz attempts with progress tracking and countdown timer
- Answer selection, submission, and unanswered-question handling
- Results view with score, answer review, and explanations
- Per-quiz leaderboards with score and completion-time tie-breaks
- Best-attempt leaderboard standings with competition ranking for ties
- Realtime leaderboard refreshes after submitted scores change
- Profile history with aggregate and best-attempt statistics
- Responsive navigation, footer, and mobile-friendly layouts

### Database foundation

- Supabase Auth-backed user profiles with role support
- Quiz catalogue with publication state and availability windows
- Questions and ordered answer options
- Private attempts and saved answers
- Submitted scores for leaderboard rankings
- Database constraints, indexes, triggers, and Supabase Realtime setup
- Row-level security for profile, quiz, question, attempt, answer, and score data
- Answer-key protection while a quiz is in progress
- Development fixtures for upcoming, live, and finished quizzes
- Backend integration and security tests for database constraints, RLS,
  answer-key protection, attempts, scoring, ranking, and API authorization

## Tech stack

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui
- **Authentication and database:** Supabase
- **Development:** Node.js and npm

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm
- A Supabase project for local development

### Installation

```bash
git clone https://github.com/RCOEM-Google-DSC/Quizora-B.git
cd Quizora-B
npm ci
```

Create a `.env.local` file from `.env.example` and add your Supabase project
URL and public browser key:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

Never expose a Supabase service-role or secret key through a
`NEXT_PUBLIC_` variable or commit it to the repository.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase database setup

The SQL scripts in `supabase/` are intended for a development or test project.
Run them in the Supabase SQL Editor in this order:

1. `schema.sql` — tables, constraints, triggers, indexes, and Realtime setup
2. `policies.sql` — row-level security, grants, answer-key protection, `submit_quiz_attempt()`, and `get_submitted_quiz_review()`
3. `seed.sql` or `seed_10_quizzes.sql` — repeatable development fixtures (including 10 comprehensive quizzes with live, upcoming, and finished states)

The seed script creates upcoming, live, and finished quiz examples. Read
[`supabase/README.md`](./supabase/README.md) for the seed details and acceptance
checks.

## Project structure

```text
src/
├── app/
│   ├── auth/
│   │   ├── callback/     # Authentication callback route
│   │   └── confirm/      # Email confirmation route
│   ├── forgot-password/
│   │   └── page.tsx      # Password recovery page
│   ├── leaderboard/
│   │   └── page.tsx      # Leaderboard page
│   ├── login/
│   │   └── page.tsx      # Login page
│   ├── profile/
│   │   └── page.tsx      # Profile page
│   ├── quizzes/
│   │   ├── [id]/
│   │   │   ├── result/
│   │   │   │   └── page.tsx  # Quiz result page
│   │   │   └── page.tsx      # Quiz attempt page
│   │   └── page.tsx      # Quiz listing page
│   ├── register/
│   │   └── page.tsx      # Registration page
│   ├── reset-password/
│   │   └── page.tsx      # Password reset page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home / landing page
├── components/
│   ├── auth/             # Login, registration, OAuth, and password forms
│   ├── home/             # Home page components
│   ├── intro/            # Intro animations and entry experience
│   ├── landing/          # Landing page sections and visuals
│   ├── layout/           # Navbar, footer, and branding
│   ├── leaderboard/      # Leaderboard view
│   ├── profile/          # Profile view
│   ├── quiz/             # Quiz cards, attempts, timers, and results
│   └── ui/               # Reusable interface components
├── context/              # Client-side application state
├── data/                 # Development mock data
├── lib/                  # Supabase clients, middleware, and utilities
└── types/                # Shared TypeScript types

supabase/
├── schema.sql            # Core database schema
├── policies.sql          # RLS policies and grants
├── seed.sql              # Development fixtures
└── README.md             # Database setup and acceptance checks
```

## Backend API

The App Router API uses authenticated Supabase sessions and returns a
consistent `{ success, data, error }` response shape:

| Route | Purpose |
|---|---|
| `GET /api/quizzes` | List published quizzes and availability |
| `GET /api/quizzes/:id` | Load a quiz with safe question options |
| `POST /api/attempts` | Start or resume an authenticated attempt |
| `GET /api/attempts/:id` | Restore the owner's attempt state |
| `POST /api/attempts/:id/answers` | Save, update, or clear an answer |
| `POST /api/attempts/:id/submit` | Submit and score an attempt |
| `GET /api/attempts/:id/review` | Retrieve the owner's submitted review |
| `GET /api/quizzes/:id/leaderboard` | Read best-attempt standings |
| `GET /api/profile/attempts` | Read the authenticated user's history |

Attempt and profile routes enforce authenticated ownership. Answer keys and
explanations are withheld during an active attempt and are revealed only by
the submitted-review flow. The leaderboard client refreshes its API data when
Supabase Realtime reports a score change and cleans up the subscription when
the selected quiz changes.

Shared backend helpers include authenticated-user and role guards,
standardized API errors, response wrappers, shared attempt/result types, and
the backend integration contract suite.

## Useful commands

```bash
npm run dev       # Start the development server
npm run lint      # Run ESLint
npm test          # Run attempt and backend integration/security tests
npm run build     # Create a production build
```

### Backend verification

The test suite includes:

- Attempt recovery, answer persistence, expiry, retakes, and idempotent submission
- Server-side scoring and answer-key protection
- Ownership and Row Level Security contract checks
- Published-quiz locking and answer-key integrity constraints
- Best-attempt leaderboard deduplication and score/time ranking
- Submitted-review authorization and API authentication contracts

The database contract tests read the checked-in Supabase SQL files. For a live
database check, run the scripts in the Supabase SQL Editor as described above,
then verify the acceptance checks in [`supabase/README.md`](./supabase/README.md).

## Contributing

1. Sync your local `main` branch with `upstream/main`.
2. Create a focused feature or documentation branch.
3. Make one logical change per branch and commit using
   [Conventional Commits](https://www.conventionalcommits.org/).
4. Push the branch to your fork.
5. Open a pull request against `RCOEM-Google-DSC/Quizora-B:main`.

Keep database schema, policies, seed data, and documentation changes focused so
they can be reviewed and merged independently.
