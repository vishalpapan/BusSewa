# 🚀 Deployment Recommendation for BusSewa

## 📊 Project Analysis

**Usage Period:** Till Jan end (1-2 months)  
**Expected Users:** ~50-100 volunteers + passengers  
**Traffic:** Low to Medium (event-based spikes)  
**Budget:** Minimal (temporary project)

---

## ✅ **RECOMMENDED: Simple EC2 Deployment**

### **Why NOT Kubernetes?**
- ❌ Overkill for small project
- ❌ Complex setup (EKS costs ~$75/month just for control plane)
- ❌ Requires DevOps expertise
- ❌ Not cost-effective for 1-2 months
- ❌ Your app doesn't need auto-scaling

### **Why EC2 t2.small/t2.medium?**
- ✅ Simple, straightforward
- ✅ Cost-effective ($10-20/month)
- ✅ Easy to manage
- ✅ Sufficient for your traffic
- ✅ Can upgrade if needed
- ✅ No load balancer needed (single instance handles it)

---

## 💰 Cost Comparison

| Option | Monthly Cost | Complexity | Suitable? |
|--------|-------------|------------|-----------|
| **EC2 t2.small** | ~$10 | Low | ✅ **BEST** |
| **EC2 t2.medium** | ~$20 | Low | ✅ Good |
| **EC2 t2.xlarge** | ~$75 | Low | ❌ Overkill |
| **EKS + Nodes** | ~$150+ | High | ❌ Overkill |
| **Lightsail** | ~$5 | Very Low | ✅ Alternative |

---

## 🎯 **FINAL RECOMMENDATION**

### **Option 1: AWS EC2 t2.small (RECOMMENDED)**

**Specs:**
- 1 vCPU, 2GB RAM
- Ubuntu 22.04 LTS
- 20GB SSD
- **Cost:** ~$10/month

**Why this works:**
- Your app is lightweight (Django + React)
- SQLite database (no separate DB server needed)
- Expected traffic: <100 concurrent users
- Can handle 50-100 requests/second easily

**When to upgrade to t2.medium:**
- If you see >80% CPU usage
- If response time >2 seconds
- If you add more features

---

### **Option 2: AWS Lightsail $10 Plan (EASIEST)**

**Specs:**
- 1 vCPU, 2GB RAM
- Pre-configured for web apps
- **Cost:** $10/month (fixed)

**Pros:**
- Simpler than EC2
- Fixed pricing (no surprises)
- Built-in firewall
- Easy SSL setup

**Cons:**
- Less flexible than EC2
- Limited to Lightsail features

---

## 🚫 **What You DON'T Need**

### **Load Balancer?**
- ❌ **NO** - Single instance is enough
- Only needed for:
  - High availability (multiple instances)
  - >1000 concurrent users
  - Mission-critical apps

### **Auto-scaling?**
- ❌ **NO** - Traffic is predictable
- Your event has fixed dates
- Manual scaling is fine

### **RDS Database?**
- ❌ **NO** - SQLite is sufficient
- Only switch if:
  - >10,000 records
  - Multiple concurrent writes
  - Need backups/replication

### **CloudFront CDN?**
- ❌ **NO** - Users are local (India)
- Small static files
- Not worth the cost

---

## 📋 Deployment Architecture

### **Simple Single-Server Setup:**

```
┌─────────────────────────────────────────┐
│         AWS EC2 t2.small                │
│  ┌───────────────────────────────────┐  │
│  │  Nginx (Port 80/443)              │  │
│  │  - Serves React build             │  │
│  │  - Reverse proxy to Django        │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Django (Port 8000)               │  │
│  │  - Gunicorn WSGI server           │  │
│  │  - REST API                       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  SQLite Database                  │  │
│  │  - /var/www/bussewa/db.sqlite3    │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
         ↓
    Internet Users
```

---

## 🛠️ Deployment Steps (EC2 t2.small)

### **Step 1: Launch EC2 Instance**
```bash
# AWS Console
1. Launch EC2 instance
2. Choose Ubuntu 22.04 LTS
3. Instance type: t2.small
4. Storage: 20GB
5. Security Group:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
6. Create/use key pair
```

### **Step 2: Connect & Setup**
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install python3-pip python3-venv nginx git -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
```

### **Step 3: Deploy Backend**
```bash
# Clone repo
cd /var/www
sudo git clone <your-repo-url> bussewa
sudo chown -R ubuntu:ubuntu bussewa
cd bussewa/backend

