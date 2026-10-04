# Task Manager API

A backend revision project built with Express, JWT authentication, bcrypt, and Supabase PostgreSQL.

The purpose of this project is to practice building a complete REST API from scratch, including authentication, authorization, middleware, CRUD operations, database interaction, validation, and error handling.

## Tech Stack

• Node.js  
• Express.js  
• JWT  
• bcrypt  
• dotenv  
• Supabase  
• PostgreSQL

---

# 1. Project Architecture

The application follows this general flow:

Client

↓

Express Server

↓

Middleware

↓

Authentication / Authorization

↓

Controllers / Business Logic

↓

Supabase

↓

PostgreSQL

The application should be structured so that routing, middleware, business logic, and database interaction are not unnecessarily mixed together.

Suggested structure:

```text
task-manager-api/
│
├── src/
│   ├── server.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── task.routes.js
│   │
│   ├── middleware/
│   │   └── auth.middleware.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── task.controller.js
│   │
│   └── util/
│       └── db/
│           └── supabaseClient.js
│
├── .env
├── .gitignore
├── package.json
└── package-lock.json
```

The exact structure is flexible.

---

# 2. Environment Variables

The application should use environment variables for configuration.

Required variables:

```text
PORT=3000
JWT_SECRET=...
SUPABASE_URL=...
SUPABASE_KEY=...
```

The `.env` file must not be committed to Git.

---

# 3. Database

Supabase will be used as the PostgreSQL backend.

The application requires two primary tables.

## Users

Table name:

```text
users
```

Fields:

```text
id
name
email
password
created_at
```

Suggested types:

```text
id          uuid
name        text
email       text
password    text
created_at  timestamptz
```

`id` should be the primary key.

Passwords must always be stored as bcrypt hashes.

Plaintext passwords must never be stored in the database.

---

# 4. Tasks

Table name:

```text
tasks
```

Fields:

```text
id
user_id
title
description
completed
created_at
updated_at
```

Suggested types:

```text
id          uuid
user_id     uuid
title       text
description text
completed   boolean
created_at  timestamptz
updated_at  timestamptz
```

`user_id` references:

```text
users.id
```

Each task belongs to exactly one user.

Conceptually:

```text
User
│
├── Task
├── Task
└── Task
```

---

# 5. Authentication

Authentication is implemented manually using JWT.

Supabase is being used as the database, not as the authentication system for this exercise.

The authentication flow is:

```text
Register
   ↓
Hash password
   ↓
Store user
   ↓
Login
   ↓
Verify password
   ↓
Generate JWT
   ↓
Client receives JWT
```

---

# 6. Register

Endpoint:

```text
POST /auth/register
```

Request body:

```json
{
  "name": "Rahul",
  "email": "rahul@example.com",
  "password": "secret123"
}
```

The server should:

1. Extract the user information from the request body.
2. Validate the required fields.
3. Check whether the email already exists.
4. Hash the password using bcrypt.
5. Store the user in Supabase.
6. Never return the plaintext password.
7. Return an appropriate success response.

Expected success status:

```text
201 Created
```

Example response:

```json
{
  "message": "User registered successfully"
}
```

---

# 7. Login

Endpoint:

```text
POST /auth/login
```

Request:

```json
{
  "email": "rahul@example.com",
  "password": "secret123"
}
```

The server should:

1. Find the user by email.
2. Compare the supplied password against the bcrypt hash.
3. Reject invalid credentials.
4. Generate a JWT for a valid user.
5. Return the token.

JWT payload should contain enough information to identify the authenticated user.

Example:

```json
{
  "userId": "user-id",
  "email": "rahul@example.com"
}
```

Example response:

```json
{
  "token": "JWT_TOKEN"
}
```

---

# 8. JWT Authentication Middleware

Create authentication middleware responsible for protecting private routes.

The client sends:

```text
Authorization: Bearer <token>
```

The middleware should:

1. Read the `Authorization` header.
2. Verify that the header contains a Bearer token.
3. Extract the token.
4. Verify the JWT using the application's secret.
5. Extract the user information from the decoded token.
6. Attach the authenticated user to the request.
7. Call `next()`.

The authenticated request should eventually contain something like:

```js
req.user;
```

with:

```js
{
  (userId, email);
}
```

Invalid or missing authentication should result in:

```text
401 Unauthorized
```

---

# 9. Task API

All task endpoints require authentication.

The client must provide:

```text
Authorization: Bearer <token>
```

---

## Create Task

Endpoint:

```text
POST /tasks
```

Request:

```json
{
  "title": "Learn Redux",
  "description": "Practice Redux Toolkit",
  "completed": false
}
```

The authenticated user's ID must come from:

```text
req.user.userId
```

The client must not be allowed to specify another user's ID.

The server associates the new task with the authenticated user.

Expected status:

```text
201 Created
```

---

# 10. Get All My Tasks

Endpoint:

```text
GET /tasks
```

Return only tasks belonging to the authenticated user.

The database query should effectively behave like:

```text
WHERE user_id = authenticated_user_id
```

Example:

```text
Rahul
├── Learn Express
├── Learn Redux
└── Build API

Bob
├── Learn Python
└── Build Flask API
```

When Rahul requests:

```text
GET /tasks
```

he should only receive his own tasks.

---

# 11. Get One Task

Endpoint:

```text
GET /tasks/:id
```

The server must verify:

