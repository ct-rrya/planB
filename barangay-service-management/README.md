# Barangay Service Management System with Facebook Messenger Bot

A comprehensive barangay service management system that enables residents to communicate with the barangay through Facebook Messenger, while providing administrators with a powerful dashboard for managing residents, document requests, announcements, and reports.

## 📋 Project Overview

This capstone project is built with production-quality standards following **Clean Architecture**, **SOLID principles**, and **modular development** practices. It's not a simple CRUD application - it's designed for scalability, maintainability, and extensibility.

## 🛠️ Technology Stack

### Frontend
- **React** with **TypeScript**
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Reusable component library
- **React Router DOM** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **React Hook Form** + **Zod** - Form management and validation
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Backend
- **NestJS** with **TypeScript**
- **MongoDB** with **Mongoose**
- **JWT** + **Passport** - Authentication
- **bcrypt** - Password hashing
- **class-validator** + **class-transformer** - Validation
- **Swagger** - API documentation
- **Multer** - File uploads
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging
- **dotenv** - Environment configuration

### Database
- **MongoDB Atlas** (or local MongoDB)

### Development Tools
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit checks
- **Git** - Version control
- **Postman** - API testing

## 📁 Project Structure

```
barangay-service-management/
├── client/                     # Frontend application
│   ├── src/
│   │   ├── api/               # API client configuration
│   │   ├── assets/            # Static assets
│   │   ├── components/        # Reusable components
│   │   │   ├── common/        # Common components
│   │   │   ├── forms/         # Form components
│   │   │   └── layout/        # Layout components
│   │   ├── features/          # Feature-specific modules
│   │   ├── hooks/             # Custom React hooks
│   │   ├── layouts/           # Page layouts
│   │   ├── lib/               # Library configurations
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard/
│   │   │   ├── Login/
│   │   │   ├── Residents/
│   │   │   ├── Requests/
│   │   │   ├── Documents/
│   │   │   ├── Announcements/
│   │   │   ├── Reports/
│   │   │   ├── Settings/
│   │   │   ├── Profile/
│   │   │   └── NotFound/
│   │   ├── routes/            # Route definitions
│   │   ├── services/          # API service functions
│   │   ├── store/             # State management
│   │   ├── styles/            # Global styles
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   ├── .env.example           # Environment template
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── vite.config.ts         # Vite configuration
│   └── package.json
│
├── server/                     # Backend application
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   │   ├── dto/
│   │   │   ├── strategies/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/             # User management
│   │   ├── residents/         # Resident management
│   │   ├── requests/          # Document requests
│   │   ├── documents/         # Document types
│   │   ├── chatbot/           # Facebook Messenger bot
│   │   ├── announcements/     # Announcements
│   │   ├── reports/           # Reporting
│   │   ├── notifications/     # Notifications
│   │   ├── uploads/           # File uploads
│   │   ├── database/          # Database schemas
│   │   │   └── schemas/
│   │   ├── config/            # Configuration
│   │   ├── common/            # Shared utilities
│   │   │   ├── decorators/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── middleware/
│   │   │   ├── filters/
│   │   │   └── pipes/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env.example           # Environment template
│   └── package.json
│
├── docs/                       # Documentation
├── README.md                   # This file
└── .gitignore
```

## 🗄️ Database Collections

### Admins (users)
- username
- password (hashed)
- role (admin/super_admin)
- createdAt

### Residents
- firstName
- middleName
- lastName
- purok
- address
- contactNumber
- messengerPSID
- createdAt

### DocumentTypes
- name
- requirements (array)
- fee
- processingDays

### Requests
- resident (reference)
- documentType (reference)
- status (pending/processing/completed/rejected)
- remarks
- requestedAt
- completedAt

### Announcements
- title
- content
- publishedAt

### Conversations
- resident (reference)
- sender (resident/admin)
- message
- timestamp

### AuditLogs
- action
- admin (reference)
- timestamp

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Clone the Repository
```bash
git clone <repository-url>
cd barangay-service-management
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` and set your variables:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Barangay Service Management System
```

4. Start development server:
```bash
npm run dev
```

The frontend will run at `http://localhost:5173`

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` and set your variables:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/barangay-service-management
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=7d
META_VERIFY_TOKEN=your-verify-token
META_PAGE_ACCESS_TOKEN=your-page-access-token
META_APP_SECRET=your-app-secret
ALLOWED_ORIGINS=http://localhost:5173
```

4. Start development server:
```bash
npm run start:dev
```

The backend will run at `http://localhost:3000/api`

### API Documentation

Once the backend is running, access Swagger documentation at:
```
http://localhost:3000/api/docs
```

## 📋 Available Scripts

### Frontend (client)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (server)
- `npm run start` - Start production server
- `npm run start:dev` - Start development server with watch mode
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## 🔐 Authentication

- **Admin users** authenticate via JWT tokens
- **Residents** authenticate through Facebook Messenger using their Messenger PSID
- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens expire after 7 days (configurable)

## 🤖 Facebook Messenger Bot

The chatbot module is scaffolded and ready for Meta API integration:

### Webhook Endpoints
- `GET /api/chatbot/webhook` - Webhook verification
- `POST /api/chatbot/webhook` - Receive messages

### Features to Implement
- Message handling
- Quick replies
- Persistent menu
- User authentication via PSID
- Document request submission
- Announcement delivery

## 🔮 Future Features

- [ ] Implement Meta API integration for Messenger bot
- [ ] Add file upload functionality for document requirements
- [ ] Implement real-time notifications using WebSockets
- [ ] Add data visualization for reports and analytics
- [ ] Implement email notifications
- [ ] Add SMS notifications
- [ ] Implement document templates and generation
- [ ] Add multi-language support
- [ ] Implement role-based access control (RBAC)
- [ ] Add audit trail for all actions
- [ ] Implement data export functionality
- [ ] Add advanced search and filtering
- [ ] Implement caching strategy
- [ ] Add rate limiting
- [ ] Implement comprehensive test coverage

## 🏗️ Architecture Principles

This project follows:

- **Clean Architecture** - Separation of concerns with clear boundaries
- **SOLID Principles** - Well-designed, maintainable code
- **Modular Development** - Feature-based organization
- **TypeScript Strict Mode** - Type safety throughout
- **API-First Design** - Well-documented REST endpoints
- **Security Best Practices** - Helmet, CORS, JWT, bcrypt
- **Validation** - Input validation at all layers
- **Error Handling** - Consistent error responses
- **Logging** - Request/response logging

## 📝 Coding Standards

- TypeScript strict mode enabled
- Consistent code formatting with Prettier
- Linting with ESLint
- Meaningful variable and function names
- Reusable components and utilities
- No unnecessary comments
- Feature-based folder organization

## 🤝 Contributing

This is a capstone project. Contribution guidelines will be added if the project becomes open for collaboration.

## 📄 License

[Add your license here]

## 👥 Authors

[Add your name and details here]

## 🙏 Acknowledgments

Built with modern web technologies and best practices for production-ready applications.

---

**Note:** This is a scaffolded project. Business logic implementation will follow in subsequent phases.
