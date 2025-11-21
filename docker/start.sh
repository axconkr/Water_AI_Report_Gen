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

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in $(seq 1 30); do
  if curl -f http://localhost:4000/api/v1/health > /dev/null 2>&1; then
    echo "✅ Backend is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ Backend failed to start"
    exit 1
  fi
  sleep 2
done

# Start frontend
echo "🎨 Starting frontend server..."
cd /app/frontend
exec node node_modules/next/dist/bin/next start
