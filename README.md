# 🌍 Disaster Response Coordination Platform

**A real-time disaster management platform for coordinating emergency incidents, nearby resources, and community reports.**

Built with **Next.js, TypeScript, Node.js, Express, PostgreSQL, Prisma, and Socket.IO.**

---

## ✨ Key Features

- 🚨 **Disaster Management** — Create, view, update, and manage disaster incidents.
- 🔐 **Authentication & Authorization** — JWT-based authentication with Admin and Contributor roles.
- 📍 **Location Intelligence** — Resolve disaster locations and search nearby emergency resources using geographic coordinates.
- 🏥 **Nearby Resources** — Find shelters, hospitals, food, water, and rescue facilities within a specified radius.
- 🗣️ **Community Reports** — Retrieve community reports with priority classification: HIGH, MEDIUM, and LOW.
- ⚡ **Real-Time Updates** — Socket.IO events for disaster creation and updates.
- 🧠 **Caching** — In-memory TTL caching for community reports to reduce repeated external requests.
- 🛡️ **Input Validation** — Request validation using Zod.
- 🧪 **Automated Testing** — Vitest and Supertest tests for API behavior, report handling, and priority classification.
- 🎨 **Responsive Dashboard** — Separate Admin and Contributor interfaces with reusable components and notifications.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| UI & Feedback | Lucide React, Sonner |
| API Communication | Axios |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Authentication | JWT |
| Real-Time Communication | Socket.IO |
| Validation | Zod |
| Testing | Vitest, Supertest |

## 🏗️ Architecture

```text
Frontend (Next.js)
       │
       ├── REST API (Axios)
       └── Socket.IO Client
                │
                ▼
Backend (Node.js + Express)
       │
       ├── Authentication & Authorization
       ├── Disaster Management
       ├── Location Services
       ├── Nearby Resources
       ├── Community Reports
       └── Real-Time Event Broadcasting
                │
                ▼
        PostgreSQL + Prisma
```

## 👥 User Roles

| Capability | Admin | Contributor | Public |
|---|:---:|:---:|:---:|
| View disasters | ✅ | ✅ | ✅ |
| Create disasters | ✅ | ✅ | — |
| Update disasters | ✅ | ✅ | — |
| Delete disasters | ✅ | — | — |
| Access admin dashboard | ✅ | — | — |
| Access contributor dashboard | — | ✅ | — |

**Security:** Admin accounts are created through the backend seed process, not public registration. Protected API operations require JWT authentication and role authorization.

## 🚀 Getting Started

### Prerequisites

- Node.js 22 or compatible version
- npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/sanjanapatel123/disaster-managment.git
cd disaster-managment
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` and configure your local database connection and required secrets.

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/disaster_response_db"
JWT_SECRET="replace-with-a-secure-random-secret"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

Use the variable names required by the actual backend configuration. Never commit real secrets.

### 3. Set up the database

```bash
npx prisma migrate deploy
npx prisma generate
```

Create the Admin account using the configured seed script:

```bash
npm run seed:admin
```

If your local setup requires resource seed data, run the resource seed script defined in the backend's `package.json`.

### 4. Start the backend

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

Health check: `GET /health`

### 5. Configure and start the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3000`.

> Keep PostgreSQL and the backend running while testing the frontend. Verify the exact npm scripts in each package's `package.json`.

## 🔌 API Reference

Base URL: `http://localhost:5000`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check API and database connectivity |
| POST | `/auth/register` | Register a Contributor |
| POST | `/auth/login` | Authenticate and obtain a JWT |
| GET | `/disasters` | List disasters |
| GET | `/disasters?tag=flood` | Filter disasters by tag |
| POST | `/disasters` | Create a disaster |
| GET | `/disasters/:id` | Get a disaster by ID |
| PATCH | `/disasters/:id` | Update a disaster |
| DELETE | `/disasters/:id` | Delete a disaster (Admin only) |
| GET | `/disasters/:id/resources?lat=40.7128&lng=-74.0060&radius=10` | Find nearby resources |
| GET | `/disasters/:id/reports` | Retrieve community reports |

Protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

## 🧪 Testing

From the backend directory:

```bash
npm test
npm run build
```

Use the included Postman collection to test authentication, disaster operations, nearby resources, and community reports.

## ⚙️ Implementation Notes

- **Geospatial search:** Nearby resources are filtered using geographic coordinates and distance calculations in PostgreSQL.
- **External data resilience:** Community reports use mock data, with an in-memory cache and a configurable failure mode for testing.
- **Priority classification:** Community reports are categorized as HIGH, MEDIUM, or LOW.
- **Real-time communication:** The backend broadcasts `disaster_created` and `disaster_updated` events through Socket.IO.
- **Database evolution:** Prisma migrations are maintained in the backend project.

## 📁 Project Structure

```text
disaster-managment/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── validators/
│   ├── tests/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   └── package.json
├── postman/
├── .gitignore
└── README.md
```

## 🔒 Security & Configuration

- Keep `.env` and `.env.local` out of version control.
- Use a strong, unique JWT secret.
- Never commit database passwords or production credentials.
- Public registration creates Contributors only.
- Enforce authorization on the backend; frontend route guards are not a substitute for API security.

## 👩‍💻 Author

**Sanjana Patel**

[GitHub Repository](https://github.com/sanjanapatel123/disaster-managment)

---

<p align="center">
  <strong>Built to support faster coordination and better disaster response.</strong>
</p>
