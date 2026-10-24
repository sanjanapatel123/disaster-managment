# 🌍 Disaster Response Coordination Platform

**A backend-focused platform for disaster incident management, geospatial resource discovery, community reports, and real-time updates.**

Built with **Next.js · Node.js · Express · TypeScript · PostgreSQL · Prisma · Socket.IO**

[🚀 Features](#-features) · [⚙️ Setup](#️-setup) · [🔌 APIs](#-api-reference) · [🧪 Testing](#-testing)

---

## ✨ Features

- 🚨 **Disaster Management** — Create, view, update, delete, and filter incidents.
- 📍 **Location Resolution** — Resolve disaster locations using geocoding with fallback handling.
- 🏥 **Nearby Resources** — Search emergency resources by geographic distance.
- 🗣️ **Community Reports** — Fetch and normalize mock reports with priority classification.
- ⚡ **Real-Time Events** — Socket.IO events for disaster creation and updates.
- 🔐 **Role-Based Access** — JWT authentication with Admin and Contributor permissions.
- 🚀 **Caching** — In-memory TTL cache for community reports.
- 🧪 **Testing** — Vitest and Supertest coverage for APIs, validation, and business logic.
- 🎨 **Web Dashboard** — Separate responsive interfaces for Admin and Contributor.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Authentication | JWT |
| Real-time | Socket.IO |
| Validation | Zod |
| Testing | Vitest, Supertest |
| API Testing | Postman |

## 🏗️ Architecture

```text
Next.js Frontend
   ├── REST API (Axios)
   └── Socket.IO Client
            │
            ▼
Express + Node.js API
   ├── Authentication & Authorization
   ├── Disaster Management
   ├── Location Resolution
   ├── Nearby Resource Search
   ├── Community Reports + Cache
   └── Socket.IO Events
            │
            ▼
      PostgreSQL
       + Prisma
```

## ⚙️ Setup

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

Create `backend/.env` by copying `.env.example`. Fill in your local database URL and required secrets.

Example configuration — use the exact variable names expected by your backend:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/disaster_response_db"
JWT_SECRET="replace-with-a-secure-random-secret"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

### 3. Set up PostgreSQL

Create the database `disaster_response_db` in PostgreSQL, then run:

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Seed the Admin account

From the `backend/` directory:

```bash
npm run seed:admin
```

Use the credentials configured by your seed script to sign in as Admin.

**Optional resource seed:** If your project defines a resource-seeding script, run the corresponding command from `backend/package.json` to populate sample emergency resources.

### 5. Start the backend

```bash
npm run dev
```

API base URL: `http://localhost:5000`

Keep this terminal running.

### 6. Configure the frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

> **Tip:** Run backend and frontend in separate terminals. Restart the frontend after changing environment variables.

## 🔌 API Reference

Base URL: `http://localhost:5000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/auth/register` | Register Contributor |
| `POST` | `/auth/login` | Login and obtain JWT |
| `POST` | `/disasters` | Create disaster |
| `GET` | `/disasters` | List disasters |
| `GET` | `/disasters?tag=flood` | Filter by tag |
| `GET` | `/disasters/:id` | Get disaster details |
| `PATCH` | `/disasters/:id` | Update disaster |
| `DELETE` | `/disasters/:id` | Delete disaster (Admin only) |
| `GET` | `/disasters/:id/resources?lat=40.7128&lng=-74.0060&radius=10` | Find nearby resources |
| `GET` | `/disasters/:id/reports` | Retrieve community reports |

Protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

## 🔐 Authorization

| Action | Admin | Contributor | Public |
|---|:---:|:---:|:---:|
| View disasters | ✅ | ✅ | ✅ |
| Create disasters | ✅ | ✅ | ❌ |
| Update disasters | ✅ | ✅ | ❌ |
| Delete disasters | ✅ | ❌ | ❌ |

Admin accounts are created through the seed process; public registration creates Contributor accounts only.

## 🧠 Technical Decisions

- **PostgreSQL + Prisma:** Relational data model, migrations, and type-safe database access.
- **Geospatial search:** PostgreSQL distance calculations using latitude and longitude, with a radius filter to find nearby resources.
- **Location resolution:** Geocoding with fallback behavior when external location resolution is unavailable.
- **Caching:** Community report responses are cached in memory with a 60-second TTL to reduce repeated requests.
- **Failure handling:** External report failures return an error response instead of silently treating failed requests as successful.
- **Real-time updates:** Socket.IO broadcasts `disaster_created` and `disaster_updated` events.
- **Validation:** Zod validates incoming request data.

## 🧪 Testing

From the `backend/` directory:

```bash
npm test
npm run build
```

The test suite covers API behavior, community report handling, and priority classification.

### Postman

Import the collection and local environment from the `postman/` directory.

1. Start the backend.
2. Select the local Postman environment.
3. Register a Contributor and log in.
4. Test disaster creation, listing, updating, resource search, and reports.
5. Use an Admin JWT for delete authorization tests.

## 📁 Project Structure

```text
disaster-managment/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── seed-resources.ts
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
│   ├── src/app/
│   ├── src/components/
│   ├── src/hooks/
│   └── package.json
├── postman/
├── .gitignore
└── README.md
```

## ⚖️ Trade-offs & Limitations

- Community reports use mock data; real social-media integration is not required.
- The cache is in-memory and does not persist across restarts or share data between multiple server instances.
- Location resolution depends on the external geocoding service and its fallback behavior.
- Authentication is designed for the assignment, not as a complete production identity system.

## 🤖 AI Usage

- **Tool used:** ChatGPT.
- **Assistance:** Planning, implementation guidance, debugging, test ideas, and documentation.
- **Manual work:** Project setup, code integration and modification, configuration, execution, and testing.

AI-assisted code was reviewed and adapted to the project. The submitted implementation should be understood and verified by the author.

## 👩‍💻 Author

**Sanjana Patel**

🔗 [GitHub Repository](https://github.com/sanjanapatel123/disaster-managment)

---

<p align="center">
  <strong>Built with a focus on reliable APIs, clear architecture, and practical disaster response.</strong>
</p>
