#!/bin/bash

# Quick Start Script for Testing with Mock Data
# Usage: bash run-mock.sh

echo "🚀 Démarrage de KikEventAdmin avec Mock Data..."
echo ""

# Check if Node modules are installed
if [ ! -d "node_modules" ]; then
  echo "📦 Installation des dépendances..."
  npm install
fi

echo ""
echo "✅ Démarrage du serveur de développement..."
echo ""
echo "📍 L'application ouvrira à: http://localhost:4200/?mock=true"
echo ""
echo "💡 Astuce: Vous pouvez aussi ouvrir http://localhost:4200 et ajouter ?mock=true à l'URL"
echo ""

# Start the development server with a timeout to open the browser
npm start -- --open &
sleep 5

echo ""
echo "🌐 Ouverture du navigateur avec le mode Mock Data..."
sleep 2

# Try to open the browser with the mock URL
if command -v xdg-open > /dev/null; then
  xdg-open "http://localhost:4200/?mock=true" 2>/dev/null &
elif command -v open > /dev/null; then
  open "http://localhost:4200/?mock=true" 2>/dev/null &
elif command -v start > /dev/null; then
  start "http://localhost:4200/?mock=true" 2>/dev/null &
fi

wait
