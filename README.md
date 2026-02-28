# Experiment Proxy Portal

Enterprise multi-tenant web application for managing experiments, connectors, and data mappings.

## Phase 1: Foundation Completed

### Features Implemented

- Multi-tenant architecture with tenant switcher
- Mock authentication system
- Protected routes with session management
- Professional enterprise UI with Tailwind CSS
- Navigation sidebar with 6 main sections
- Responsive layout with header and user menu

### Tech Stack

- React 19
- Vite 6
- TypeScript 5
- React Router 7
- Zustand (state management)
- Zod (validation)
- Tailwind CSS 4

### Project Structure

```
src/
├── domain/              # Domain models and schemas
│   ├── Tenant.ts
│   ├── UserSession.ts
│   ├── ApiKey.ts
│   └── index.ts
├── services/mock/       # Mock API service layer
│   ├── data.ts         # Seed data
│   ├── authService.ts
│   ├── tenantService.ts
│   └── index.ts
├── stores/             # Zustand state management
│   ├── authStore.ts
│   ├── tenantStore.ts
│   └── index.ts
├── components/
│   ├── ui/            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Spinner.tsx
│   │   └── index.ts
│   └── layout/        # Layout components
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       ├── TenantSwitcher.tsx
│       ├── AppLayout.tsx
│       └── index.ts
├── pages/             # Application pages
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── ExperimentsPage.tsx
│   ├── ConnectorsPage.tsx
│   ├── MappingsPage.tsx
│   ├── BuilderPage.tsx
│   ├── SettingsPage.tsx
│   └── index.ts
├── routes/            # Routing configuration
│   ├── ProtectedRoute.tsx
│   └── index.tsx
├── styles/            # Theme configuration
│   └── theme.ts
├── App.tsx
├── main.tsx
└── index.css
```

### Demo Credentials

The application includes three demo user accounts:

1. **Admin** (access to all 4 tenants)
   - Email: admin@acme.com
   - Password: admin123

2. **User** (access to TechStart Industries)
   - Email: user@techstart.com
   - Password: user123

3. **Viewer** (access to Global Enterprises)
   - Email: viewer@global.com
   - Password: viewer123

### Available Tenants

1. Acme Corporation
2. TechStart Industries
3. Global Enterprises Ltd
4. Research Labs Inc

### Key Functionality

#### Authentication
- Mock login with email/password
- Session stored in localStorage
- Automatic session expiration (8 hours)
- Route guards protecting app routes

#### Multi-Tenancy
- Tenant switcher in header
- Global tenant context via Zustand
- Each user can access multiple tenants
- Active tenant displayed in header and settings

#### Navigation
- Dashboard - Overview and quick actions
- Experiments - A/B tests and feature flags
- Connectors - External service integrations
- Mappings - Data transformation definitions
- Builder - Visual workflow builder
- Settings - User and tenant configuration

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Design Principles

- Clean enterprise aesthetic
- Consistent spacing (8px system)
- Professional color palette (primary blue, neutral grays)
- Card-based layouts
- Clear visual hierarchy
- Responsive design

### Next Steps (Future Phases)

- Implement experiment management functionality
- Add connector configuration
- Build mapping editor
- Create visual workflow builder
- Integrate real backend APIs
- Add correlation ID tracking
- Implement audit logging
