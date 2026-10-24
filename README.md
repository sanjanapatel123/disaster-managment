# Disaster Response Coordination Platform

A backend-focused disaster response platform built to manage disaster incidents, resolve locations, find nearby emergency resources, and retrieve community reports.

The project uses REST APIs, PostgreSQL, JWT authentication, caching, and Socket.IO for real-time updates.

## Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT and role-based authorization
- **Validation:** Zod
- **Real-time:** Socket.IO
- **Location:** OpenStreetMap Nominatim with fallback handling
- **Testing:** Vitest and Supertest
- **Frontend:** Reserved for future UI integration

## Project Structure

```text
disaster-response-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── seed-resources.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── frontend/
└── README.md
```

## Getting Started

### 1. Requirements

Install the following:

- Node.js
- npm
- PostgreSQL

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend/` directory by copying `.env.example`.

Configure your PostgreSQL database URL, JWT secret, and admin seed credentials.

Example:

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/disaster_response_db?schema=public"
JWT_SECRET="your-long-random-secret"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-strong-admin-password"
FRONTEND_URL="http://localhost:5173"
MOCK_REPORTS_FAILURE="false"
```

Use your own local credentials. Never commit `.env` or real secrets.

### 4. Set Up the Database

Create a PostgreSQL database named `disaster_response_db`, or update `DATABASE_URL` to use an existing database.

Generate the Prisma Client:

```bash
npx prisma generate
```

Apply database migrations:

```bash
npx prisma migrate dev --name init
```

If migrations already exist in the repository, use the existing migration history instead of creating a duplicate initial migration.

### 5. Seed the Admin User

```bash
npm run seed:admin
```

This creates or updates the admin account using the credentials configured in `.env`.

### 6. Start the Backend

```bash
npm run dev
```

The API runs at:

`http://localhost:5000`

Check the server and database connection:

`GET http://localhost:5000/health`

### 7. Add Sample Resources (Optional)

After creating a disaster, run:

```bash
npm run seed:resources
```

This adds sample emergency resources for the latest disaster in the database. Run it only when sample data is needed.

## Main Features

### Disaster Management

| Method | Endpoint               | Description       |
| ------ | ---------------------- | ----------------- |
| POST   | `/disasters`           | Create a disaster |
| GET    | `/disasters`           | List disasters    |
| GET    | `/disasters?tag=flood` | Filter by tag     |
| GET    | `/disasters/:id`       | Get a disaster    |
| PATCH  | `/disasters/:id`       | Update a disaster |
| DELETE | `/disasters/:id`       | Delete a disaster |

### Location Resolution

When a disaster is created, the system attempts to identify a location from its description and resolve it to latitude and longitude using OpenStreetMap Nominatim.

Fallback handling helps the application respond when a location cannot be resolved. External geocoding may depend on network availability and provider limits.

### Nearby Resources

```http
GET /disasters/:id/resources?lat=40.758&lng=-73.986&radius=10
```

The API returns resources within the requested radius. It uses a Haversine distance calculation in PostgreSQL to calculate distances in kilometers and filter nearby resources.

### Community Reports

```http
GET /disasters/:id/reports
```

The API retrieves mock community reports, normalizes their fields, and assigns each report a `HIGH`, `MEDIUM`, or `LOW` priority using keyword-based rules.

The mock service makes integration and failure scenarios testable without requiring real social-media API credentials.

### Caching

Community reports are cached in memory for **60 seconds per disaster**.

- Cache hit: return cached reports.
- Cache miss: fetch reports from the mock service, normalize them, and store them.
- External service failure: return a gateway error instead of silently treating the request as successful.

The in-memory cache is simple for this assignment but is not shared between server instances and is cleared when the process restarts.

### Real-Time Updates

The Socket.IO server broadcasts:

- `disaster_created` when a disaster is created.
- `disaster_updated` when a disaster is updated.

A test client is available at `backend/src/test-socket.ts`.

Start the backend first, then run the client in another terminal:

```bash
npx tsx src/test-socket.ts
```

Create or update a disaster using the API and observe the event payload in the client terminal.

## Authentication and Authorization

Register a contributor:

```http
POST /auth/register
```

Log in:

```http
POST /auth/login
```

Use the returned JWT in protected requests:

```http
Authorization: Bearer <token>
```

Permissions:

| Action           | Admin | Contributor |
| ---------------- | ----- | ----------- |
| Read disasters   | Yes   | Yes         |
| Create disasters | Yes   | Yes         |
| Update disasters | Yes   | Yes         |
| Delete disasters | Yes   | No          |

Public registration creates Contributor accounts; users cannot assign themselves the Admin role.

## Testing

Run the automated tests:

```bash
npm test
```

Build the TypeScript project:

```bash
npm run build
```

The test suite covers API responses, input validation, authorization, community report caching, external-service failure handling, and priority classification.

## Architecture

```text
Client / Postman
       |
       v
Express REST API
       |
       +--> JWT Authentication and Authorization
       |
       +--> Zod Validation
       |
       +--> Controllers and Services
       |       |
       |       +--> PostgreSQL via Prisma
       |       +--> Location Geocoding Service
       |       +--> Community Reports and TTL Cache
       |       +--> Nearby Resource Search
       |
       +--> Socket.IO Real-Time Events
```

## Technical Decisions and Trade-offs

- **PostgreSQL:** provides relational data integrity for users, disasters, resources, and reports.
- **Prisma:** simplifies database access and schema management.
- **Haversine calculation:** provides radius-based resource filtering without requiring a separate geospatial extension.
- **Nominatim:** provides location resolution without requiring a paid geocoding API key.
- **Mock community reports:** allow external integration and failure handling to be demonstrated without third-party credentials.
- **In-memory caching:** keeps implementation simple, but does not support shared caching across multiple server instances.
- **Socket.IO:** broadcasts updates to connected clients; events are not persisted for clients that are disconnected.
- **Rule-based priority classification:** is lightweight and easy to test, but keyword matching is not a substitute for verified emergency assessment.

## Limitations and Future Improvements

- Integrate a real community-report provider when access and credentials are available.
- Use Redis for shared caching in a multi-instance deployment.
- Consider PostGIS for larger-scale geospatial queries.
- Add durable event delivery and more integration tests for production use.
- Build a frontend for visual disaster and resource management.

## AI Usage

**Tool used:** ChatGPT.

**What it helped with:** Implementation guidance, debugging, test development, and documentation.

**What was manually implemented and verified:** Project configuration, database models and migrations, API integration, authentication, location and resource handling, caching, real-time events, and automated tests were run and checked during development.

## API Documentation

The Postman collection is included separately for testing the API endpoints. Configure the collection's `baseUrl`, log in to obtain a JWT, and use the token for protected requests.

## Security

Do not commit `.env`, database passwords, JWT secrets, or other credentials. Use `.env.example` to document required configuration without exposing real values.
