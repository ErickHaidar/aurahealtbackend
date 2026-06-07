# Work Plan: Aura Health Backend Deployment

This work plan outlines the complete, step-by-step procedure to deploy the Aura Health Express.js backend for free using Render, Supabase (PostgreSQL & Object Storage), and Upstash (Redis).

## 1. System Topology & Architecture
The deployed system will consist of the following components:
- **Application Server**: Node.js Express application hosted on Render (Web Service Free Tier). It will bind dynamically to the port provided by Render and support persistent connections (WebSockets) and cron jobs.
- **Database (PostgreSQL)**: Supabase PostgreSQL database.
- **Object Storage**: Supabase Storage Buckets for avatar and post images.
- **Cache & Rate Limiting (Redis)**: Upstash Redis (Free Tier).
- **External APIs**: Gemini & Groq APIs.
- **Keep-Alive Monitor**: external ping service (cron-job.org) to prevent the Render Free Tier from sleeping, ensuring WebSockets and cron jobs stay active.

## 2. Environment Variables Mapping
The following environment variables must be configured on Render:
- `PORT`: Automatically managed by Render.
- `NODE_ENV`: `production`
- `ALLOWED_ORIGINS`: Production URL of the frontend (and development URLs if needed, separated by commas).
- `DATABASE_URL`: Connection string to Supabase Connection Pooler (Transaction Mode, port 6543).
- `DIRECT_URL`: Connection string to Supabase Direct Database Connection (Session Mode, port 5432) for running Prisma migrations.
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`: Secure random strings (min 32 characters).
- `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES`: E.g., `15m` and `7d`.
- `REDIS_URL`: Upstash Redis Connection URL (starts with `rediss://`).
- `SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_KEY`: Supabase service role API key.
- `SUPABASE_BUCKET_AVATARS` / `SUPABASE_BUCKET_POSTS`: `avatars` and `posts` (or custom bucket names).
- `AI_PROVIDER`: `auto`
- `AI_GEMINI_MODEL`: `gemini-flash-lite-latest`
- `AI_GEMINI_KEY_1`: Gemini API key.
- `AI_GROQ_KEY`: Groq API key.
- `AI_GROQ_MODEL`: `llama-3.1-8b-instant`
- `OTP_EXPIRES_SECONDS`: `300`

---

## 3. Implementation Tasks

### - [x] Task 1: Codebase Preparation (Direct URL for Prisma Migrations)
- **Objective**: Add `directUrl` support in `src/prisma/schema.prisma` so Prisma can use the session pool for schema migrations and transaction pool for runtime connections.
- **Action**:
  - Open `src/prisma/schema.prisma`.
  - Update the `datasource db` block:
    ```prisma
    datasource db {
      provider  = "postgresql"
      url       = env("DATABASE_URL")
      directUrl = env("DIRECT_URL")
    }
    ```
  - Verify syntax with `npx prisma validate --schema=src/prisma/schema.prisma`.

### - [x] Task 2: Supabase Credentials Gathering
- **Objective**: Get the transaction connection string, direct connection string, and Storage credentials.
- **Action**:
  - Go to your Supabase Project Settings > Database.
  - **DATABASE_URL (Transaction Pooler)**:
    - Locate Connection Pooler settings.
    - Set mode to **Transaction**.
    - Copy the URI (port 6543) and replace the password placeholder.
  - **DIRECT_URL (Direct Connection)**:
    - Locate Connection Pooler settings.
    - Set mode to **Session** OR copy the Direct Connection string (port 5432).
  - **SUPABASE_URL & SUPABASE_SERVICE_KEY**:
    - Go to Project Settings > API.
    - Copy the `Project URL` (`SUPABASE_URL`) and `service_role` secret (`SUPABASE_SERVICE_KEY`).
  - **Storage Buckets**:
    - Go to Storage tab, ensure `avatars` and `posts` buckets are created and set to public if needed.

### - [x] Task 3: Upstash Redis Provisioning
- **Objective**: Provision a free Redis cache instance on Upstash.
- **Action**:
  - Go to [Upstash Console](https://console.upstash.com/) and log in (e.g., via GitHub).
  - Create a new Redis Database. Select your preferred region (ideally closest to your Render server region, e.g. Singapore or US East).
  - Copy the Redis Connection URL (`REDIS_URL`) in the format `rediss://default:password@host:port`.

### - [x] Task 4: Render Web Service Configuration & Deploy
- **Objective**: Host the Node.js Express server on Render connected to your Git repository.
- **Action**:
  - Connect your GitHub account to [Render Dashboard](https://dashboard.render.com/).
  - Click **New +** > **Web Service**.
  - Choose your backend repository.
  - Set settings:
    - **Name**: `aura-health-backend` (or custom name).
    - **Region**: Nearest to your database and users (e.g., Singapore).
    - **Branch**: `main`
    - **Language**: `Node`
    - **Build Command**: `npm install && npx prisma generate --schema=src/prisma/schema.prisma && npx prisma migrate deploy --schema=src/prisma/schema.prisma`
    - **Start Command**: `node src/server.js` (or `npm start`)
    - **Instance Type**: `Free`
  - In **Advanced**, add all environment variables defined in Section 2.
  - Trigger the first deployment and watch the logs for build & runtime success.

### - [x] Task 5: Configure Sleep Prevention
- **Objective**: Prevent Render Free Tier from going to sleep to preserve Socket.io connections and background Cron jobs.
- **Action**:
  - Create a free account on [cron-job.org](https://cron-job.org/).
  - Set up a new cron job.
  - **URL**: `https://your-app-name.onrender.com/health` (replace with your Render URL).
  - **Schedule**: Every 10 minutes.
  - Save the job and verify the history showing success status.

---

## 4. Final Verification Wave
After deployment is complete, the following checks must be executed to ensure the system is fully functional:

### Verification Setup
- Set the target host base URL variable:
  ```bash
  export TARGET_URL="https://your-app-name.onrender.com"
  ```

### QA Scenarios
1. **Health Check End-to-End**
   - Command:
     ```bash
     curl -i -X GET "$TARGET_URL/health"
     ```
   - Expected Output: `200 OK` with JSON matching:
     ```json
     {
       "success": true,
       "message": "Aura Health API is running",
       "timestamp": "..."
     }
     ```

2. **CORS Headers Check**
   - Command:
     ```bash
     curl -i -H "Origin: https://example.com" -X GET "$TARGET_URL/health"
     ```
   - Expected Output:
     - If `https://example.com` is in `ALLOWED_ORIGINS`, response should contain `Access-Control-Allow-Origin: https://example.com` and `200 OK`.
     - If not, response should block access or return CORS error.

3. **Realtime Socket Connection Check**
   - Use a simple node client script or Postman to connect to WebSocket:
     ```bash
     node -e "const io = require('socket.io-client'); const socket = io('$TARGET_URL'); socket.on('connect', () => { console.log('Connected!'); process.exit(0); }); socket.on('connect_error', (err) => { console.error(err); process.exit(1); })"
     ```
   - Expected Output: `Connected!` in stdout.

4. **Verify Render Sleep Prevention**
   - Configure a cron job at `cron-job.org` targeting `https://your-app-name.onrender.com/health` every 10 minutes. Check the dashboard logs on Render to ensure no spin-down occurred.

---

## 5. Execution Confirmation
This deployment plan is complete and ready. Once reviewed, run `/start-work` to begin execution.
