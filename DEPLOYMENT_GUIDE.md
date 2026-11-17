# 🚀 Complete Cloud Deployment Guide: MediQ
> **Target Stack:** GitHub + Render (Backend Web Service) + Vercel / Render Static Site (Frontend) + SQLite3 WAL Mode (Optional Supabase PostgreSQL)

Follow these steps to deploy **MediQ** live on the internet for free with zero DevOps overhead.

---

## Step 1: Sync Your Code with GitHub

Your repository is hosted at **`https://github.com/harshbagwan/Major_Project`**. To push future updates:

```powershell
git add .
git commit -m "chore: update MediQ"
git push origin main
```

Both Render and Vercel automatically redeploy whenever you push to `main`.

---

## Step 2: Deploy Backend to Render (Free Tier)

Render hosts your Node.js + Express + Socket.io backend with native WebSocket support and auto-seeding SQLite3 WAL database.

1. Go to **[dashboard.render.com](https://dashboard.render.com/)** and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Connect **`harshbagwan/Major_Project`**.
4. Configure the service:
   - **Name:** `mediq-backend`
   - **Region:** Closest region (e.g., *Singapore* or *Oregon*)
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Instance Type:** `Free`
5. Add **Environment Variables**:
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = `*`
   - `PORT` = `10000`
   - `JWT_SECRET` = *(set a strong random string for production JWT signing)*
6. Click **"Deploy Web Service"**.
7. **Verify Backend Deployment:** Once live, open `https://<your-backend-url>/health` in your browser. You should see:
   ```json
   {
     "status": "healthy",
     "version": "2.1-rbac",
     "timestamp": "..."
   }
   ```
   > **Note:** On Render's free tier, the backend spins down after 15 minutes of inactivity and takes ~30 seconds to wake on the first request.

---

## Step 3: Deploy Frontend to Vercel (or Render Static Site)

### Option A: Vercel (Recommended)
1. Go to **[vercel.com](https://vercel.com/)** and sign in with GitHub.
2. Click **"Add New..."** → **Project** and import **`harshbagwan/Major_Project`**.
3. Configure:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
4. Add **Environment Variable**:
   - **Key:** `VITE_API_URL`
   - **Value:** Your Render backend URL (e.g. `https://mediq-backend.onrender.com` — **no trailing slash**).
5. Click **Deploy**.

### Option B: Render Static Site
1. In Render, click **New +** → **Static Site** and connect **`harshbagwan/Major_Project`**.
2. Configure:
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. Add **Environment Variable**:
   - `VITE_API_URL` = `https://<your-backend-url>` (no trailing slash).
4. Under **Redirects/Rewrites**, add a rewrite rule: `/*` → `/index.html` (`Rewrite`).

---

## Step 4 (Optional): Connect Cloud PostgreSQL (Supabase)

MediQ works out of the box with zero external database setup using embedded **SQLite3 (WAL Mode)** with automatic JSON fallback. If you want to migrate to a managed PostgreSQL database:

1. Create a free project at **[supabase.com](https://supabase.com)**.
2. Open **SQL Editor** → **New Query**.
3. Sign in to MediQ as **Admin** (`admin@mediq.health`), open **Operations Reports → PostgreSQL Schema**, copy the ANSI DDL (or fetch `GET /api/schema/postgresql`), and run it in Supabase.
4. Copy your PostgreSQL connection string from **Settings → Database** and add `DATABASE_URL` to your Render environment variables.

---

## 🎯 Post-Deployment Verification Checklist

Once both frontend and backend are deployed:
1. **Health Check:** Open `<backend-url>/health` and confirm `"status": "healthy"` and `"version": "2.1-rbac"`.
2. **Patient Registration & Login:**
   - Open your frontend URL → click **Sign In** → test **New Patient Registration** and login with email or 10-digit mobile number (or `rohan.mehra@example.com` / `password123`).
3. **Real-Time Online Presence:**
   - Confirm the **`● Online`** badge in the navbar increments as users sign in across multiple browser tabs/devices, and click it to view active staff & patients.
4. **Role-Based Access Control (RBAC):**
   - Sign in as **Patient** → verify Doctor Desk, Reception Desk, and Reports are restricted.
   - Sign in as **Doctor** (`doctor.sharma@clinic.com` / `password123`) → verify Doctor OPD Desk access.
   - Sign in as **Receptionist** (`receptionist@clinic.com` / `password123`) → verify Front Desk access.
   - Sign in as **Admin** (`admin@mediq.health` / `adminpassword123`) → verify full access to all portals & Analytics Reports.
5. **Live Multi-Screen Queue Sync:**
   - Open **Waiting Room TV** in Tab 1 and **Doctor OPD Desk** in Tab 2 → click **"Call Next Patient"** → confirm instant audio chime, voice announcement, and live tracker update.
