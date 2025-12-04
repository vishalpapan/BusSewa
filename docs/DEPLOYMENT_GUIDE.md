# BusSewa - Deployment Guide & Cost Analysis

## 🎯 Recommended Deployment Strategy

### Option 1: AWS EC2 (RECOMMENDED - Cost Effective)
**Best for:** Small to medium events (up to 1000 passengers)

#### Setup:
- **Instance:** t3.micro (1 vCPU, 1GB RAM) - Free tier eligible
- **Storage:** 20GB EBS (General Purpose SSD)
- **Database:** SQLite (for simplicity) or RDS PostgreSQL (for production)
- **Domain:** Use existing domain or AWS public DNS

#### Monthly Cost Estimate:
- **EC2 t3.micro:** $0 (Free tier) or $8.50/month
- **EBS Storage:** $2/month (20GB)
- **Data Transfer:** $0.09/GB (minimal for internal use)
- **Total:** ~$10-15/month

### Option 2: AWS Lightsail (SIMPLEST)
**Best for:** Quick deployment, minimal management

#### Setup:
- **Instance:** $5/month plan (1GB RAM, 1 vCPU, 40GB SSD)
- **Includes:** Static IP, DNS management, firewall
- **Database:** Built-in or separate $15/month managed database

#### Monthly Cost Estimate:
- **Lightsail Instance:** $5/month
- **Managed Database:** $15/month (optional)
- **Total:** $5-20/month

### Option 3: Heroku (EASIEST DEPLOYMENT)
**Best for:** Zero DevOps, instant deployment

#### Setup:
- **Dyno:** Free tier or $7/month (Hobby)
- **Database:** PostgreSQL add-on $9/month
- **File Storage:** AWS S3 add-on $5/month

#### Monthly Cost Estimate:
- **Heroku Dyno:** $0-7/month
- **PostgreSQL:** $9/month
- **File Storage:** $5/month
- **Total:** $14-21/month

## 🚀 Quick Deployment Steps

### AWS EC2 Deployment (Recommended)

#### Step 1: Launch EC2 Instance
```bash
# 1. Launch t3.micro Ubuntu 22.04 instance
# 2. Configure security group (ports 22, 80, 8000)
# 3. Create key pair for SSH access
```

#### Step 2: Server Setup
```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install python3 python3-pip nodejs npm nginx git -y

# Install PM2 for process management
sudo npm install -g pm2
```

#### Step 3: Deploy Application
```bash
# Clone repository
git clone <your-repo-url>
cd BusSewa

# Backend setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic

# Frontend setup
cd ../frontend
npm install
npm run build

# Configure Nginx
sudo nano /etc/nginx/sites-available/bussewa
```

#### Step 4: Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve React build
    location / {
        root /home/ubuntu/BusSewa/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Django API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Django admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Media files
    location /media/ {
        alias /home/ubuntu/BusSewa/backend/media/;
    }
}
```

#### Step 5: Start Services
```bash
# Start Django with PM2
pm2 start "python manage.py runserver 0.0.0.0:8000" --name bussewa-backend

# Enable Nginx
sudo ln -s /etc/nginx/sites-available/bussewa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Auto-start on boot
pm2 startup
pm2 save
```

## 📦 Application Portability Guide

### Create Portable Package
```bash
# 1. Create deployment package
mkdir BusSewa-Portable
cp -r BusSewa/* BusSewa-Portable/

# 2. Add setup script
cat > BusSewa-Portable/setup.sh << 'EOF'
#!/bin/bash
echo "Setting up BusSewa..."

# Install Python dependencies
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup database
python manage.py migrate
python manage.py collectstatic --noinput

# Create superuser (optional)
echo "Create admin user:"
python manage.py createsuperuser

# Install Node dependencies
cd ../frontend
npm install
npm run build

echo "Setup complete! Run ./start.sh to start the application"
EOF

# 3. Add start script
cat > BusSewa-Portable/start.sh << 'EOF'
#!/bin/bash
echo "Starting BusSewa..."

# Start backend
cd backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000 &

# Start frontend (development)
cd ../frontend
npm start &

echo "BusSewa started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
EOF

chmod +x BusSewa-Portable/*.sh
```

### System Requirements Document
```markdown
# BusSewa - System Requirements

## Minimum Requirements:
- **OS:** Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB free space
- **Network:** Internet connection for initial setup

## Software Dependencies:
- Python 3.8+ 
- Node.js 16+
- Git (for cloning)

## Installation Steps:
1. Download BusSewa-Portable.zip
2. Extract to desired location
3. Run `setup.sh` (Linux/Mac) or `setup.bat` (Windows)
4. Run `start.sh` (Linux/Mac) or `start.bat` (Windows)
5. Access application at http://localhost:3000
```

## 💰 Cost Comparison Summary

| Option | Monthly Cost | Complexity | Best For |
|--------|-------------|------------|----------|
| **AWS EC2** | $10-15 | Medium | Cost-effective, scalable |
| **AWS Lightsail** | $5-20 | Low | Simple, managed |
| **Heroku** | $14-21 | Very Low | Zero DevOps |
| **Local Hosting** | $0 | High | Testing only |

## 🎯 Recommendation for MSS Event

**For 1-week event with ~500 passengers:**
- **Use AWS Lightsail $5 plan**
- **SQLite database** (sufficient for event size)
- **Total cost: ~$5 for the month**
- **Terminate after event** to save costs

**Benefits:**
- ✅ Extremely low cost
- ✅ Easy to setup and manage
- ✅ Automatic backups available
- ✅ Can scale if needed
- ✅ Terminate when done (no ongoing costs)