# Barangay Service Management System but in fb mess 

This repository contains the Barangay Service Management System, a web application designed to streamline barangay services for residents and administrators.

This project is mainly focused on integrating the Facebook Messenger platform as the primary communication channel between residents and barangay staff, while also providing a web-based admin dashboard for managing requests, documents, announcements, reports, and records.

## Project Overview

The system supports:
- Resident information management
- Document request tracking and processing
- Announcements and community updates
- Audit logging and monitoring
- Reporting and administrative dashboard views
- Facebook Messenger bot integration for resident communication
- Secure admin authentication and role-based access
- Messenger-driven service requests and bot workflows

## Messenger Integration Focus

The core objective of this system is to connect barangay services to a familiar messaging platform so residents can:
- send service requests through Messenger
- receive updates on document requests and announcements
- interact with automated workflows for barangay transactions
- communicate with the barangay without needing to visit the office directly

The backend and chatbot modules are designed to support this messaging-first experience, while the dashboard gives administrators a centralized place to manage operations.

## Repository Structure

```text
planB/
├── barangay-service-management/   # Main project source code
│   ├── client/                     # React + TypeScript frontend
│   ├── server/                     # NestJS backend API
│   ├── docs/                       # Project documentation
│   ├── docker-compose.yml          # Multi-container setup
│   ├── README.md                   # Project-level project documentation
│   └── ...
├── Dockerfile                      # Root container setup
├── docker-compose.yml              # Root compose file
├── .gitignore
├── README.md                       # This file
└── .vscode/
```

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form + Zod

### Backend
- NestJS
- TypeScript
- MongoDB with Mongoose
- JWT authentication
- Passport
- Swagger API docs

## Main Application

The working application is located in:
- [barangay-service-management](./barangay-service-management)

For more detailed setup and developer instructions, see:
- [barangay-service-management/README.md](./barangay-service-management/README.md)
- [barangay-service-management/docs/GETTING_STARTED.md](./barangay-service-management/docs/GETTING_STARTED.md)

## Quick Start

1. Open the project folder:

```bash
cd barangay-service-management
```

2. Start the backend:

```bash
cd server
npm install
npm run start:dev
```

3. Start the frontend in another terminal:

```bash
cd client
npm install
npm run dev
```

4. Open the app in your browser:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Docker Setup

This project also includes Docker-based setup for running services together.

```bash
cd barangay-service-management
docker compose up --build
```

## Environment Configuration

Copy the example environment files before running the app:

```bash
cd barangay-service-management/client
cp .env.example .env

cd ../server
cp .env.example .env
```

Update the values in `.env` as needed for your local or Docker environment.

## Notes

- Do not commit sensitive environment files such as `.env`.
- MongoDB must be running for the backend to function properly.
- The project is organized as a full-stack application with separate frontend and backend modules.

## License

This project is intended for academic and project use. Please check the project-specific files for any licensing or deployment notes.
