# OfferShare - Local Development Setup

This guide will help you set up the OfferShare application on your local machine.

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- PostgreSQL database (local or remote)
- Firebase project

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
# git clone <your-repo-url>
# cd offershare

# Install dependencies
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual values:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/offershare
PGHOST=localhost
PGPORT=5432
PGDATABASE=offershare
PGUSER=your_username
PGPASSWORD=your_password

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Development Configuration
NODE_ENV=development
PORT=5000
```

### 3. Database Setup

#### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database named `offershare`
3. Update the database credentials in your `.env` file

#### Option B: Continue using Neon (Remote)

If you want to continue using the same database from Replit:

1. Keep the same `DATABASE_URL` from your Replit environment
2. The app will connect to the remote database

### 4. Firebase Configuration

1. Go to https://console.firebase.google.com
2. Select your Firebase project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add: `localhost` (for local development)
5. Copy your configuration values to the `.env` file

### 5. Database Migration

Push the database schema:

```bash
npm run db:push
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at: http://localhost:5000

## Additional Scripts

Add these scripts to your `package.json` for easier local development:

```json
{
  "scripts": {
    "local:setup": "npm install && npm run db:push",
    "local:dev": "npm run dev",
    "db:generate": "drizzle-kit generate"
  }
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your PostgreSQL service is running
   - Verify database credentials in `.env`
   - Ensure the database exists

2. **Firebase Authentication Error**
   - Verify Firebase configuration in `.env`
   - Check that `localhost` is added to authorized domains
   - Ensure your Firebase project has Authentication enabled

3. **Port Already in Use**
   - Change the `PORT` in your `.env` file
   - Or kill the process using port 5000

### Environment Variables

Make sure all required environment variables are set:

- `DATABASE_URL` - Complete PostgreSQL connection string
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID  
- `VITE_FIREBASE_APP_ID` - Firebase app ID

## Development Workflow

1. Start the development server: `npm run dev`
2. The app runs at http://localhost:5000
3. Hot reload is enabled for both frontend and backend changes
4. API routes are available at http://localhost:5000/api/*

## Production Build

To create a production build:

```bash
npm run build
npm start
```

This will build both the frontend and backend, then start the production server.

## Architecture Notes

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Firebase Auth
- **Real-time**: WebSocket for chat functionality
- **Styling**: Tailwind CSS + shadcn/ui components