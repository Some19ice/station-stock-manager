# Station Stock Manager

A comprehensive fuel inventory management system designed for gas stations. This application provides role-based dashboards for both sales staff and managers to efficiently track inventory, record sales, and monitor station operations.

## Features

- **Role-Based Dashboards**: Separate interfaces for sales staff and managers
- **Real-Time Inventory Tracking**: Monitor fuel levels and stock movements
- **Sales Management**: Quick sale recording and transaction history
- **Staff Management**: User roles and access control
- **Analytics & Reporting**: Daily sales reports and performance metrics
- **Low Stock Alerts**: Automated notifications for inventory thresholds
- **Multi-Station Support**: Manage multiple station locations

## Tech Stack

- Frontend: [Next.js](https://nextjs.org/docs), [Tailwind](https://tailwindcss.com/docs/guides/nextjs), [Shadcn](https://ui.shadcn.com/docs/installation), [Framer Motion](https://www.framer.com/motion/introduction/)
- Backend: [PostgreSQL](https://www.postgresql.org/about/), [Supabase](https://supabase.com/), [Drizzle](https://orm.drizzle.team/docs/get-started-postgresql), [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- Auth: [Clerk](https://clerk.com/)
- Payments: Disabled (Stripe integration removed)

## Prerequisites

You will need accounts for the following services.

They all have free plans that you can use to get started.

- Create a [GitHub](https://github.com/) account
- Create a [Supabase](https://supabase.com/) account
- Create a [Clerk](https://clerk.com/) account
- Create a [Vercel](https://vercel.com/) account

You will likely not need paid plans unless you are building a business.

## Environment Variables

```bash
# DB
DATABASE_URL=
# Access Supabase Studio here: http://127.0.0.1:54323/project/default

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login # do not change
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup # do not change
```

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in the environment variables from above
3. Run `npm install` to install dependencies
4. Run `npm run dev` to run the app locally

## User Roles

### Sales Staff
- Record new sales transactions
- View daily sales summary
- Access frequently sold products for quick sales
- View recent transaction history

### Manager
- Access comprehensive dashboard with key metrics
- Monitor low stock alerts
- Manage staff and user roles
- View detailed analytics and reports
- Perform end-of-day summaries

## Database Schema

The application includes comprehensive database schema for:
- Products (fuel types, lubricants, accessories)
- Stations (multi-location support)
- Users (staff and manager roles)
- Transactions (sales records)
- Stock movements (inventory tracking)
- Suppliers (vendor management)

## Getting Started

1. Set up your environment variables
2. Run the development server
3. Create your first station and user accounts
4. Configure product inventory
5. Start recording sales and managing inventory

For detailed setup instructions and API documentation, see the `/docs` directory.
