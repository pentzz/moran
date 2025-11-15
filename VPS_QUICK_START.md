# התחלה מהירה - פריסה ל-VPS

## 🚀 פריסה ב-3 שלבים פשוטים

### שלב 1: הכנת השרת
```bash
# התחבר לשרת VPS שלך
ssh user@your-vps-ip

# התקן Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

# ודא שהותקן
node --version  # צריך להיות 18.x או גבוה יותר
npm --version
```

### שלב 2: העלאת הקוד
```bash
# העתק את הפרויקט לשרת (מהמחשב המקומי)
scp -r /path/to/moran user@your-vps-ip:/home/user/

# או שכפל מ-Git
cd ~
git clone <your-repo-url> moran
cd moran
```

### שלב 3: הפעלה
```bash
cd ~/moran

# הגדר את .env (חשוב!)
cp .env.example .env
nano .env  # ערוך את SESSION_SECRET

# הרץ את סקריפט הפריסה
chmod +x deploy.sh
./deploy.sh
```

**זהו! האפליקציה רצה על http://your-vps-ip:3001 🎉**

---

## ⚙️ הגדרות .env חשובות

ערוך את `.env` ושנה:
```bash
SESSION_SECRET=your-random-secret-here-change-me-to-something-secure
PORT=3001
NODE_ENV=production
```

**ליצירת secret אקראי:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📋 פקודות שימושיות

### ניהול השרת
```bash
npm run pm2:logs      # צפייה בלוגים
npm run pm2:restart   # הפעלה מחדש
npm run pm2:monit     # ניטור
```

### גיבויים
```bash
npm run backup-auto   # גיבוי ידני
```

### עדכון אחרי שינויים
```bash
git pull
npm install
npm run build
npm run pm2:restart
```

---

## 🌐 גישה דרך דפדפן

**ללא Nginx:**
```
http://your-vps-ip:3001
```

**עם Nginx (מומלץ):**
ראה את המדריך המלא ב-`VPS_DEPLOYMENT_GUIDE.md`

---

## 🔒 אבטחה בסיסית

```bash
# פתח רק את הפורטים הנדרשים
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP (אם יש Nginx)
sudo ufw allow 443/tcp  # HTTPS (אם יש Nginx)
sudo ufw allow 3001/tcp # האפליקציה (אם אין Nginx)
sudo ufw enable
```

---

## ❓ פתרון בעיות מהיר

**השרת לא עובד?**
```bash
pm2 logs moran-app --err
pm2 restart moran-app
```

**נתונים לא נשמרים?**
```bash
ls -la data/
chmod -R 755 data/
pm2 restart moran-app
```

**לא יכול להתחבר?**
```bash
sudo ufw status
pm2 list
netstat -tulpn | grep :3001
```

---

## 📖 מסמכים נוספים

- **מדריך מלא**: `VPS_DEPLOYMENT_GUIDE.md`
- **סיכום שינויים**: `UPGRADE_SUMMARY_VPS.md`

---

**בהצלחה! אם יש בעיות, בדוק את המדריך המלא.** 🚀
