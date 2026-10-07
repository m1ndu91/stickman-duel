@echo off
rem Starts the client (5173) and game server (2567) if they are not running, then opens the game.
cd /d "%~dp0"

call :listening 5173
set CLIENT=%ERRORLEVEL%
call :listening 2567
set SERVER=%ERRORLEVEL%

set BOTH=0
if %CLIENT%==1 if %SERVER%==1 set BOTH=1
if %BOTH%==1 (
  start "Stickman dev server" /min cmd /k pnpm dev
  goto wait
)
if %CLIENT%==1 start "Stickman client" /min cmd /k pnpm dev:client
if %SERVER%==1 start "Stickman server" /min cmd /k pnpm dev:server

set TRIES=0
:wait
call :listening 5173 && goto open
set /a TRIES+=1
if %TRIES% geq 60 (
  echo The game did not start within 60 seconds. Check the "Stickman" window for errors.
  pause
  exit /b 1
)
ping -n 2 127.0.0.1 >nul
goto wait

:open
start "" http://127.0.0.1:5173
exit /b 0

:listening
netstat -ano | findstr /R /C:":%1 .*LISTENING" >nul
exit /b %ERRORLEVEL%
