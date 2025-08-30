#!/bin/bash

echo "🚀 Starting ccusage Web Dashboard..."

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed. Please install Bun first: https://bun.sh"
    exit 1
fi

# Check if we're in the web directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the web/ directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ] || [ ! -d "server/node_modules" ] || [ ! -d "client/node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
    cd server && bun install && cd ..
    cd client && bun install && cd ..
fi

echo "✅ Dependencies installed"
echo "🌐 Starting servers..."
echo "   - Backend API: http://localhost:3001"
echo "   - Frontend: http://localhost:5173"
echo ""
echo "📊 Dashboard will be available at: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Start both servers
bun run dev