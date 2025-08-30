# OfferShare Mobile Marketplace

## Overview

OfferShare is a production-ready mobile marketplace application where users can create and join "Buy-1-Get-1" type offers to split costs with other users. The application features a clean, fast user experience inspired by Uber's fluid UX and Reddit's color palette. Built as a full-stack web application optimized for mobile devices, it includes real-time chat functionality, offer management, and user authentication.

The system follows a modern React-based architecture with Express.js backend, PostgreSQL database via Drizzle ORM, and Firebase integration for authentication and real-time features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent, accessible design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Mobile-First Design**: Responsive design optimized for mobile devices with bottom navigation
- **Theme System**: Custom theme provider with Reddit-inspired color palette (orange primary, blue accent)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful APIs with WebSocket integration for real-time chat
- **Database ORM**: Drizzle ORM for type-safe database operations
- **In-Memory Storage**: Development storage layer with interface for easy database swapping
- **Real-time Communication**: WebSocket server for instant messaging between matched users

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured via Drizzle but using in-memory storage for development)
- **Schema Design**: 
  - Users table with Firebase UID integration, ratings, and location data
  - Offers table with pricing, location, status, and product information
  - Join requests for managing offer participation
  - Chat system with messages and conversation tracking
  - Rating system for user reputation

### Authentication and Authorization
- **Primary Auth**: Firebase Authentication with email/password and Google OAuth
- **Session Management**: Firebase handles token management and user sessions
- **User Profiles**: Custom user profiles stored in application database linked via Firebase UID
- **Authorization**: Route-level protection based on authentication status

### External Dependencies

- **Firebase Services**: Authentication, Firestore potential integration, and Storage for images
- **Neon Database**: Serverless PostgreSQL database provider (configured but not actively used in development)
- **UI Components**: Radix UI primitives for accessible, unstyled components
- **Image Handling**: Mock image uploads in development, designed for Firebase Storage in production
- **Location Services**: Geolocation API integration for distance-based offer discovery
- **Payment Integration**: Placeholder for UPI/payment gateway integration
- **Push Notifications**: Device token storage for future notification implementation

### Key Design Patterns
- **Component Composition**: Modular UI components with clear separation of concerns
- **Custom Hooks**: Reusable logic for authentication, theming, and mobile detection
- **Type Safety**: Full TypeScript implementation with Zod schema validation
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with React
- **Mobile-Optimized UX**: Bottom sheets, card-based layouts, and touch-friendly interactions