@echo off
REM Quick Start Script for Testing with Mock Data
REM Usage: run-mock.bat

echo.
echo 🚀 Demarrage de KikEventAdmin avec Mock Data...
echo.

REM Check if Node modules are installed
if not exist "node_modules" (
  echo 📦 Installation des dependances...
  call npm install
)

echo.
echo ✅ Demarrage du serveur de developpement...
echo.
echo 📍 L'application ouvrira a: http://localhost:4200/?mock=true
echo.
echo 💡 Astuce: Vous pouvez aussi ouvrir http://localhost:4200 et ajouter ?mock=true a l'URL
echo.

REM Start the development server
start cmd /k npm start

REM Wait a bit for the server to start
timeout /t 5 /nobreak

REM Open the browser with the mock URL
start http://localhost:4200/?mock=true

echo.
echo ✨ Le serveur a ete lance! Consultez la console npm pour plus de details.
echo.
pause
