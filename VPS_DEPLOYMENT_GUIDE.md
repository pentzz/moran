# מדריך פריסה ל-VPS - מערכת ניהול פרויקטים מורן

## תוכן עניינים
1. [דרישות מקדימות](#דרישות-מקדימות)
2. [התקנה ראשונית](#התקנה-ראשונית)
3. [הגדרת סביבה](#הגדרת-סביבה)
4. [פריסה אוטומטית](#פריסה-אוטומטית)
5. [ניהול השרת](#ניהול-השרת)
6. [גיבויים](#גיבויים)
7. [אבטחה](#אבטחה)
8. [פתרון בעיות](#פתרון-בעיות)

---

## דרישות מקדימות

### דרישות שרת VPS
- **מערכת הפעלה**: Ubuntu 20.04 / 22.04 LTS או דומה
- **זיכרון RAM**: מינימום 1GB (מומלץ 2GB)
- **דיסק**: מינימום 10GB פנויים
- **גישת root או sudo**

### תוכנות נדרשות
1. **Node.js** (גרסה 18.x או גבוהה יותר)
2. **npm** (מגיע עם Node.js)
3. **PM2** (מותקן אוטומטית בסקריפט הפריסה)
4. **Git** (להעברת הקוד)

---

## התקנה ראשונית

### שלב 1: עדכון המערכת
```bash
sudo apt update
sudo apt upgrade -y
```

### שלב 2: התקנת Node.js
```bash
# התקנת Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# בדיקת ההתקנה
node --version
npm --version
```

### שלב 3: התקנת Git (אם לא מותקן)
```bash
sudo apt install -y git
```

### שלב 4: יצירת משתמש מיוחד (מומלץ)
```bash
sudo adduser moran-app
sudo usermod -aG sudo moran-app
su - moran-app
```

---

## הגדרת סביבה

### שלב 1: העתקת הפרויקט לשרת

#### אופציה א': באמצעות Git
```bash
cd ~
git clone <repository-url> moran-app
cd moran-app
```

#### אופציה ב': העלאה ידנית
```bash
# מהמחשב המקומי:
scp -r /path/to/project user@your-vps-ip:/home/user/moran-app
```

### שלב 2: הגדרת קובץ .env
```bash
cd ~/moran-app

# העתק את קובץ הדוגמה
cp .env.example .env

# ערוך את הקובץ
nano .env
```

#### הגדרות חשובות ב-.env:
```bash
# סביבת ייצור
NODE_ENV=production

# פורט השרת (ברירת מחדל 3001)
PORT=3001

# SECRET KEY - חשוב מאוד להחליף!
SESSION_SECRET=your-very-long-random-secret-key-change-this-in-production

# שם ה-session
SESSION_NAME=moran_session

# משך חיי session (במילישניות, 24 שעות)
SESSION_MAX_AGE=86400000

# CORS - התאם לפי הצורך
CORS_ORIGIN=*
```

**חשוב**: צור SESSION_SECRET אקראי וחזק:
```bash
# יצירת secret אקראי
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### שלב 3: יצירת תיקיות נתונים
```bash
mkdir -p data
mkdir -p data-backups
mkdir -p logs

# אם יש נתונים קיימים מ-localhost:
cp public/data/* data/
```

---

## פריסה אוטומטית

### הרצת סקריפט הפריסה
```bash
cd ~/moran-app
./deploy.sh
```

הסקריפט יבצע:
1. ✅ בדיקת תלותות (Node.js, npm)
2. ✅ התקנת חבילות npm
3. ✅ בניית האפליקציה (Vite build)
4. ✅ יצירת תיקיות נדרשות
5. ✅ התקנת PM2
6. ✅ הפעלת השרת עם PM2
7. ✅ שמירת הגדרות PM2
8. ✅ הגדרת הפעלה אוטומטית בהפעלת המערכת

### פריסה ידנית (אופציונלי)
אם אתה מעדיף לבצע ידנית:
```bash
# 1. התקנת תלותות
npm install

# 2. בניית האפליקציה
npm run build

# 3. התקנת PM2 (פעם אחת)
sudo npm install -g pm2

# 4. הפעלת השרת
pm2 start ecosystem.config.js

# 5. שמירת הגדרות
pm2 save

# 6. הגדרת הפעלה אוטומטית
pm2 startup
# הרץ את הפקודה שמוצגת
```

---

## ניהול השרת

### פקודות PM2 בסיסיות
```bash
# הצגת סטטוס כל האפליקציות
pm2 list

# הצגת לוגים בזמן אמת
pm2 logs moran-app

# הצגת לוגים - רק שגיאות
pm2 logs moran-app --err

# ניטור משאבים
pm2 monit

# הפעלה מחדש
pm2 restart moran-app

# עצירת השרת
pm2 stop moran-app

# מחיקת התהליך
pm2 delete moran-app

# צפייה במידע מפורט
pm2 show moran-app
```

### עדכון האפליקציה
```bash
cd ~/moran-app

# עדכון מ-Git
git pull origin main

# או העלאה ידנית של קבצים

# בניה מחדש והפעלה
npm install
npm run build
pm2 restart moran-app
```

---

## גיבויים

### גיבוי אוטומטי עם Cron
```bash
# פתיחת crontab
crontab -e

# הוספת שורה לגיבוי יומי ב-3 בלילה
0 3 * * * cd ~/moran-app && npm run backup-data >> ~/moran-app/logs/backup.log 2>&1
```

### גיבוי ידני
```bash
cd ~/moran-app
npm run backup-data
```

### שחזור מגיבוי
```bash
cd ~/moran-app
npm run restore-data
```

### העברת גיבויים למיקום חיצוני (מומלץ מאוד!)
```bash
# גיבוי יומי לשרת חיצוני
rsync -avz ~/moran-app/data-backups/ user@backup-server:/backups/moran/

# או העלאה ל-cloud storage
# דוגמה עם rclone (לאחר הגדרה)
rclone sync ~/moran-app/data-backups/ remote:moran-backups/
```

---

## אבטחה

### 1. הגדרת Firewall
```bash
# התקנת ufw
sudo apt install ufw

# אפשר SSH
sudo ufw allow ssh
sudo ufw allow 22/tcp

# אפשר את פורט האפליקציה (אם גישה ישירה)
sudo ufw allow 3001/tcp

# הפעלת firewall
sudo ufw enable

# בדיקת סטטוס
sudo ufw status
```

### 2. הגדרת Nginx כ-Reverse Proxy (מומלץ)
```bash
# התקנת Nginx
sudo apt install nginx -y

# יצירת קובץ הגדרה
sudo nano /etc/nginx/sites-available/moran-app
```

תוכן הקובץ:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # או IP של השרת

    # Logs
    access_log /var/log/nginx/moran-app-access.log;
    error_log /var/log/nginx/moran-app-error.log;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Session support
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
```

הפעלת ההגדרה:
```bash
# יצירת symlink
sudo ln -s /etc/nginx/sites-available/moran-app /etc/nginx/sites-enabled/

# בדיקת הגדרות
sudo nginx -t

# הפעלה מחדש של Nginx
sudo systemctl restart nginx

# הפעלה אוטומטית
sudo systemctl enable nginx
```

### 3. הגדרת HTTPS עם Let's Encrypt (מומלץ מאוד)
```bash
# התקנת Certbot
sudo apt install certbot python3-certbot-nginx -y

# קבלת תעודה
sudo certbot --nginx -d your-domain.com

# חידוש אוטומטי
sudo certbot renew --dry-run
```

### 4. הגדרות אבטחה נוספות

**א. הגבלת הרשאות קבצים:**
```bash
cd ~/moran-app
chmod 600 .env
chmod -R 755 data
```

**ב. עדכון סיסמאות משתמשים:**
ערוך את `data/users.json` והחלף את הסיסמאות בסיסמאות חזקות.

**ג. ניטור ולוגים:**
```bash
# הצגת לוגים של Nginx
sudo tail -f /var/log/nginx/moran-app-access.log

# הצגת לוגים של האפליקציה
pm2 logs moran-app --lines 100
```

---

## פתרון בעיות

### השרת לא עולה
```bash
# בדיקת שגיאות
pm2 logs moran-app --err

# בדיקת סטטוס
pm2 status

# הפעלה מחדש
pm2 restart moran-app

# אם זה לא עוזר - התחל מחדש
pm2 delete moran-app
pm2 start ecosystem.config.js
```

### נתונים לא נשמרים
```bash
# בדיקת הרשאות
ls -la data/

# תיקון הרשאות
chmod -R 755 data/
chown -R $USER:$USER data/

# בדיקת שהקבצים קיימים
ls -la data/*.json

# הפעלה מחדש
pm2 restart moran-app
```

### האפליקציה איטית
```bash
# בדיקת שימוש במשאבים
pm2 monit

# הוספת זיכרון ל-PM2
pm2 stop moran-app
pm2 delete moran-app
# ערוך ecosystem.config.js והגדל max_memory_restart
pm2 start ecosystem.config.js
```

### שגיאות Session
1. בדוק ש-SESSION_SECRET מוגדר ב-.env
2. בדוק ש-cookies מופעלים בדפדפן
3. אם יש Nginx - ודא שההגדרות proxy נכונות

### גישה מחוץ לשרת לא עובדת
```bash
# בדיקת firewall
sudo ufw status

# פתיחת פורט
sudo ufw allow 3001/tcp

# בדיקת Nginx (אם מותקן)
sudo nginx -t
sudo systemctl status nginx

# בדיקת שהשרת מאזין
sudo netstat -tulpn | grep :3001
```

---

## טיפים נוספים

### 1. ניטור ביצועים
```bash
# התקנת pm2-logrotate למניעת לוגים גדולים
pm2 install pm2-logrotate

# הגדרות rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 2. התראות
הגדרת התראות ל-Telegram/Email כשהשרת נופל:
```bash
# דוגמה עם pm2-telegram
pm2 install pm2-telegram
pm2 set pm2-telegram:token YOUR_BOT_TOKEN
pm2 set pm2-telegram:chatId YOUR_CHAT_ID
```

### 3. סקריפט בדיקת תקינות
צור קובץ `healthcheck.sh`:
```bash
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)
if [ $response != "200" ]; then
    pm2 restart moran-app
    echo "$(date): Server restarted due to health check failure" >> ~/moran-app/logs/healthcheck.log
fi
```

הוסף ל-crontab (בדיקה כל 5 דקות):
```bash
*/5 * * * * /home/user/moran-app/healthcheck.sh
```

---

## סיכום - צ'קליסט לפריסה

- [ ] התקנת Node.js ו-npm
- [ ] העתקת הפרויקט לשרת
- [ ] הגדרת .env עם SESSION_SECRET חזק
- [ ] הרצת `./deploy.sh`
- [ ] בדיקת שהשרת עובד: `curl http://localhost:3001`
- [ ] הגדרת firewall
- [ ] התקנת Nginx (מומלץ)
- [ ] הגדרת HTTPS (מומלץ מאוד)
- [ ] הגדרת גיבויים אוטומטיים
- [ ] בדיקת גישה מהדפדפן
- [ ] בדיקת התחברות ושמירת נתונים

---

## תמיכה

במקרה של בעיות:
1. בדוק את הלוגים: `pm2 logs moran-app`
2. בדוק את סטטוס השרת: `pm2 status`
3. חפש בקובץ זה את הבעיה הספציפית
4. נסה הפעלה מחדש: `pm2 restart moran-app`

**בהצלחה! 🚀**
