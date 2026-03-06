#!/bin/bash

# init.sh - Initialization script for web-based coding environment
# Purpose: Bootstrap development environment for AI agents and developers
# Based on: Anthropic's "Effective Harnesses for Long-Running Agents"

set -e  # Exit on error

echo "🚀 Initializing web-based coding environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. Check Node.js installation
echo ""
echo "Checking prerequisites..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# 2. Check npm installation
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm installed: $NPM_VERSION"
else
    print_error "npm is not installed."
    exit 1
fi

# 3. Install dependencies if node_modules doesn't exist
echo ""
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    print_status "Dependencies installed"
else
    print_status "Dependencies already installed (node_modules exists)"
fi

# 4. Run basic validation - lint check
echo ""
echo "Running validation checks..."
if npm run lint; then
    print_status "Lint check passed"
else
    print_warning "Lint check found issues (non-blocking)"
fi

# 5. Build check (optional - can be commented out for faster init)
echo ""
echo "Checking if project builds..."
if npm run build; then
    print_status "Build successful"
else
    print_error "Build failed - existing bugs detected"
    exit 1
fi

# 6. Start development server
echo ""
echo "Starting development server..."
print_status "Server will start at http://localhost:3000"
print_status "Press Ctrl+C to stop the server"
echo ""

# Run dev server (this will block until stopped)
npm run dev
