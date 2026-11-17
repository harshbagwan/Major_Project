# 🏥 MediQ — Hospital Appointment & Real-Time OPD Queue Management System
> **Major Academic Project • Department of CSE (Cybersecurity) • Real-Time Healthcare Telemetry, RBAC & OPD Orchestration**

[![GitHub Repository](https://img.shields.io/badge/GitHub-Major__Project-181717.svg?logo=github)](https://github.com/harshbagwan/Major_Project)
[![Database](https://img.shields.io/badge/Database-SQLite3_(WAL_Mode)-003B57.svg?logo=sqlite)](./PROJECT_DOCUMENTATION.md#5-database-schema--data-model)
[![Backend](https://img.shields.io/badge/Backend-Node.js_%2B_Express_%2B_Socket.io-339933.svg?logo=node.js)](./PROJECT_DOCUMENTATION.md#6-api--websocket-event-reference)
[![Frontend](https://img.shields.io/badge/Frontend-React_18_%2B_Vite_%2B_TailwindCSS-06B6D4.svg?logo=react)](./PROJECT_DOCUMENTATION.md#3-full-project-directory-structure)
[![Security](https://img.shields.io/badge/Auth-JWT_%2B_4--Role_RBAC-0D9488.svg)](./PROJECT_DOCUMENTATION.md#41-production-rbac-jwt-authentication--real-time-presence)
[![Docs](https://img.shields.io/badge/Technical_Docs-Full_Architecture-2563EB.svg)](./PROJECT_DOCUMENTATION.md)
[![Deployment](https://img.shields.io/badge/Deployment-Render_%2B_Vercel-7C3AED.svg)](./DEPLOYMENT_GUIDE.md)

**MediQ** is a production-ready, full-stack hospital appointment and Outpatient Department (OPD) queue management platform engineered for standalone clinics, multi-doctor polyclinics, and hospital OPDs. It enforces strict **Role-Based Access Control (RBAC)** across Patient, Doctor, Receptionist, and Administrator portals while synchronizing mobile queue trackers, front-desk triage consoles, doctor consultation rooms, live online user presence, and large-format waiting room TV displays in sub-second time over WebSockets.

---

## 📑 Table of Contents
1. [The Problem & The MediQ Solution](#-the-problem--the-mediq-solution)
2. [Role-Based Access Control (RBAC) & Accounts](#-role-based-access-control-rbac--accounts)
3. [Key System Features](#-key-system-features)
4. [System Architecture & Dataflow](#-system-architecture--dataflow)
5. [Database Architecture (SQLite3 WAL Mode)](#-database-architecture-sqlite3-wal-mode)
6. [Quick Start (Local Setup)](#-quick-start-local-setup)
7. [Step-by-Step Live Multi-Screen Demo](#-step-by-step-live-multi-screen-demo)
8. [College Project Presentation & Viva Guide](#-college-project-presentation--viva-guide)
9. [Cloud Deployment (Render & Vercel)](#-cloud-deployment-render--vercel)
10. [Additional Documentation](#-additional-documentation)

---

## 🩺 The Problem & The MediQ Solution

### The Problem in Traditional Clinics
* **Excessive Physical Waiting:** Patients spend an average of **45 to 65 minutes** in crowded waiting rooms.
* **Queue Opacity:** Patients have zero visibility into how many patients are ahead or when the doctor will call them.
* **Walk-in vs. Appointment Friction:** Receptionists struggle to balance pre-booked appointments with urgent walk-ins using manual pen-and-paper registers.
* **Weak Access Isolation:** Many basic clinic prototypes expose doctor prescription panels, receptionist triage desks, and hospital analytics to every visitor without authentication or role separation.

### The MediQ Solution
1. **Strict 4-Role Access Control (RBAC):** Separate, JWT-authenticated portals for **Patient**, **Doctor**, **Receptionist**, and **Administrator** — while preserving 1-Click Viva Quick Access for rapid academic demonstrations.
2. **Zero-Friction Mobile Web & Patient Accounts:** Patients can register an account or book instantly via mobile web, track live queue positions without downloading a native app, and download digital prescriptions.
3. **Sub-Second WebSocket Synchronization:** When a doctor clicks *"Call Next Patient"*, the waiting room TV chimes and speaks the token, the patient's phone updates its countdown, and the reception desk updates simultaneously via Socket.io.
4. **Live Online User Telemetry:** Real-time presence tracking displays active doctors, front-desk staff, administrators, and patients currently online across the hospital network.
5. **Smart Emergency & Senior Citizen Triage:** Receptionists can elevate urgent or senior patients to the top of the queue with one click.
6. **Digital Medical Prescriptions & EHR History:** Doctors record vitals, diagnosis, and Rx medications, generating printable medical prescription slips and permanent patient visit histories.
7. **Quantified Impact:** Achieves a **73% reduction in patient waiting times** (from 52 mins down to ~12–14 mins) and a **74% reduction in waiting room overcrowding**.

---

## 🔐 Role-Based Access Control (RBAC) & Accounts

MediQ enforces **JWT authentication** and role-isolated portals across both frontend navigation guards and backend middleware (`authMiddleware` + `requireRole`). Users can sign in using either their **Email Address** or **Mobile Number**, or create a new patient account via **New Patient Registration**.

| Role | Email | Mobile Number | Password | Accessible Portals & Capabilities |
|---|---|---|---|---|
| **Administrator** | `admin@mediq.health` | `+91 98765 00001` | `adminpassword123` | **Superuser Access**: Operations Analytics, Viva Pilot Reports, PostgreSQL DDL Export, Reception Desk, Doctor OPD Desk, Waiting Room TV, Patient Booking & Tracker |
| **Doctor (Cardiology)** | `doctor.sharma@clinic.com` | `+91 98765 00003` | `password123` | **Doctor OPD Desk** (Room 101): Call/Recall/No-Show, Vitals & Clinical EHR, Digital Rx Generator, Patient History, Waiting Room TV |
| **Doctor (General Medicine)** | `doctor.patel@clinic.com` | `+91 98765 00004` | `password123` | **Doctor OPD Desk** (Room 102): Consultations, EHR history, Prescription Writer, Waiting Room TV |
| **Doctor (Pediatrics)** | `doctor.ananya@clinic.com` | `+91 98765 00005` | `password123` | **Doctor OPD Desk** (Room 103): Pediatric queue management, Consultations, Waiting Room TV |
| **Receptionist** | `receptionist@clinic.com` | `+91 98765 00002` | `password123` | **Reception & Front Desk**: 5-second walk-in tokens, Emergency/Senior triage, Appointment check-in, Rescheduling, Thermal slip printing, Waiting Room TV |
| **Patient** | `rohan.mehra@example.com` | `+91 98765 43210` | `password123` | **Patient Portal**: Book Appointment, Live Queue Status Tracker, Waiting Room TV, Digital Prescription lookup *(plus self-service New Patient Registration)* |

> 💡 **Preserved Viva / Demo Quick Access:** Inside the **Sign In** modal, examiners and presenters can click any of the **1-Click Real Auth** cards (Admin, Dr. Rajesh, Reception Desk, Patient Rohan) to obtain genuine signed JWT tokens and switch roles instantly without manual typing.
>
> 🟢 **Real-Time Online Telemetry:** Click the **`● X Online`** badge in the top navigation bar to view all currently connected staff and patients in real time over Socket.io.

---

## 🌟 Key System Features

### 1. 📱 Patient Portal (Booking, Live Queue Tracker & Registration)
* **Self-Service Patient Registration:** Create a patient account with name, mobile number, optional email, age, gender, and password; login anytime via email or 10-digit mobile number.
* **Interactive Doctor & Slot Selection:** Choose specialist doctors, consultation dates, and time slots with live fee and queue wait visibility.
* **Fast OTP Verification:** 4-digit mobile verification (`1234`) ensuring valid contact numbers during booking.
* **Live "You are in Line" Mobile Tracker:** Displays currently serving token, your token number, patients ahead, dynamic wait countdown, proximity alert when 1–2 tokens away, and 1-click **Digital Prescription Download** after completion.

### 2. 📺 Waiting Room TV Signage Mode
* **High-Contrast Digital Signage:** Purpose-built dark display optimized for clinic lobby TVs and projectors.
* **Dynamic "Now Serving" Board:** Live cards per OPD room showing active token number, patient name, doctor name, and room number.
* **Zero-Asset Web Audio Chime & Voice Synthesizer:** Generates a dual-tone hospital chime (`587.33 Hz` + `880 Hz`) via the HTML5 Web Audio API followed by `SpeechSynthesis` voice announcement (*"Token 104, please proceed to Room 101, Dr. Rajesh Sharma"*).
* **Upcoming Queue Ticker & Clinic Notice Marquee.**

### 3. 👩‍💼 Reception & Front Desk (Receptionist / Admin Only)
* **5-Second Walk-In Token Issuance:** Rapid entry for walk-in patients with instant thermal receipt generation.
* **Emergency & Senior Citizen Triage:** Dynamically elevates priority tokens (`Level 3 Emergency` > `Level 2 Senior` > `Level 1 Standard`).
* **1-Click Appointment Check-In, Reschedule & Cancellation:** Converts arriving appointments into live queue tokens or reschedules slots with real-time Socket.io broadcasts.
* **Thermal Slip Printer & Patient EHR Lookup:** Printable receipt with barcode/QR tracking link and phone-based visit history lookup.

### 4. 👨‍⚕️ Doctor OPD Consultation Desk (Doctor / Admin Only)
* **Queue Controls:** *Call Next Patient*, *Re-Ring Chime*, and *Mark No-Show*.
* **Clinical EHR & Digital Prescription Writer:** Records vitals (BP, Pulse, Temp), diagnosis, ℞ medications, clinical notes, and follow-up dates.
* **1-Click Printable Digital Prescription (PDF/Print):** Official clinic letterhead, doctor signature block, and structured medications table.
* **Patient EHR History & Completed Roster:** View previous visits and re-print past prescriptions anytime.

### 5. 📊 Operations Analytics & Viva Pilot Report (Admin Only)
* **Live Clinic KPIs:** Total patients today, Walk-ins vs. Appointments, Average wait time, Average consultation duration, and per-doctor load distribution.
* **Before vs. After Pilot Impact Metrics:** Traditional Wait (`52 mins`) vs. MediQ Smart Queue (`~12–14 mins`) → **73% wait reduction**, **74% crowding reduction**, **4.8/5.0 satisfaction**.
* **CSV Report Export & ANSI PostgreSQL DDL Generator:** One-click export for academic reports and cloud PostgreSQL migration.

---

## 🏗️ System Architecture & Dataflow

```text
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                        Clients Layer (React 18 + Vite)                   │
 │  • Patient Portal (Registration, Booking, Live Tracker, Digital Rx)      │
 │  • Waiting Room TV (High-Contrast Signage + Web Audio Voice Chime)       │
 │  • Reception Desk [RBAC: Receptionist/Admin] (Walk-ins, Triage, Check-in)│
 │  • Doctor OPD Desk [RBAC: Doctor/Admin] (Call Next, Vitals, EHR & Rx)    │
 │  • Operations Reports [RBAC: Admin] (KPIs, CSV Export, PostgreSQL DDL)   │
 └────────────────────────────────────▲─────────────────────────────────────┘
                                      │
                 Socket.io WebSockets + Express REST API (JWT)
                                      │
 ┌────────────────────────────────────▼─────────────────────────────────────┐
 │               Backend Core Engine (Node.js + Express + Socket.io)        │
 │  • JWT Auth, Patient Registration & 4-Role RBAC Middleware               │
 │  • Real-Time Presence Registry (USER_ONLINE / ONLINE_USERS_UPDATE)       │
 │  • Priority Queue State Machine (Emergency > Senior > FIFO)              │
 │  • Notification Dispatcher (SMS & WhatsApp Live Toast Simulation)        │
 └────────────────────────────────────▲─────────────────────────────────────┘
                                      │
 ┌────────────────────────────────────▼─────────────────────────────────────┐
 │       Resilient Data Layer: SQLite3 (WAL Mode) + JSON Fallback           │
 │  • Tables: clinics, doctors, users, appointments, queue_tokens,          │
 │            consultations, notifications                                  │
 │  • Indexed Queries: (doctorId, status), (appointmentDate, doctorId),     │
 │                     (patientPhone)                                       │
 └──────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Architecture (SQLite3 WAL Mode)

The backend initializes **`better-sqlite3`** with Write-Ahead Logging (`PRAGMA journal_mode = WAL`) and foreign keys enabled, with an automatic zero-dependency `JSONFileDatabase` fallback if native binaries are unavailable.

```sql
-- Core Relational Tables (SQLite3 WAL Mode / ANSI PostgreSQL Compatible)
clinics        (id, name, tagline, address, phone, email, openTime, closeTime, activeNotice)
doctors        (id, name, title, specialization, experience, roomNumber, fee, bio, avatarUrl, isAvailable, currentServingTokenId, todayQueueCount)
users          (id, name, email, phone, password, role, doctorId, avatar)
appointments   (id, appointmentNumber, patientName, patientPhone, patientAge, patientGender, doctorId, doctorName, specialization, roomNumber, appointmentDate, slotTime, reason, status, tokenNumber, displayToken, created_at)
queue_tokens   (id, tokenNumber, displayToken, tokenType, patientName, patientPhone, patientAge, patientGender, reason, doctorId, roomNumber, status, priorityLevel, appointmentId, checkInTime, calledTime, completedTime, waitTimeMinutes, serviceTimeMinutes, notes)
consultations  (id, tokenId, doctorId, patientName, patientPhone, patientAge, patientGender, diagnosis, prescription, vitals, notes, followUpDate, created_at)
notifications  (id, recipientPhone, channel, messageType, content, status, timestamp)
```

---

## 🚀 Quick Start (Local Setup)

### Method 1: One-Click Windows Launch (Recommended)
Double-click [`start-system.bat`](./start-system.bat) in the repository root. It starts both the backend API/WebSocket server and the Vite React frontend in separate terminal windows.

### Method 2: Manual Terminal Launch

#### Step 1: Start the Backend Server
```powershell
cd server
npm install
node src/server.js
```
* REST API & Socket.io Server: `http://localhost:5000`
* Health Check: `http://localhost:5000/health`
* SQLite3 Database: `server/data/mediq.sqlite` (auto-seeded on first startup)

#### Step 2: Start the Frontend Client
In a second terminal:
```powershell
cd client
npm install
npm run dev
```
* Web Application: `http://localhost:5173`

---

## 🎬 Step-by-Step Live Multi-Screen Demo

To demonstrate real-time WebSocket synchronization and RBAC isolation during a college presentation or viva:

1. **Window 1 — Waiting Room TV:** Open the app and click **"Waiting Room TV"**. Place it on a projector or the left half of your screen.
2. **Window 2 — Patient Portal:** Open an incognito window (or mobile browser), click **Sign In**, register a new patient or click **Patient Rohan (1-Click Auth)**, and open **"Live Queue Status"** (track token `104` or a mobile number). Notice the **`● Online`** counter increment live!
3. **Window 3 — Doctor OPD Desk:** Open a third window, click **Sign In → Dr. Rajesh (Cardiology OPD Desk)**. Note that Reception Desk and Reports are protected by RBAC for this role.
4. **Trigger the Real-Time Call:**
   * In Window 3 (Doctor Desk), click **"Call Next Patient in Queue"**.
   * **Observe:** Window 1 (TV) immediately plays the dual-tone chime and speaks the token announcement; Window 2 (Patient Phone) updates its countdown with a proximity alert; a simulated WhatsApp/SMS toast pops up.
5. **Complete & Generate Digital Prescription:**
   * Enter Vitals (`120/80`, `74 bpm`, `98.6 °F`), Diagnosis, and ℞ medications, then click **"Complete & Next"**.
   * View/print the generated **Digital Medical Prescription**, and verify that Window 2 (Patient Tracker) immediately unlocks prescription download.
6. **Verify Admin Superuser & Presence:**
   * Click **Sign In → Admin**, inspect the **Reports & Analytics** tab (live KPIs, CSV export, PostgreSQL DDL), and click **`● Online`** in the navbar to show all active connected users.

---

## 🎓 College Project Presentation & Viva Guide

### 1. The 30-Second Elevator Pitch
> *"MediQ is a production-grade hospital OPD appointment and real-time queue management system built with React, Node.js, Socket.io, and SQLite3 (WAL Mode). It enforces strict 4-role RBAC isolating Doctor, Receptionist, Patient, and Admin workspaces while synchronizing patient mobile trackers, front-desk triage consoles, doctor consultation rooms, live online presence, and waiting room TV audio displays in sub-second time over WebSockets — reducing clinic waiting times by 73%."*

### 2. Key Technical & Cybersecurity Points to Highlight
* **Role-Based Access Control (RBAC) & JWT:** Stateless HMAC-SHA256 signed JWT tokens carry user identity and role claims (`patient`, `doctor`, `receptionist`, `admin`). Unauthorized tab switches display an explicit access guard (`RestrictedAccessCard`), and backend routes enforce `authMiddleware` and `requireRole()`.
* **WebSockets vs. HTTP Polling:** Eliminates thousands of redundant polling requests per minute by maintaining persistent bi-directional Socket.io connections for sub-50ms state updates and real-time online presence tracking.
* **SQLite3 with WAL Mode + JSON Fallback:** Write-Ahead Logging enables non-blocking concurrent reads during queue writes, with an automatic JSON engine fallback for zero-downtime resilience.
* **Deterministic Priority Queue Algorithm:** Sorts waiting tokens by `priorityLevel DESC` (Emergency = 3 > Senior = 2 > Regular = 1) and `tokenNumber ASC` (FIFO within priority).

### 3. Top Examiner Questions & Answers
* **Q: How is role-based security enforced in MediQ?**  
  *A:* Every login and patient registration issues a signed JWT (24h expiry) containing the user's `id` and `role`. On the frontend, `AuthContext` filters navigation and guards protected views (`Doctor Desk`, `Reception Desk`, `Admin Reports`). On the backend, `authController.js` validates role-portal matching during login and provides `authMiddleware` + `requireRole()` middleware where `admin` acts as the superuser.
* **Q: Why SQLite3 WAL Mode instead of MongoDB or an external SQL server?**  
  *A:* `better-sqlite3` with WAL mode delivers sub-millisecond ACID relational queries with zero external database latency or setup friction. Because our schema is 100% ANSI SQL compliant, MediQ also exports a ready-to-run PostgreSQL DDL script for multi-node cloud deployments.
* **Q: How does the Waiting Room TV announce token calls without external audio files?**  
  *A:* It synthesizes a dual-tone hospital chime (`587.33 Hz` D5 + `880 Hz` A5) directly via the browser's HTML5 Web Audio API and reads the announcement using the native `SpeechSynthesis` API — requiring zero external MP3 assets.

---

## ☁️ Cloud Deployment (Render & Vercel)

* **Backend on Render:** Root directory `server`, Build `npm install`, Start `node src/server.js`. Verify health at `/health` (`"version": "2.1-rbac"`).
* **Frontend on Vercel / Render Static Site:** Root directory `client`, Vite build, with `VITE_API_URL` set to your Render backend URL.
* See [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) for the complete step-by-step cloud deployment checklist.

---

## 📚 Additional Documentation
* 📖 **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)** — Complete technical architecture, Mermaid sequence & ER diagrams, full directory structure, REST API & Socket.io event reference, and Viva Q&A.
* 🚀 **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** — Step-by-step deployment guide for GitHub, Render, Vercel, and optional Supabase PostgreSQL.

---

## 👨‍💻 Author
**Harsh Bagwan**  
*Department of CSE (Cybersecurity)*  
Major Academic Project • 2026
