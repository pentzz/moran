#!/bin/bash

# VPS Deployment Script for Moran Project Management System
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi
print_success "Node.js is installed ($(node --version))"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi
print_success "npm is installed ($(npm --version))"

# Install dependencies
print_info "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Build the application
print_info "Building the application..."
npm run build
print_success "Application built successfully"

# Create necessary directories
print_info "Creating necessary directories..."
mkdir -p data
mkdir -p data-backups
mkdir -p logs
print_success "Directories created"

# Check if data files exist, if not copy from public/data
if [ ! -f "data/users.json" ]; then
    print_info "Initializing data files..."
    if [ -d "public/data" ]; then
        cp -r public/data/* data/ 2>/dev/null || true
        print_success "Data files initialized"
    fi
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    print_info "Please create a .env file based on .env.example"
    exit 1
fi
print_success ".env file found"

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    print_info "Installing PM2 globally..."
    npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 is already installed ($(pm2 --version))"
fi

# Stop existing PM2 process if running
if pm2 list | grep -q "moran-app"; then
    print_info "Stopping existing PM2 process..."
    pm2 stop moran-app
    pm2 delete moran-app
    print_success "Existing process stopped"
fi

# Start the application with PM2
print_info "Starting application with PM2..."
pm2 start ecosystem.config.js
print_success "Application started with PM2"

# Save PM2 configuration
print_info "Saving PM2 configuration..."
pm2 save
print_success "PM2 configuration saved"

# Setup PM2 to start on system boot
print_info "Setting up PM2 startup script..."
pm2 startup
print_success "PM2 startup configured (you may need to run the command shown above with sudo)"

# Display status
echo ""
print_success "Deployment completed successfully!"
echo ""
print_info "Application Status:"
pm2 list
echo ""
print_info "Application logs:"
echo "  View logs: pm2 logs moran-app"
echo "  Monitor:   pm2 monit"
echo "  Restart:   pm2 restart moran-app"
echo "  Stop:      pm2 stop moran-app"
echo ""
print_info "Application should be running on http://localhost:3001"
echo ""
