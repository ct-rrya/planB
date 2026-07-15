# Project Structure

## Overview
This document provides a detailed breakdown of the project structure for the Barangay Service Management System.

## Root Structure
```
barangay-service-management/
├── client/           # React frontend application
├── server/           # NestJS backend application
├── docs/             # Project documentation
├── README.md         # Main project documentation
└── .gitignore        # Git ignore configuration
```

## Frontend (Client)

### Directory Structure
```
client/
├── src/
│   ├── api/              # API client and interceptors
│   │   └── axios.ts      # Axios instance with auth interceptor
│   ├── assets/           # Static assets (images, fonts, etc.)
│   ├── components/       # Reusable React components
│   │   ├── common/       # Shared components (buttons, inputs, etc.)
│   │   ├── forms/        # Form components
│   │   └── layout/       # Layout components
│   ├── features/         # Feature-specific modules
│   ├── hooks/            # Custom React hooks
│   ├── layouts/          # Page layouts
│   │   └── DashboardLayout.tsx
│   ├── lib/              # Library configurations
│   │   └── queryClient.ts  # TanStack Query configuration
│   ├── pages/            # Page components
│   │   ├── Dashboard/    # Dashboard page
│   │   ├── Login/        # Login page
│   │   ├── Residents/    # Residents management
│   │   ├── Requests/     # Document requests
│   │   ├── Documents/    # Document types
│   │   ├── Announcements/  # Announcements
│   │   ├── Reports/      # Reports
│   │   ├── Settings/     # Settings
│   │   ├── Profile/      # User profile
│   │   └── NotFound/     # 404 page
│   ├── routes/           # React Router configuration
│   │   └── index.tsx     # Route definitions
│   ├── services/         # API service layer
│   │   ├── auth.service.ts
│   │   └── residents.service.ts
│   ├── store/            # State management
│   ├── styles/           # Global styles
│   │   └── index.css     # Tailwind CSS imports
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts      # Application types
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Root application component
│   └── main.tsx          # Application entry point
├── .env                  # Environment variables
├── .env.example          # Environment template
├── .eslintrc.cjs         # ESLint configuration
├── .prettierrc           # Prettier configuration
├── index.html            # HTML template
├── package.json          # NPM dependencies
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── tsconfig.app.json     # App TypeScript configuration
├── tsconfig.node.json    # Node TypeScript configuration
└── vite.config.ts        # Vite configuration
```

### Key Frontend Files

#### Types (src/types/index.ts)
- User
- Resident
- DocumentType
- Request
- Announcement
- Conversation
- AuditLog
- LoginCredentials
- AuthResponse

#### Services
- **auth.service.ts**: Authentication operations
- **residents.service.ts**: Resident CRUD operations

#### Configuration
- Path aliases configured in vite.config.ts and tsconfig.app.json
- API proxy to backend configured in vite.config.ts
- TanStack Query client configured in lib/queryClient.ts
- Axios interceptors for auth tokens in api/axios.ts

## Backend (Server)

### Directory Structure
```
server/
├── src/
│   ├── auth/                   # Authentication module
│   │   ├── dto/
│   │   │   └── login.dto.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/                  # User management
│   │   └── dto/
│   │       └── create-user.dto.ts
│   ├── residents/              # Residents module
│   │   ├── dto/
│   │   │   ├── create-resident.dto.ts
│   │   │   └── update-resident.dto.ts
│   │   ├── residents.controller.ts
│   │   ├── residents.service.ts
│   │   └── residents.module.ts
│   ├── requests/               # Document requests
│   │   └── dto/
│   │       └── create-request.dto.ts
│   ├── documents/              # Document types
│   │   └── dto/
│   │       └── create-document-type.dto.ts
│   ├── chatbot/                # Facebook Messenger bot
│   │   ├── chatbot.controller.ts
│   │   ├── chatbot.service.ts
│   │   └── chatbot.module.ts
│   ├── announcements/          # Announcements module
│   │   └── dto/
│   │       └── create-announcement.dto.ts
│   ├── reports/                # Reporting module
│   ├── notifications/          # Notifications
│   ├── uploads/                # File uploads
│   ├── database/               # Database configuration
│   │   ├── schemas/
│   │   │   ├── user.schema.ts
│   │   │   ├── resident.schema.ts
│   │   │   ├── document-type.schema.ts
│   │   │   ├── request.schema.ts
│   │   │   ├── announcement.schema.ts
│   │   │   ├── conversation.schema.ts
│   │   │   └── audit-log.schema.ts
│   │   └── database.module.ts
│   ├── config/                 # Configuration
│   │   └── configuration.ts
│   ├── common/                 # Shared utilities
│   │   ├── decorators/
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   ├── middleware/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── pipes/
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry point
├── test/                       # E2E tests
├── .env                        # Environment variables
├── .env.example                # Environment template
├── .prettierrc                 # Prettier configuration
├── eslint.config.mjs           # ESLint configuration
├── nest-cli.json               # NestJS CLI configuration
├── package.json                # NPM dependencies
├── tsconfig.json               # TypeScript configuration
└── tsconfig.build.json         # Build TypeScript configuration
```

### Key Backend Files

#### Modules
1. **AuthModule**: JWT authentication, login
2. **ResidentsModule**: Resident CRUD operations
3. **ChatbotModule**: Facebook Messenger webhook
4. **DatabaseModule**: MongoDB connection

#### Schemas
- User (Admin accounts)
- Resident
- DocumentType
- Request
- Announcement
- Conversation
- AuditLog

#### Global Configuration
- **main.ts**: Application bootstrap, Swagger setup, global pipes/filters
- **app.module.ts**: Root module importing all feature modules
- **configuration.ts**: Environment configuration factory

#### Common Utilities
- **JwtAuthGuard**: Protect routes with JWT
- **HttpExceptionFilter**: Consistent error responses
- **LoggingInterceptor**: Request/response logging

## API Endpoints

### Authentication
- POST /api/auth/login

### Residents
- GET /api/residents
- GET /api/residents/:id
- POST /api/residents
- PATCH /api/residents/:id
- DELETE /api/residents/:id

### Chatbot
- GET /api/chatbot/webhook (verification)
- POST /api/chatbot/webhook (receive messages)

## Documentation
- Swagger UI available at: http://localhost:3000/api/docs

## Development Workflow

1. **Frontend Development**
   ```bash
   cd client
   npm run dev
   ```

2. **Backend Development**
   ```bash
   cd server
   npm run start:dev
   ```

3. **Building for Production**
   ```bash
   # Frontend
   cd client
   npm run build

   # Backend
   cd server
   npm run build
   ```

## Environment Variables

### Frontend (.env)
- VITE_API_URL: Backend API URL
- VITE_APP_NAME: Application name

### Backend (.env)
- NODE_ENV: Development/production
- PORT: Server port
- MONGODB_URI: MongoDB connection string
- JWT_SECRET: JWT secret key
- JWT_EXPIRATION: Token expiration
- META_VERIFY_TOKEN: Facebook webhook verification
- META_PAGE_ACCESS_TOKEN: Facebook page access token
- META_APP_SECRET: Facebook app secret
- ALLOWED_ORIGINS: CORS allowed origins

## Next Steps

This is a scaffolded project. The next phases will include:

1. Implement remaining modules (users, requests, documents, announcements, reports)
2. Implement Facebook Messenger API integration
3. Add authentication guards to protected routes
4. Implement file upload functionality
5. Add comprehensive error handling
6. Implement validation for all DTOs
7. Add unit and e2e tests
8. Set up CI/CD pipeline
