#!/bin/bash
# Quick VPS Setup Script for Abugida Backend
# Run this script on a fresh Ubuntu 22.04 VPS

set -e  # Exit on error

echo "🚀 Starting Abugida Backend VPS Setup..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Git
echo "📦 Installing Git..."
apt install -y git

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx

# Configure Firewall
echo "🔥 Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Get VPS IP
VPS_IP=$(curl -s ifconfig.me || curl -s icanhazip.com)
echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Your VPS IP is: $VPS_IP"
echo "2. Add this IP to MongoDB Atlas: $VPS_IP/32"
echo "3. Clone your repository:"
echo "   cd /var/www && git clone https://github.com/E1iteCoder/abugida.git"
echo "4. Create .env file with your MongoDB URI and JWT_SECRET"
echo "5. Install dependencies: npm ci --only=production"
echo "6. Start with PM2: pm2 start src/server/server.js --name abugida-backend"
echo "7. Setup PM2 startup: pm2 startup && pm2 save"
echo ""
echo "📖 See documentation/VPS_DEPLOYMENT_GUIDE.md for detailed instructions"

