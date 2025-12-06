# 🔄 Deployment & Update Guide

## 📋 Table of Contents
1. Initial Deployment
2. Making Updates After Deployment
3. Security Groups (Instead of Load Balancer)
4. Troubleshooting

---

## 🚀 Part 1: Initial Deployment

### **Step 1: Prepare GitHub Repository**

```bash
# On your local machine
cd BusSewa

# Clean sensitive data
del backend\db.sqlite3
rmdir /s backend\media
rmdir /s frontend\node_modules

# Push to GitHub
git add .
git commit -m "Production ready deployment"
git push origin main
```

### **Step 2: Launch EC2 Instance**

**Instance Details:**
- **Type:** t2.small ($10/month)
- **OS:** Ubuntu 22.04 LTS
- **Storage:** 20GB
- **Security Group:** (See Part 3 below)

### **Step 3: Connect & Setup**

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install python3-pip python3-venv nginx git -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Verify installations
python3 --version
node --version
nginx -v
```

### **Step 4: Clone & Deploy Backend**

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/BusSewa.git bussewa
sudo chown -R ubuntu:ubuntu bussewa
cd bussewa/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python packages
pip install -r requirements.txt
pip install gunicorn

# Create .env file
nano .env
```

**Add to .env:**
```env
DEBUG=False
SECRET_KEY=your-super-secret-key-change-this
ALLOWED_HOSTS=your-ec2-ip,your-domain.com
```

```bash
# Run migrations
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser

# Test Django
python manage.py runserver 0.0.0.0:8000
# Press Ctrl+C after testing
```

### **Step 5: Setup Gunicorn Service**

```bash
sudo nano /etc/systemd/system/bussewa.service
```

**Add this content:**
```ini
[Unit]
Description=BusSewa Django Application
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/var/www/bussewa/backend
Environment="PATH=/var/www/bussewa/backend/venv/bin"
ExecStart=/var/www/bussewa/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    bussewa_api.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl start bussewa
sudo systemctl enable bussewa
sudo systemctl status bussewa
```

### **Step 6: Build Frontend**

```bash
cd /var/www/bussewa/frontend

# Update API URL
echo "REACT_APP_API_URL=http://your-ec2-ip/api" > .env.production

# Install & build
npm install
npm run build
```

### **Step 7: Configure Nginx**

