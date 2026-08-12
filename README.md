# RootLink - Family Heritage Social Platform

A Next.js web application for building memory trees, sharing family stories, and connecting with relatives.

## Features

- 👥 **Memory Tree Management** - Build and visualize multi-generational memory trees
- 📖 **Story Sharing** - Share family stories with public or relatives-only visibility
- 💬 **Comments & Votes** - Comment on and vote on family stories
- 🔗 **Connection Requests** - Connect with other registered family members
- 🔔 **Notifications** - Get notified about connections and interactions
- 🔐 **Secure Authentication** - JWT-based auth with httpOnly cookies

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS v4 + ShadCN UI
- **Forms**: React Hook Form + Zod
- **State Management**: TanStack Query + React Context
- **Auth**: Custom JWT-based authentication
- **Alerts**: SweetAlert2
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create `.env.local` file and fill in your values:

```bash
# MongoDB Connection URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rootlink

# JWT Secret for authentication (use a strong random string)
AUTH_SECRET=your-secret-key-here-minimum-32-characters-long

# UploadThing (for image uploads)
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id

# Public App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── (auth)/                 # Authentication pages (login, register)
│   ├── login/
│   └── register/
├── (root)/                 # Protected app pages
│   ├── feed/              # Story feed
│   ├── tree/              # Family tree view
│   ├── connections/       # Connection management
│   └── notifications/     # User notifications
├── api/                    # API routes
│   ├── auth/              # Authentication endpoints
│   ├── tree/              # Family tree endpoints
│   ├── stories/           # Story endpoints
│   ├── connections/       # Connection endpoints
│   └── notifications/     # Notification endpoints
components/                # React components
├── ui/                    # ShadCN components
├── forms/                 # Form components
├── layout/                # Layout components
└── [feature]/             # Feature-specific components
lib/
├── auth.ts               # JWT & cookie handling
├── db.ts                 # MongoDB connection
├── utils.ts              # Utility functions
├── validations/          # Zod schemas
└── helpers/              # Helper functions
models/                   # Mongoose schemas
types/                    # TypeScript types & DTOs
hooks/                    # Custom React hooks
context/                  # React contexts
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Family Tree

- `GET /api/tree` - Get user's family tree
- `POST /api/tree/members` - Add family member
- `PATCH /api/tree/members/[memberId]` - Update family member
- `DELETE /api/tree/members/[memberId]` - Delete family member
- `POST /api/tree/relationships` - Add relationship
- `DELETE /api/tree/relationships/[id]` - Remove relationship

### Stories

- `GET /api/stories` - Get story feed (paginated)
- `POST /api/stories` - Create new story
- `GET /api/stories/[id]` - Get story details
- `PATCH /api/stories/[id]` - Update story
- `DELETE /api/stories/[id]` - Delete story
- `POST /api/stories/[id]/vote` - Vote on story
- `GET /api/stories/[id]/comments` - Get comments
- `POST /api/stories/[id]/comments` - Add comment
- `DELETE /api/stories/[id]/comments/[cid]` - Delete comment

### Connections

- `GET /api/connections` - Get user connections
- `POST /api/connections/request` - Send connection request
- `POST /api/connections/[requestId]/accept` - Accept request
- `POST /api/connections/[requestId]/reject` - Reject request

### Notifications

- `GET /api/notifications` - Get notifications (paginated)
- `POST /api/notifications/read` - Mark all as read

## Authentication Flow

1. User registers with username, email, password, and display name
2. Password is hashed with bcryptjs (10 salt rounds)
3. JWT token is created with 7-day expiry
4. Token stored in httpOnly, secure, sameSite=strict cookie
5. Middleware verifies token on protected routes
6. Token renewed on each request

## Validation

- **Client-side**: Zod schemas with React Hook Form
- **Server-side**: Re-validated on API routes
- All user input validated before database operations

## Database Models

- **User** - User profile and credentials
- **FamilyMember** - Family tree nodes
- **FamilyRelationship** - Relationships between members
- **ConnectionRequest** - Connection requests between users
- **Story** - User-generated stories
- **Vote** - Story votes (one per user per story)
- **Comment** - Story comments
- **Notification** - User notifications

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ httpOnly cookies (no localStorage)
- ✅ CSRF protection via sameSite cookies
- ✅ Input validation with Zod
- ✅ Protected API routes
- ✅ No sensitive data in API responses

## Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## Frontend Features Implemented

### ✅ Authentication

- Login page with email/password validation
- Register page with password strength requirements
- SweetAlert2 notifications for success/error
- Auto-redirect to feed on login
- Auto-redirect to login on logout

### ✅ User Interface

- Sidebar navigation
- User profile section in sidebar
- Responsive layout
- Logout button
- Icon-based navigation

### ✅ Alert System

- Success alerts
- Error alerts
- Info alerts
- Warning alerts
- Toast notifications
- Confirmation dialogs
- Loading states

### ✅ Placeholder Pages

- Feed page
- Family Tree page
- Connections page
- Notifications page

## Future Features

- [ ] User profiles and bios
- [ ] Advanced family tree visualization
- [ ] Photo uploads with UploadThing
- [ ] Story creation and editing
- [ ] Comments and voting system
- [ ] Search and discovery
- [ ] Dark mode
- [ ] Mobile app
- [ ] Export family tree
- [ ] Family events calendar

## Contributing

Follow these guidelines:

1. Use TypeScript strict mode
2. Always type parameters and return values
3. Use `type` for unions, `interface` for objects
4. Use React Server Components by default
5. Add `use client` only when needed (hooks, browser APIs)
6. Validate all user input with Zod
7. Use Tailwind utilities for styling
8. Comment only when necessary

## License

MIT

## Support

For issues and questions, please open an issue in the repository.