1. The task exists.
2. The task belongs to the authenticated user.

Possible outcomes:

```text
Task doesn't exist
→ 404 Not Found

Task exists but belongs to another user
→ 403 Forbidden

Task belongs to authenticated user
→ 200 OK
```

This is an important authorization exercise.

---

# 12. Update Task

Endpoint:

```text
PATCH /tasks/:id
```

Example:

```json
{
  "completed": true
}
```

Or:

```json
{
  "title": "Learn Redux Toolkit",
  "description": "Practice Redux Toolkit properly"
}
```

The endpoint should support partial updates.

The server must verify ownership before updating the task.

Flow:

```text
Find task
   ↓
Does it exist?
   ↓
Does it belong to current user?
   ↓
Update
```

---

# 13. Delete Task

Endpoint:

```text
DELETE /tasks/:id
```

The server must verify that the task belongs to the authenticated user before deleting it.

Possible outcomes:

```text
Task doesn't exist
→ 404

Task belongs to another user
→ 403

Task belongs to current user
→ Delete
```

Example response:

```json
{
  "message": "Task deleted successfully"
}
```

---

# 14. HTTP Status Codes

Use status codes intentionally.

| Situation                        | Status |
| -------------------------------- | -----: |
| Successful request               |    200 |
| Resource created                 |    201 |
| Invalid request                  |    400 |
| Missing/invalid authentication   |    401 |
| Authenticated but not authorized |    403 |
| Resource not found               |    404 |
| Unexpected server/database error |    500 |

---

# 15. Validation

Registration should validate:

```text
name
email
password
```

Task creation should validate:

```text
title
```

The API should reject obviously invalid requests instead of blindly sending them to the database.

---

# 16. Error Handling

The API should return meaningful errors.

Examples:

```json
{
  "error": "Invalid credentials"
}
```

```json
{
  "error": "Task not found"
}
```

```json
{
  "error": "Unauthorized"
}
```

Database errors should not cause requests to hang indefinitely.

Every request should eventually receive a response.

---

# 17. API Overview

The finished API should expose:

```text
AUTH

POST   /auth/register
POST   /auth/login


TASKS

POST   /tasks
GET    /tasks
GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id
```

Authentication:

```text
/register → Public
/login    → Public

/tasks           → Protected
/tasks/:id       → Protected
```

---

# 18. Complete Request Flow

A protected request should conceptually look like:

```text
Client
  │
  │ Authorization: Bearer JWT
  ▼
Express Router
  │
  ▼
JWT Middleware
  │
  ├── Invalid → 401
  │
  ▼
req.user
  │
  ▼
Task Controller
  │
  ├── Validate request
  │
  ├── Check ownership
  │
  ▼
Supabase
  │
  ▼
PostgreSQL
  │
  ▼
Response
```

---

# 19. Testing Checklist

Test the complete flow manually.

## Authentication

[ ] Register a user

[ ] Try registering the same email again

[ ] Login with correct credentials

[ ] Login with incorrect password

[ ] Login with nonexistent email

[ ] Receive JWT

---

## Middleware

[ ] Request protected route without token

[ ] Request protected route with malformed token

[ ] Request protected route with invalid token

[ ] Request protected route with valid token

[ ] Verify `req.user` contains the authenticated user

---

## CRUD

[ ] Create task

[ ] Get all tasks

[ ] Get individual task

[ ] Update task

[ ] Delete task

---

## Authorization

Create two users.

For example:

```text
Rahul
Bob
```

Create tasks for both users.

Verify:

[ ] Rahul can access Rahul's tasks

[ ] Bob can access Bob's tasks

[ ] Rahul cannot access Bob's task

[ ] Bob cannot access Rahul's task

[ ] Rahul's `/tasks` doesn't return Bob's tasks

[ ] Bob's `/tasks` doesn't return Rahul's tasks

---

# 20. Bonus Features

Once the core API works, optionally add:

### Token expiration

JWT expires after a defined period.

### Pagination

```text
GET /tasks?page=1&limit=10
```

### Filtering

```text
GET /tasks?completed=true
```

### Searching

```text
GET /tasks?search=redux
```

### Sorting

```text
GET /tasks?sort=created_at&order=desc
```

### Task status

Instead of only:

```text
completed: true/false
```

experiment with:

```text
todo
in_progress
completed
```

---

# Definition of Done

The project is considered complete when:

1. Users can register.
2. Passwords are hashed using bcrypt.
3. Users can log in.
4. Login returns a JWT.
5. Protected routes require a valid JWT.
6. The middleware attaches the authenticated user to `req.user`.
7. Users can create tasks.
8. Users can read their own tasks.
9. Users can update their own tasks.
10. Users can delete their own tasks.
11. Users cannot access another user's tasks.
12. Data persists in Supabase/PostgreSQL.
13. Appropriate HTTP status codes are returned.
14. Invalid requests are handled without hanging the request.
15. Secrets are stored in environment variables.

## The Main Learning Goal

The project isn't really about building a task manager.

The actual goal is to be comfortable with this chain:

```text
HTTP Request
     ↓
Express Router
     ↓
Middleware
     ↓
JWT Verification
     ↓
req.user
     ↓
Authorization
     ↓
Controller
     ↓
Database Query
     ↓
HTTP Response
```

Once you can build that flow without constantly referring to a tutorial, you've got the core of a pretty solid Express backend workflow down.
