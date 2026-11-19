@echo off
chcp 65001 >nul
title Notfall Kollegium - Testserver
cd /d "%~dp0"

where node >nul 2>nul || (echo Node.js fehlt. Bitte von https://nodejs.org die LTS-Version installieren. & pause & exit /b 1)
where cloudflared >nul 2>nul || (echo cloudflared fehlt. Bitte in der Eingabeaufforderung ausfuehren:  winget install --id Cloudflare.cloudflared & pause & exit /b 1)

echo Starte den Notfall-Server ...
start "Notfall-Server (Fenster offen lassen)" cmd /k node server.js
timeout /t 3 /nobreak >nul

echo.
echo Starte den Tunnel. Gleich erscheint eine Adresse wie
echo     https://irgendwas-zufaelliges.trycloudflare.com
echo Diese Adresse auf dem iPhone in Safari oeffnen.
echo Die Zugangscodes stehen im Fenster "Notfall-Server".
echo.
cloudflared tunnel --url http://localhost:3000
pause
