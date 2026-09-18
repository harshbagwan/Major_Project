# 🚀 Complete Cloud Deployment Guide: Apollo Care
> **Target Stack:** GitHub + Vercel (Frontend) + Render / Railway (Backend) + Supabase (PostgreSQL)

Your local repository is already initialized and all 55 project files are committed. Follow these 3 simple steps to take your system live on the internet for free with zero DevOps overhead.

---

## Step 1: Push Your Code to GitHub

1. Open **[github.com/new](https://github.com/new)** in your browser and create a new repository:
   - **Repository name:** `hospital-queue-management` (or any name you like)
   - Set it to **Public** or **Private**
   - **Do NOT** check "Add a README file" (we already have a complete one).
   - Click **"Create repository"**.

2. Copy your repository URL (e.g., `https://github.com/YOUR_USERNAME/hospital-queue-management.git`).

3. Run the following commands in your terminal (or tell Antigravity your repo URL to run it for you!):
   ```powershell
   cd "d:\Major Project"
   git remote add origin https://github.com/YOUR_USERNAME/hospital-queue-management.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Deploy Backend to Render (Free Tier)

Render hosts your Node.js + Socket.io backend server for free with native WebSocket support.

1. Go to **[dashboard.render.com](https://dashboard.render.com/)** (sign up with GitHub if you haven't).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `hospital-queue-management` repo.
4. Fill in the settings:
   - **Name:** `apollo-care-backend`
   - **Region:** Choose the closest region (e.g. *Singapore* or *Frankfurt*)
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Instance Type:** `Free`
5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = `*`
   - `PORT` = `10000`
6. Click **"Deploy Web Service"**.
7. Once deployed, Render will provide your public backend URL, for example:
   `https://apollo-care-backend.onrender.com`

---

## Step 3: Deploy Frontend to Vercel (Free Tier)

Vercel provides lightning-fast global CDN hosting for your Vite + React application.

1. Go to **[vercel.com](https://vercel.com/)** and log in with your GitHub account.
2. Click **"Add New..."** → **Project**.
3. Locate your `hospital-queue-management` repository and click **Import**.
4. Configure Project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click *Edit* and select **`client`**.
5. Expand **Environment Variables** and add:
   - **Key:** `VITE_API_URL`
   - **Value:** Your Render backend URL from Step 2 (e.g. `https://apollo-care-backend.onrender.com` — *do not add trailing slash*).
6. Click **Deploy**.
7. Within 60 seconds, Vercel will give you your live production URL:
   `https://hospital-queue-management.vercel.app`

---

## Step 4 (Optional): Connect Cloud PostgreSQL (Supabase)

The system works out of the box with zero external configuration using the included persistent relational database. If you want to connect a live PostgreSQL cloud database for your clinic pilot:

1. Create a free project at **[supabase.com](https://supabase.com)**.
2. Go to **SQL Editor** → **New Query**.
3. Paste the ANSI schema from `d:\Major Project\server\src\config\db.js` (or click **"PostgreSQL Schema"** in the app's Analytics tab) and click **Run**.
4. Copy your PostgreSQL Connection String (`postgresql://postgres:...@db...supabase.co:5432/postgres`) from **Settings → Database**.
5. Add `DATABASE_URL` to your Render environment variables.

---

## 🎯 Verification Checklist for Live Pilot

Once deployed:
1. Open your Vercel URL on your mobile phone:
   - Book an appointment → check that the live token generates.
2. Open your Vercel URL on a clinic laptop/desktop:
   - Switch to **"Waiting Room TV"** mode.
3. Open your Vercel URL in another tab:
   - Switch to **"Doctor OPD Desk"** and click **"Call Next Patient"**.
   - Notice the Waiting Room TV chimes and displays the new token with sub-second real-time sync across the globe!
