# Station Stock Manager

A comprehensive fuel inventory management system designed for gas stations. This Next.js 15 application provides role-based dashboards for sales staff and managers to efficiently track inventory, record sales, and monitor station operations in real-time.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)

## 🚀 Features

### For Sales Staff
- **Quick Sales Interface**: Fast transaction recording with barcode scanning
- **Daily Sales Summary**: Real-time sales tracking and shift summaries
- **Product Quick Access**: Frequently sold items for faster checkout
- **Transaction History**: View and search recent sales records
- **Shift Management**: Clock in/out and daily activity tracking

### For Managers
- **Comprehensive Dashboard**: Key metrics, analytics, and KPI monitoring
- **Inventory Management**: Real-time stock levels with automated alerts
- **Low Stock Notifications**: Automated alerts for inventory thresholds
- **Staff Management**: User roles, permissions, and activity monitoring
- **Analytics & Reporting**: Sales trends, profit margins, and performance metrics
- **Multi-Station Support**: Manage multiple locations from one interface
- **Supplier Management**: Track deliveries and manage vendor relationships
- **End-of-Day Reports**: Automated daily summaries and reconciliation

### Core Capabilities
- **Real-Time Inventory**: Live fuel level monitoring and stock movements
- **Role-Based Access**: Secure, permission-based interface segregation
- **Transaction Processing**: Complete sales workflow with receipt generation
- **Data Export**: CSV/PDF exports for accounting and reporting
- **Mobile Responsive**: Works seamlessly on tablets and mobile devices

