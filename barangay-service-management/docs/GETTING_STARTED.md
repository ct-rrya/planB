# Getting Started

## Quick Start Guide

This guide will help you set up and run the Barangay Service Management System on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - Either:
  - Local installation - [Download here](https://www.mongodb.com/try/download/community)
  - MongoDB Atlas account - [Sign up here](https://www.mongodb.com/cloud/atlas/register)
- **Git** - [Download here](https://git-scm.com/downloads)
- **npm** (comes with Node.js)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd barangay-service-management
```

### 2. Setup Frontend

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# VITE_API_URL=http://localhost:3000/api
```

### 3. Setup Backend

```bash
# Navigate to server directory (from root)
cd ../server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

**Important Backend Environment Variables:**

```env
# Required for development
MONGODB_URI=mongodb://localhost:27017/barangay-service-management
JWT_SECRET=your-super-secret-jwt-key-change-this

# Optional for now (needed for Facebook Messenger later)
META_VERIFY_TOKEN=your-verify-token
META_PAGE_ACCESS_TOKEN=your-page-access-token
META_APP_SECRET=your-app-secret
```

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
# Windows:
net start MongoDB

# macOS/Linux:
sudo systemctl start mongod
```

**Option B: MongoDB Atlas**
- Use your MongoDB Atlas connection string in the MONGODB_URI variable

### 5. Run the Applications

**Terminal 1 - Backend:**
```bash
cd server
npm run start:dev
```

The backend will start at `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

The frontend will start at `http://localhost:5173`

## Verify Installation

### 1. Check Backend
- Visit: http://localhost:3000/api
- You should see a response from the server

### 2. Check API Documentation
- Visit: http://localhost:3000/api/docs
- You should see the Swagger UI documentation

### 3. Check Frontend
- Visit: http://localhost:5173
- You should see the login page

## Available Scripts

### Frontend (client/)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (server/)
- `npm run start` - Start production server
- `npm run start:dev` - Start with watch mode (recommended for development)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3000
```
Solution: Change the PORT in server/.env or stop the process using that port

**2. MongoDB Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
Solution: Ensure MongoDB is running or check your MONGODB_URI

**3. Module Not Found**
```
Error: Cannot find module 'xyz'
```
Solution: Delete node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

**4. TypeScript Errors**
Solution: Ensure you have the latest dependencies:
```bash
npm install
npm run build
```

**5. CORS Errors**
Solution: Verify the ALLOWED_ORIGINS in server/.env includes your frontend URL

## Project Structure Overview

```
barangay-service-management/
├── client/              # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── services/    # API services
│   │   └── types/       # TypeScript types
│   └── package.json
│
├── server/              # NestJS + TypeScript backend
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── residents/   # Residents module
│   │   ├── chatbot/     # Messenger bot module
│   │   └── database/    # Database schemas
│   └── package.json
│
└── docs/                # Documentation
```

## Next Steps After Installation

1. **Explore the API Documentation**
   - Visit http://localhost:3000/api/docs
   - Test the available endpoints

2. **Create Initial Admin User**
   - You'll need to create an admin user manually in MongoDB or create a seed script

3. **Test the Frontend**
   - Try navigating to different pages
   - Check the network tab to see API calls

4. **Review the Code**
   - Explore the project structure
   - Read through the main modules
   - Understand the authentication flow

## Development Best Practices

1. **Always run both frontend and backend together during development**
2. **Use the Swagger documentation to test API endpoints**
3. **Check the browser console and terminal logs for errors**
4. **Keep your .env files up to date but never commit them**
5. **Run linting before committing code**: `npm run lint`

## Creating Your First Admin User

Since authentication is scaffolded but no users exist yet, you'll need to create an admin user. You can do this via MongoDB directly:

**Using MongoDB Shell:**
```javascript
use barangay-service-management

// Note: You'll need to hash the password using bcrypt
// For now, this is a placeholder. You should create a seed script.
db.users.insertOne({
  username: "admin",
  password: "$2b$10$hashed_password_here",  // This should be hashed with bcrypt
  role: "super_admin",
  createdAt: new Date()
})
```

**Better Approach:** Create a seed script in server/src/ to initialize your database with a default admin user.

## Learn More

- **React Documentation**: https://react.dev/
- **NestJS Documentation**: https://docs.nestjs.com/
- **MongoDB Documentation**: https://docs.mongodb.com/
- **TypeScript Documentation**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs

## Need Help?

- Review the main README.md for detailed information
- Check docs/PROJECT_STRUCTURE.md for architecture details
- Review the code comments in the source files

---

**Congratulations!** You now have a fully scaffolded production-quality application ready for feature implementation.
