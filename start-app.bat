@echo off
echo Starting QR Scanner Application...

echo Starting backend server...
start cmd /k "cd server && node server.js"

echo Waiting for server to initialize (5 seconds)...
ping 127.0.0.1 -n 6 > nul

echo Starting frontend...
start cmd /k "cd project && npm run dev"

echo Both applications started!
echo Server: http://localhost:3000
echo Frontend: http://localhost:5174
echo.
echo Press any key to close this window...
pause > nul
