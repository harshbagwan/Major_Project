@echo off
title Apollo Care - Hospital Queue Management System
echo =============================================================
echo   APOLLO CARE - HOSPITAL APPOINTMENT & QUEUE MANAGEMENT SYSTEM
echo =============================================================
echo Starting Backend Server and Frontend Client...
echo.

set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"

start "Apollo Care Backend Server (Port 5000)" cmd /k "cd /d "%~dp0server" && node src/server.js"
timeout /t 2 >nul
start "Apollo Care Frontend Client (Port 5173)" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo =============================================================
echo System Started Successfully!
echo - Web Dashboard & Booking: http://localhost:5173
echo - Backend REST & Socket:  http://localhost:5000
echo - Live Waiting Room TV:   http://localhost:5173 (Select TV Signage tab)
echo =============================================================
timeout /t 5