```bash
sudo nano /etc/nginx/sites-available/bussewa
```

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name your-ec2-ip;
    client_max_body_size 10M;

    # Frontend
    location / {
        root /var/www/bussewa/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin
    location /admin {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static files
    location /static {
        alias /var/www/bussewa/backend/staticfiles;
    }

    # Media files
    location /media {
        alias /var/www/bussewa/backend/media;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/bussewa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Step 8: Test Deployment**

Open browser: `http://your-ec2-ip`

---

## 🔄 Part 2: Making Updates After Deployment

### **Scenario: You Fixed a Bug or Added Feature**

#### **On Your Local Machine:**

```bash
# 1. Make your changes
# 2. Test locally
# 3. Commit and push

git add .
git commit -m "Fixed seat allocation bug"
git push origin main
```

#### **On EC2 Instance:**

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Navigate to project
cd /var/www/bussewa

# Pull latest changes
git pull origin main

# Update backend (if backend changed)
cd backend
source venv/bin/activate
pip install -r requirements.txt  # If new packages added
python manage.py migrate         # If models changed
python manage.py collectstatic --noinput
sudo systemctl restart bussewa

# Update frontend (if frontend changed)
cd ../frontend
npm install                      # If new packages added
npm run build
sudo systemctl restart nginx

# Check status
sudo systemctl status bussewa
sudo systemctl status nginx
```

### **Quick Update Script**

Create this file on EC2: `/home/ubuntu/update-bussewa.sh`

```bash
#!/bin/bash
echo "🔄 Updating BusSewa..."

cd /var/www/bussewa

# Pull changes
echo "📥 Pulling from GitHub..."
git pull origin main

# Backend updates
echo "🔧 Updating backend..."
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput --clear
sudo systemctl restart bussewa

# Frontend updates
echo "🎨 Updating frontend..."
cd ../frontend
npm install
npm run build
sudo systemctl restart nginx

echo "✅ Update complete!"
echo "🌐 Visit: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
```

```bash
# Make executable
chmod +x /home/ubuntu/update-bussewa.sh

# Run updates
./update-bussewa.sh
```

---

## 🔒 Part 3: Security Groups (Instead of Load Balancer)

### **Why NO Load Balancer?**

| Feature | Load Balancer | Security Group |
|---------|---------------|----------------|
| **Cost** | ~$16/month | FREE |
| **Setup** | Complex | Simple |
| **Your Need** | Single instance | Single instance |
| **IP Restriction** | ✅ Yes | ✅ Yes |
| **Recommendation** | ❌ Not needed | ✅ Perfect |

### **Setup Security Group for Office Access Only**

#### **Option 1: Whitelist Office IPs**

```
Security Group Rules:

Inbound Rules:
┌──────────┬──────────┬─────────────────────┬─────────────┐
│ Type     │ Protocol │ Port Range          │ Source      │
├──────────┼──────────┼─────────────────────┼─────────────┤
│ SSH      │ TCP      │ 22                  │ Your IP     │
│ HTTP     │ TCP      │ 80                  │ Office IP 1 │
│ HTTP     │ TCP      │ 80                  │ Office IP 2 │
│ HTTP     │ TCP      │ 80                  │ Office IP 3 │
│ HTTPS    │ TCP      │ 443                 │ Office IP 1 │
│ HTTPS    │ TCP      │ 443                 │ Office IP 2 │
└──────────┴──────────┴─────────────────────┴─────────────┘

Outbound Rules:
All traffic allowed (default)
```

**How to Add:**
1. Go to EC2 → Security Groups
2. Select your security group
3. Edit Inbound Rules
4. Add rules for each office IP
5. Save

#### **Option 2: VPN Access (If Office Has VPN)**

```
Inbound Rules:
┌──────────┬──────────┬─────────────────────┬─────────────┐
│ Type     │ Protocol │ Port Range          │ Source      │
├──────────┼──────────┼─────────────────────┼─────────────┤
│ SSH      │ TCP      │ 22                  │ Your IP     │
│ HTTP     │ TCP      │ 80                  │ VPN IP Range│
│ HTTPS    │ TCP      │ 443                 │ VPN IP Range│
└──────────┴──────────┴─────────────────────┴─────────────┘
```

#### **Option 3: Temporary Public Access (Testing)**

```
Inbound Rules:
┌──────────┬──────────┬─────────────────────┬─────────────┐
│ Type     │ Protocol │ Port Range          │ Source      │
├──────────┼──────────┼─────────────────────┼─────────────┤
│ SSH      │ TCP      │ 22                  │ Your IP     │
│ HTTP     │ TCP      │ 80                  │ 0.0.0.0/0   │
│ HTTPS    │ TCP      │ 443                 │ 0.0.0.0/0   │
└──────────┴──────────┴─────────────────────┴─────────────┘

⚠️ Change to specific IPs after testing!
```

### **Get Office IP Address**

```bash
# On office computer, visit:
https://whatismyipaddress.com/

# Or use command:
curl ifconfig.me
```

---

## 🐛 Part 4: Troubleshooting

### **Issue 1: Git Pull Fails**

```bash
# If you have local changes
cd /var/www/bussewa
git stash
git pull origin main
git stash pop
```

### **Issue 2: Service Won't Start**

```bash
# Check logs
sudo journalctl -u bussewa -n 50

# Check if port is in use
sudo lsof -i :8000

# Restart service
sudo systemctl restart bussewa
```

### **Issue 3: Nginx Error**

```bash
# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### **Issue 4: Database Migration Error**

```bash
cd /var/www/bussewa/backend
source venv/bin/activate

# Fake migration if needed
python manage.py migrate --fake-initial

# Or reset migrations (CAUTION: Deletes data)
rm db.sqlite3
python manage.py migrate
```

### **Issue 5: Frontend Not Updating**

```bash
cd /var/www/bussewa/frontend

# Clear cache and rebuild
rm -rf node_modules build
npm install
npm run build

# Clear browser cache
# Press Ctrl+Shift+R in browser
```

---

## 📊 Monitoring Commands

```bash
# Check service status
sudo systemctl status bussewa
sudo systemctl status nginx

# View logs
sudo journalctl -u bussewa -f
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check memory
free -h

# Check processes
ps aux | grep gunicorn
ps aux | grep nginx
```

---

## 🔄 Update Workflow Summary

```
Local Machine:
1. Make changes
2. Test locally
3. git commit & push

↓

EC2 Instance:
1. git pull
2. Update backend (if needed)
3. Update frontend (if needed)
4. Restart services

↓

Test:
1. Open browser
2. Test changes
3. Check logs if issues
```

---

## 📝 Quick Reference

### **Common Commands:**

```bash
# Update app
cd /var/www/bussewa && git pull && ./update-bussewa.sh

# Restart services
sudo systemctl restart bussewa nginx

# View logs
sudo journalctl -u bussewa -f

# Check status
sudo systemctl status bussewa nginx
```

### **File Locations:**

```
Application: /var/www/bussewa/
Backend: /var/www/bussewa/backend/
Frontend: /var/www/bussewa/frontend/
Database: /var/www/bussewa/backend/db.sqlite3
Media: /var/www/bussewa/backend/media/
Logs: /var/log/nginx/ and journalctl
Service: /etc/systemd/system/bussewa.service
Nginx Config: /etc/nginx/sites-available/bussewa
```

---

## ✅ Deployment Checklist

### **Initial Deployment:**
- [ ] EC2 instance launched
- [ ] Security group configured
- [ ] Dependencies installed
- [ ] Repository cloned
- [ ] Backend configured
- [ ] Frontend built
- [ ] Nginx configured
- [ ] Services running
- [ ] Application accessible

### **After Each Update:**
- [ ] Changes committed to GitHub
- [ ] SSH into EC2
- [ ] Git pull successful
- [ ] Backend updated (if needed)
- [ ] Frontend rebuilt (if needed)
- [ ] Services restarted
- [ ] Application tested
- [ ] No errors in logs

---

**You're all set for deployment and updates! 🚀**