# Setup Python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# Setup Django
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser

# Create systemd service
sudo nano /etc/systemd/system/bussewa.service
```

**bussewa.service:**
```ini
[Unit]
Description=BusSewa Django App
After=network.target

[Service]
User=ubuntu
Group=ubuntu
WorkingDirectory=/var/www/bussewa/backend
Environment="PATH=/var/www/bussewa/backend/venv/bin"
ExecStart=/var/www/bussewa/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 bussewa_api.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl start bussewa
sudo systemctl enable bussewa
```

### **Step 4: Deploy Frontend**
```bash
cd /var/www/bussewa/frontend

# Update API URL in .env
echo "REACT_APP_API_URL=http://your-ec2-ip/api" > .env

# Build
npm install
npm run build
```

### **Step 5: Configure Nginx**
```bash
sudo nano /etc/nginx/sites-available/bussewa
```

**bussewa nginx config:**
```nginx
server {
    listen 80;
    server_name your-ec2-ip;

    # Frontend
    location / {
        root /var/www/bussewa/frontend/build;
        try_files $uri /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Django Admin
    location /admin {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
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

### **Step 6: SSL (Optional but Recommended)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (if you have domain)
sudo certbot --nginx -d yourdomain.com
```

---

## 📊 Monitoring & Maintenance

### **Basic Monitoring:**
```bash
# Check Django service
sudo systemctl status bussewa

# Check Nginx
sudo systemctl status nginx

# View logs
sudo journalctl -u bussewa -f
sudo tail -f /var/log/nginx/error.log

# Check disk space
df -h

# Check memory
free -h
```

### **Backup Strategy:**
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
cd /var/www/bussewa/backend
cp db.sqlite3 /home/ubuntu/backups/db_$DATE.sqlite3
tar -czf /home/ubuntu/backups/media_$DATE.tar.gz media/

# Keep only last 7 days
find /home/ubuntu/backups -mtime +7 -delete
```

---

## 💾 Data Export Strategy

### **Before Shutdown (End of Jan):**

```bash
# 1. Export all data to Excel
# Use your Export Data feature in the app

# 2. Backup database
scp ubuntu@your-ec2-ip:/var/www/bussewa/backend/db.sqlite3 ./backup_final.sqlite3

# 3. Backup media files
scp -r ubuntu@your-ec2-ip:/var/www/bussewa/backend/media ./backup_media

# 4. Export to CSV (via Django shell)
python manage.py shell
>>> from passengers.models import Passenger
>>> from bookings.models import Booking, Payment
>>> # Export logic here
```

### **Archive for Future:**
- Keep SQLite database file
- Keep all media files (Aadhar documents)
- Export final reports to Excel
- Store in S3 bucket (cheap long-term storage)

---

## 🎯 Final Recommendation Summary

### **For Your Use Case:**

✅ **Deploy on: EC2 t2.small ($10/month)**

**Reasons:**
1. Cost-effective for 1-2 months (~$20 total)
2. Simple to manage
3. Sufficient performance
4. Easy to backup and export data
5. Can use office AWS till Dec, then personal AWS for Jan

**Don't use:**
- ❌ Kubernetes (overkill, expensive)
- ❌ Load balancer (not needed)
- ❌ t2.xlarge (waste of money)
- ❌ RDS (SQLite is fine)

**Timeline:**
- **Dec:** Deploy on office AWS (EC2 t2.small)
- **Jan:** Migrate to personal AWS (same setup)
- **End Jan:** Export all data, terminate instance

**Total Cost:** ~$20-30 for entire project

---

## 📝 Pre-Deployment Checklist

- [ ] Update Django settings for production
- [ ] Set DEBUG=False
- [ ] Configure ALLOWED_HOSTS
- [ ] Set strong SECRET_KEY
- [ ] Update CORS settings
- [ ] Test locally with production settings
- [ ] Prepare deployment scripts
- [ ] Setup backup strategy
- [ ] Document admin credentials
- [ ] Test data export functionality

---

## 🚀 Quick Start Command

```bash
# One-line deployment (after setup)
ssh ubuntu@your-ec2-ip "cd /var/www/bussewa && git pull && cd backend && source venv/bin/activate && python manage.py migrate && sudo systemctl restart bussewa && cd ../frontend && npm run build && sudo systemctl restart nginx"
```

---

**Recommendation: Start with EC2 t2.small. It's perfect for your needs!** 🎯