## 🛠 Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/docs)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/docs/guides/nextjs)** - Utility-first styling
- **[Shadcn UI](https://ui.shadcn.com/docs/installation)** - Modern component library
- **[Framer Motion](https://www.framer.com/motion/introduction/)** - Smooth animations
- **[GSAP](https://gsap.com/)** - Advanced animations and interactions
- **[Recharts](https://recharts.org/)** - Data visualization and analytics

### Backend
- **[PostgreSQL](https://www.postgresql.org/about/)** - Robust relational database
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service platform
- **[Drizzle ORM](https://orm.drizzle.team/docs/get-started-postgresql)** - Type-safe database operations
- **[Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)** - Server-side data mutations

### Authentication & Security
- **[Clerk](https://clerk.com/)** - Authentication and user management
- **Role-based Access Control** - Granular permissions system
- **Secure API Routes** - Protected endpoints with authentication

### Development Tools
- **[Jest](https://jestjs.io/)** + **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)** - Unit testing
- **[Playwright](https://playwright.dev/)** - End-to-end testing
- **[ESLint](https://eslint.org/)** + **[Prettier](https://prettier.io/)** - Code quality and formatting

## 📋 Prerequisites

Create accounts for the following services (all have free tiers):

- **[GitHub](https://github.com/)** - Code repository hosting
- **[Supabase](https://supabase.com/)** - Database and backend services
- **[Clerk](https://clerk.com/)** - Authentication provider
- **[Vercel](https://vercel.com/)** - Deployment platform (optional)

## 🚦 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-username/station-stock-manager.git
cd station-stock-manager
npm install
```

### 2. Environment Setup

Create `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
```

### 3. Database Setup

```bash
# Start local Supabase (optional for local development)
npm run db:local

# Generate and run migrations
npx drizzle-kit generate
npx drizzle-kit migrate

# Seed with sample data
npm run db:seed
```

### 4. Start Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📜 Available Scripts

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run analyze` - Build with bundle analysis

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run types` - Run TypeScript type checking
- `npm run format:write` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run clean` - Run lint:fix and format:write

### Database
- `npm run db:local` - Start local Supabase instance
- `npx drizzle-kit generate` - Generate migration files
- `npx drizzle-kit migrate` - Run migrations
- `npx drizzle-kit push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data

### Testing
- `npm run test` - Run all tests (unit + e2e)
- `npm run test:unit` - Run Jest unit tests only
- `npm run test:e2e` - Run Playwright e2e tests only

### Components
- `npx shadcn@latest add [component-name]` - Add Shadcn UI components

## 🏗 Architecture

### Route Structure

```
/app
├── (unauthenticated)/          # Public routes
│   ├── (marketing)/            # Landing pages, features
│   ├── setup-profile/          # Initial user setup
│   ├── confirmation/           # Account verification
│   └── unauthorized/           # Access denied
├── (authenticated)/            # Protected routes
│   ├── dashboard/              # Manager interface
│   │   ├── inventory/          # Stock management
│   │   ├── reports/            # Analytics & reports
│   │   └── users/              # Staff management
│   └── staff/                  # Sales staff interface
│       ├── sales/              # Transaction recording
│       └── summary/            # Daily summaries
└── api/                        # Server-side API routes
```

### Key Patterns

- **Server Actions**: All data mutations handled server-side in `/actions`
- **Database Schema**: Type-safe schema definitions in `/db/schema`
- **Component Library**: Reusable UI components in `/components`
- **Role-Based Access**: Middleware-enforced route protection
- **Real-Time Updates**: Live inventory and sales tracking

## 👥 User Roles & Permissions

### Sales Staff
- ✅ Record sales transactions
- ✅ View daily sales summaries
- ✅ Access product catalog for quick sales
- ✅ View personal transaction history
- ✅ Generate customer receipts
- ❌ Cannot access inventory management
- ❌ Cannot view other staff data
- ❌ Cannot access financial reports

### Manager
- ✅ **All Sales Staff permissions, plus:**
- ✅ Comprehensive analytics dashboard
- ✅ Inventory management and stock alerts
- ✅ Staff management and role assignment
- ✅ Financial reports and profit analysis
- ✅ Multi-station oversight
- ✅ Supplier and vendor management
- ✅ System configuration and settings

## 🗄 Database Schema

### Core Entities

- **Stations** - Multi-location support with individual settings
- **Products** - Fuel types, lubricants, accessories with pricing
- **Users** - Staff profiles with role-based permissions
- **Transactions** - Complete sales records with line items
- **Stock Movements** - Inventory tracking (deliveries, sales, adjustments)
- **Suppliers** - Vendor information and delivery tracking
- **Customers** - Optional customer data for loyalty programs

### Key Relationships

- Transactions → Transaction Items (one-to-many)
- Products → Stock Movements (one-to-many)  
- Stations → Users (one-to-many)
- Suppliers → Products (many-to-many)

## 🧪 Testing Strategy

### Unit Tests (Jest + React Testing Library)
- Component rendering and interactions
- Utility functions and business logic
- Form validation and error handling
- Server action functionality

### End-to-End Tests (Playwright)
- Complete sales workflow
- Inventory management processes
- User authentication and authorization
- Multi-user role scenarios

```bash
# Run specific test suites
npm run test:unit -- --testNamePattern="Sales"
npm run test:e2e -- --grep="inventory"
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push to main

### Manual Deployment

```bash
npm run build
npm run start
```

### Database Migration

```bash
# Production database migration
npx drizzle-kit migrate --config=drizzle.config.prod.ts
```

## 🔧 Development Workflow

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **Database Changes**
   ```bash
   # Modify schema files in /db/schema
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

3. **Add Server Actions**
   ```bash
   # Create new actions in /actions
   # Include proper authentication and validation
   ```

4. **Build UI Components**
   ```bash
   # Add components to /components
   # Use Shadcn UI for consistency
   npx shadcn@latest add button
   ```

5. **Write Tests**
   ```bash
   # Add unit tests for components
   # Add e2e tests for user workflows
   npm run test
   ```

6. **Code Quality**
   ```bash
   npm run clean  # Format and lint
   npm run types  # Type check
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines

- Use TypeScript for all new code
- Follow existing component patterns
- Write tests for new functionality
- Use Zod schemas for validation
- Include proper error handling

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](license) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` directory for detailed guides
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions

## 🗺 Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced analytics with ML predictions
- [ ] Multi-currency support
- [ ] Loyalty program integration
- [ ] Advanced reporting dashboard
- [ ] API for third-party integrations

---

**Built with ❤️ for gas station management**