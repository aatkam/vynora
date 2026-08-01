# Vynora — Full Stack Social Media Platform

Vynora is a feature-complete, medium-level social networking project for the CodeAlpha Full Stack Development internship. It covers the required profiles, posts, comments, likes, follows and database integration while remaining manageable as an internship portfolio project.

## Features

- JWT registration, login and protected routes
- Editable profiles with avatar, cover image, bio and location
- Follow and unfollow relationships stored in MongoDB
- Clickable Followers and Following lists
- Following feed and public Discover feed
- Paginated feed with Load More
- Text and image posts
- Dedicated post detail URLs
- Like and unlike posts
- Add and delete comments
- Share or copy post links
- Search users and post content
- User suggestions
- Follow, like and comment notifications
- Unread notification badges
- Responsive desktop and mobile interface
- Local image upload with a 5 MB limit
- Non-destructive optional demo seed
- Helmet, CORS, rate limiting and centralized API errors

## Technology

- Frontend: React, Vite, React Router, Axios, Lucide icons and responsive CSS
- Backend: Node.js, Express, MongoDB and Mongoose
- Authentication: JWT and bcryptjs
- Uploads: Multer local storage

## Requirements

- Node.js 22 recommended
- MongoDB Atlas or MongoDB Community Server
- npm

## Setup

### 1. Backend environment

Copy `backend/.env.example` to `backend/.env` and configure:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Generate a JWT secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Frontend environment

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install

```powershell
npm install
npm run install:all
```

### 4. Start

```powershell
npm run dev
```

Open:

```text
Frontend: http://localhost:5173
Backend health: http://localhost:5000/api/health
```

## Optional demo seed

You do not need seed data when you already have your own account. The seed command preserves non-demo users.

```powershell
npm run seed
```

Demo login:

```text
Email: demo@vynora.test
Password: password123
```

## Main API routes

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users

- `GET /api/users/search?q=`
- `GET /api/users/suggestions`
- `GET /api/users/:username`
- `GET /api/users/:username/posts`
- `GET /api/users/:username/connections/followers`
- `GET /api/users/:username/connections/following`
- `PATCH /api/users/me`
- `POST /api/users/:id/follow`

### Posts

- `GET /api/posts/feed?scope=following|all&page=1&limit=10`
- `GET /api/posts/search?q=`
- `GET /api/posts/:id`
- `POST /api/posts`
- `POST /api/posts/:id/like`
- `POST /api/posts/:id/comments`
- `DELETE /api/posts/:postId/comments/:commentId`
- `DELETE /api/posts/:id`

### Notifications and uploads

- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/read-all`
- `PATCH /api/notifications/:id/read`
- `POST /api/uploads`

## CodeAlpha submission

Recommended repository name:

```text
CodeAlpha_Vynora
```

Suggested title:

```text
Vynora — A Full Stack Social Networking Platform
```

Read `UPGRADE_GUIDE.md` for the exact changed files and testing checklist.
