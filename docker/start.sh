#!/bin/sh
set -e

echo "🚀 Starting APAS Application..."

# Run database migrations
echo "📊 Checking database schema..."
cd /app/backend

# Check if migrations exist
if [ -d "./prisma/migrations" ] && [ "$(ls -A ./prisma/migrations)" ]; then
  echo "✅ Migration files found, deploying..."
  npx prisma migrate deploy
else
  echo "⚠️  No migration files found, using prisma db push..."
  npx prisma db push --skip-generate --accept-data-loss
fi

echo "✅ Database schema is ready!"

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
