@echo off
title MediQ - Hospital Queue & OPD Management System
echo =============================================================
echo   MEDIQ - SMART HOSPITAL APPOINTMENT & OPD QUEUE SYSTEM
echo =============================================================
echo Starting Backend Server (SQLite3 + Socket.io) and Frontend Client (Vite)...
echo.

set "PATH=%LOCALAPPDATA%\Programs\nodejs;C:\Program Files\nodejs;%PATH%"

start "MediQ Backend Server (Port 5000)" cmd /k "cd /d "%~dp0server" && node src/server.js"
timeout /t 2 >nul
start "MediQ Frontend Client (Port 5173)" cmd /k "cd /d "%~dp0client" && npm.cmd run dev"

echo.
echo =============================================================
echo System Started Successfully!
echo - Web Dashboard & Booking: http://localhost:5173
echo - Backend REST & Socket:  http://localhost:5000
echo - Live Waiting Room TV:   http://localhost:5173 (Select TV Signage tab)
echo - Database Engine:        SQLite3 (data/mediq.sqlite with WAL mode)
echo =============================================================
timeout /t 5
