# bun-elysia-react-tailwind

A modern full-stack TypeScript template combining Bun, Elysia, React 19, and Tailwind CSS v4. Production-ready with authentication, database integration, and developer tooling out of the box.

## Features

### ⚡ Runtime & Framework

- **[Bun](https://bun.sh/)** - Ultra-fast JavaScript runtime with native TypeScript support
- **[Elysia](https://elysiajs.com/)** - High-performance web framework with end-to-end type safety
- **[React 19](https://react.dev/)** - Latest React with React Router v7 for client-side routing
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Next-gen utility-first CSS framework

### 🔐 Authentication

- JWT-based authentication with secure HTTP-only cookies
- Password hashing using native Bun crypto
- User signup, login, logout, and session management
- Role-based access control (USER/ADMIN roles)
- Auth context provider for React with automatic session restoration

### 🗄️ Database

- **[Prisma](https://prisma.io/)** with PostgreSQL adapter
- Pre-configured User model with email/password authentication
- Database migrations and type-safe client generation
- Docker Compose setup for local PostgreSQL development

### 🌍 Internationalization (i18n)

- **[i18next](https://www.i18next.com/)** integration with React
- Automatic browser language detection
- Pre-configured English and Portuguese locales
- i18next-parser for extracting translation keys

### 🎨 Theming

- Light/dark mode with system preference auto-detection
- Manual theme picker (auto, light, dark) persisted in localStorage
- CSS custom properties for all colors, with dark/light overrides in `public/index.css`
- `useThemedAsset` hook for theme-aware static assets (logos, images)
- No flash of wrong theme on page load (inline detection script)

### 🛡️ Security & Performance

- Rate limiting middleware (configurable per-route)
- CORS configuration with regex pattern support
- Separate rate limits for API and static assets
- Environment-based security settings

### 📝 Logging

- **[Pino](https://getpino.io/)** logger with pretty printing for development
- Log rotation with pino-roll
- Request/response logging with sanitization
- Configurable log levels

### 🛠️ Developer Experience

- **[Biome](https://biomejs.dev/)** for linting and formatting
- **[Husky](https://typicode.github.io/husky/)** pre-commit hooks (lint, type-check, tests)
- Hot module reloading in development
- End-to-end type safety with Eden Treaty (Elysia client)
- Path aliases (`@/`) for clean imports
- TypeScript strict mode

### 📦 Build & Deploy

- Custom build script with Tailwind CSS plugin
- Docker support with multi-stage builds
- Environment-based configuration
- Production-ready with minification and optimization

## Getting Started

Create a new repo using this template, and run the following commands:

```bash
bun install
bun setup

# Start the development server
bun dev
```

Then, access the app at `http://localhost:3000`.

## Available Scripts

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `bun dev`             | Start development server with hot reload |
| `bun start`           | Start production server                  |
| `bun build`           | Build for production                     |
| `bun test`            | Run tests with coverage                  |
| `bun lint`            | Check code with Biome                    |
| `bun format`          | Format code with Biome                   |
| `bun setup`           | Initialize database and environment      |
| `bun set-admin`       | Promote a user to admin role             |
| `bun prisma:migrate`  | Run database migrations                  |
| `bun prisma:generate` | Generate Prisma client                   |
| `bun i18n:extract`    | Extract translation keys                 |

## Project Structure

```
├── src/
│   ├── api/                 # Backend API
│   │   ├── auth/            # Authentication endpoints
│   │   ├── health/          # Health check endpoint
│   │   ├── lib/             # Shared utilities (auth, logger, prisma)
│   │   └── middlewares/     # Rate limiting, etc.
│   ├── client/              # Frontend React app
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (Auth, Theme)
│   │   ├── lib/             # Client utilities (api, i18n)
│   │   ├── locales/         # Translation files
│   │   └── pages/           # Page components
│   ├── app.ts               # Elysia app configuration
│   ├── config.ts            # Environment configuration
│   └── index.ts             # Entry point
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
├── scripts/                 # Setup and utility scripts
└── generated/               # Generated Prisma client
```

## Environment Variables

| Variable       | Description                  | Default                   |
| -------------- | ---------------------------- | ------------------------- |
| `NODE_ENV`     | Environment mode             | `development`             |
| `PORT`         | Server port                  | `3000`                    |
| `PUBLIC_URL`   | Public URL for the app       | `http://localhost:3000`   |
| `JWT_SECRET`   | Secret for JWT signing       | `change-me-in-production` |
| `CORS_ORIGIN`  | Allowed CORS origins         | `localhost:3000`          |
| `DATABASE_URL` | PostgreSQL connection string | -                         |
| `LOG_LEVEL`    | Pino log level               | `info`                    |

## Roadmap

- [ ] Server-Side Rendering (SSR)
- [ ] OpenAPI/Swagger documentation for API endpoints
- [ ] WebSocket support for real-time features
- [x] Dark mode and theming system
- [ ] Database seeding for development
- [ ] Improved deployment setup in Dockerfile, following recommendations from ElysiaJS and Bun's docs.
  - [ ] Use build command
  - [ ] Multi-core support
- [ ] Optimized frontend code
  - [ ] Code splitting
  - [ ] Lazy loading
  - [ ] Proper treeshaking
- [ ] Components
  - [ ] ProtectedRoute
- [ ] Lucide Icons
- [ ] i18n backend
- [ ] CD flags on GitHub

## License

[MIT](LICENSE)
