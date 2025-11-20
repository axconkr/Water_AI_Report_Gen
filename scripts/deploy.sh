#!/bin/bash

# ===================================
# APAS Deployment Script
# ===================================

set -e  # Exit on error

echo "🚀 Starting APAS deployment..."

# Check if running as correct user
if [ "$EUID" -eq 0 ]; then
   echo "❌ Please do not run as root"
   exit 1
fi

# Configuration
PROJECT_DIR="/var/www/apas"
BRANCH="main"

# Navigate to project directory
cd $PROJECT_DIR

echo "📦 Pulling latest changes from GitHub..."
git pull origin $BRANCH

echo ""
echo "🔧 Installing Backend dependencies..."
cd $PROJECT_DIR/backend
npm install

echo ""
echo "🗄️  Running database migrations..."
npx prisma generate
npx prisma migrate deploy

echo ""
echo "🏗️  Building Backend..."
npm run build

echo ""
echo "🔧 Installing Frontend dependencies..."
cd $PROJECT_DIR/frontend
npm install

echo ""
echo "🏗️  Building Frontend..."
npm run build

echo ""
echo "🔄 Reloading PM2 processes..."
pm2 reload ecosystem.config.js

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Current PM2 status:"
pm2 status

echo ""
echo "💡 To view logs, run: pm2 logs"
echo "💡 To monitor processes, run: pm2 monit"
