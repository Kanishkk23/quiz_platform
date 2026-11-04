# Quiz Platform

An interactive quiz platform built with **Next.js**, **Tailwind CSS**, and **shadcn/ui**.

## Features

- 🔐 User registration, login, and logout
- 📝 Quiz listing and quiz attempt screen
- ✅ Answer submission and score calculation
- 🏆 Live leaderboard with real-time updates
- 📱 Responsive layout usable on desktop and mobile

## Tech Stack

- **Frontend**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (authentication, database)
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Hosting**: AWS EC2

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Kanishkk23/quiz_platform.git

# Navigate to the project
cd quiz_platform

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/                  # App Router pages
│   ├── layout.tsx        # Root layout (Navbar + Footer)
│   ├── page.tsx          # Home / Landing page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── quizzes/          # Quiz listing + attempt + results
│   └── leaderboard/      # Leaderboard page
├── components/
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Navbar, Footer
├── data/
│   └── mock.ts           # Mock data for development
├── types/
│   └── index.ts          # TypeScript interfaces
└── lib/
    └── utils.ts          # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`feature/your-feature-name`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/)
4. Push and create a Pull Request
