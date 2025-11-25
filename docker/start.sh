#!/bin/sh
set -e

echo "🚀 Starting APAS Application..."

# Run database migrations
echo "📊 Running database migrations..."
cd /app/backend
npx prisma migrate deploy

# Start backend in background
echo "🔧 Starting backend server..."
cd /app/backend
node dist/index.js &
BACKEND_PID=$!

# Wait for backend to be ready (simple sleep instead of curl check)
echo "⏳ Waiting for backend to be ready..."
sleep 10
echo "✅ Backend should be ready!"

# Start frontend
echo "🎨 Starting frontend server..."
cd /app/frontend
exec node node_modules/next/dist/bin/next start
