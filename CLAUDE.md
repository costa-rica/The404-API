# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The404-API is a TypeScript Express.js API that serves as part of The 404 Server Manager ecosystem. It runs on individual Ubuntu servers (port 8000) and connects to a shared MongoDB database (`The404v02`) to manage server, app, and configuration data across multiple machines.

## Development Commands

### Running the application
```bash
npm run dev     # Development mode with hot-reload (watches src/)
npm run build   # Compile TypeScript to dist/
npm start       # Run production build from dist/
```

The dev server runs on `http://0.0.0.0:3000` by default (configurable via `PORT` env var).

## Database Architecture

**CRITICAL**: This project is in transition from `TypeScriptDb` to MongoDB/Mongoose.

### Current State (Temporary)
- Currently uses `typescriptdb` package (local file dependency: `file:../TypeScriptDb`)
- Imports `initModels` and `sequelize` from `typescriptdb`
- Uses Sequelize ORM pattern

### Target State (Follow DATABASE_CONVERSION_OVERVIEW.md)
The project should migrate to a native Mongoose setup:

```
src/models/
├── connection.ts  # MongoDB connection via Mongoose
├── user.ts        # User model
├── machine.ts     # Machine model
└── (other models...)
```

When working with database code:
- Do NOT extend the `typescriptdb` package usage
- Follow the Mongoose single-connection pattern documented in `docs/DATABASE_CONVERSION_OVERVIEW.md`
- Use existing `users` and `machines` collections from the original The404Back project
- Connection string from `process.env.MONGODB_URI`
- Set `serverSelectionTimeoutMS: 2000` for connection

## Application Structure

### Entry Point Flow
1. `src/server.ts` - Server startup, error handling, console log override with APP_NAME
2. `src/app.ts` - Express app configuration, middleware setup, route registration, database initialization

### Key Architecture Points

**Middleware Order (CRITICAL)**:
Middleware MUST be registered BEFORE routes in `src/app.ts`:
```typescript
// 1. JSON/URL-encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 2. Cookie parser
app.use(cookieParser());

// 3. Logging
app.use(morgan("dev"));

// 4. CORS (with credentials and Content-Disposition header exposure)
app.use(cors({ credentials: true, exposedHeaders: ["Content-Disposition"] }));

// 5. Routes (AFTER middleware)
app.use("/users", usersRouter);
app.use("/", indexRouter);
```

**Initialization Sequence**:
- `app.ts` calls `verifyCheckDirectoryExists()` to create required directories from env vars
- `initializeApp()` async function initializes DB models, syncs sequelize, then runs `onStartUpCreateEnvUsers()`
- Server exits with code 1 if initialization fails

### Directory Structure
```
src/
├── app.ts                 # Express app config & initialization
├── server.ts              # Server startup & error handling
├── routes/
│   ├── index.ts           # Root endpoint, serves HTML from templates/
│   └── users.ts           # User authentication endpoints
├── modules/
│   ├── common.ts          # Shared utilities (checkBodyReturnMissing)
│   └── onStartUp.ts       # Startup functions (directory creation, admin user setup)
└── templates/
    └── index.html         # Static HTML served at GET /
```

## Authentication

Uses JWT tokens with bcrypt password hashing:
- `JWT_SECRET` environment variable required
- Tokens generated with `jwt.sign({ id: user.id }, process.env.JWT_SECRET)`
- Passwords hashed with `bcrypt.hash(password, 10)`
- No middleware for protected routes yet (to be implemented)

## Environment Variables

Required variables:
- `PORT` - Server port (default: 3000)
- `APP_NAME` - Application name for logging (default: "ExpressAPI02")
- `JWT_SECRET` - Secret for JWT signing
- `MONGODB_URI` - MongoDB connection string (for future Mongoose implementation)
- `PATH_DATABASE` - Database storage path
- `PATH_PROJECT_RESOURCES` - Project resources path
- `ADMIN_EMAIL` - JSON array of admin emails (e.g., `["admin@example.com"]`)

### Admin User Creation
On startup, `onStartUpCreateEnvUsers()` creates admin users from `ADMIN_EMAIL` env var with default password "test" if they don't exist.

## API Endpoints

See `docs/API_REFERENCE.md` for complete endpoint documentation.

### Core Routes
- `GET /` - Serves HTML from `src/templates/index.html`
- `GET /users` - Simple health check
- `POST /users/register` - Create new user (returns JWT token)
- `POST /users/login` - Authenticate user (returns JWT token)

### Request Validation Pattern
Uses `checkBodyReturnMissing(body, requiredKeys)` from `src/modules/common.ts`:
```typescript
const { isValid, missingKeys } = checkBodyReturnMissing(req.body, ["email", "password"]);
if (!isValid) {
  return res.status(400).json({ error: `Missing ${missingKeys.join(", ")}` });
}
```

## Error Handling

Global error handlers in `src/server.ts`:
- `uncaughtException` - Logs error with stack trace, exits process
- `unhandledRejection` - Logs promise rejection details with stack trace
- Console methods overridden to prefix all logs with `[APP_NAME]`

## Important Notes

- Template files in `src/templates/` are read at runtime from `dist/templates/` after compilation
- CORS is configured to allow credentials and expose Content-Disposition header
- Server binds to `0.0.0.0` for external access (not just localhost)
- Username is auto-generated from email prefix (before @) during registration
