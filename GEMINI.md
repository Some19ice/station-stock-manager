# Project Overview

This is a full-stack application for managing stock at a gas station. It is built with Next.js, Tailwind CSS, and Supabase.

**Main Technologies:**

*   **Frontend:** Next.js, React, Tailwind CSS, Shadcn UI, Framer Motion
*   **Backend:** Next.js (Server Actions), Supabase, PostgreSQL, Drizzle ORM
*   **Authentication:** Clerk
*   **Payments:** Stripe

**Architecture:**

The application follows a standard Next.js App Router architecture. The frontend is built with React and Tailwind CSS, and the backend is powered by Next.js Server Actions, which interact with a PostgreSQL database via the Drizzle ORM. Supabase is used for database hosting and other backend services. Clerk handles user authentication, and Stripe is integrated for payments.

# Building and Running

**Key Commands:**

*   **Install dependencies:** `npm install`
*   **Run the development server:** `npm run dev`
*   **Build for production:** `npm run build`
*   **Run in production:** `npm run start`
*   **Run tests:** `npm test`
*   **Lint and format:** `npm run clean`
*   **Database migrations:**
    *   `npm run db:generate` to generate migrations
    *   `npm run db:migrate` to apply migrations
    *   `npm run db:seed` to seed the database

**Environment Variables:**

The application requires several environment variables to be set in a `.env.local` file. A `.env.example` file is provided with the required variables.

# Development Conventions

*   **Coding Style:** The project uses ESLint and Prettier to enforce a consistent coding style.
*   **Testing:** The project uses Jest for unit tests and Playwright for end-to-end tests.
*   **Commits:** The project follows the Conventional Commits specification for commit messages.
*   **Database:** The project uses Drizzle ORM for database access and migrations. The database schema is defined in the `db/schema` directory.
*   **Authentication:** User authentication is handled by Clerk.
*   **UI:** The UI is built with Shadcn UI, a collection of reusable UI components for React.
