# מערכת ניהול פרויקטים לקבלן - הוראות העלאה לשרת (מעודכן)

## דרישות השרת
- Node.js 18+ 
- NPM או Yarn
- פורט פנוי (ברירת מחדל: 3001)
- מקום אחסון לגיבויים (מומלץ)

## 🚀 תהליך פריסה חדש ומשופר

### 1. גיבוי נתונים (חשוב!)
```bash
# גיבוי אוטומטי של כל הנתונים
npm run backup-data

# או ידנית:
node scripts/backup-data.js
```

### 2. בניית הפרוייקט עם העתקת נתונים
```bash
# בנייה רגילה
npm run build

# או בנייה עם גיבוי ופריסה
npm run deploy
```

### 3. קבצים להעלאה לשרת
העלה את כל הקבצים והתיקיות הבאות:
- `dist/` - קבצי הפרונטאנד הבנויים (כולל `dist/data/`)
- `server.js` - השרת המעודכן
- `package.json` - התלויות
- `services/` - שירותי סנכרון נתונים
- `scripts/` - סקריפטי גיבוי ושחזור
- `data-backups/` - תיקיית גיבויים (אופציונלי אך מומלץ)
- `logo.png` - לוגו האפליקציה

**הנתונים שלך מוגנים בשלוש דרכים:**
1. **קובץ אוטומטי** - `dist/data/` (נוצר אוטומטית בבנייה)
2. **גיבוי מקומי** - `localStorage` בדפדפן
3. **גיבויים ידניים** - `data-backups/` (עם חותמת זמן)

### 4. התקנה בשרת
```bash
# התקנת תלויות
npm install --production

# הרצת השרת (עם מערכת החדשה)
npm start

# או הרצה ישירה
node server.js
```

### 5. הרשאות תיקיות נתונים (חשוב!)
```bash
# Linux/Mac - הרשאות לכל תיקיות הנתונים
chmod 755 data/ dist/data/ public/data/ 2>/dev/null || true
chmod 644 data/*.json dist/data/*.json public/data/*.json 2>/dev/null || true
chmod 755 data-backups/ scripts/ 2>/dev/null || true

# אם צריך יותר הרשאות:
chmod -R 777 data/ dist/data/ public/data/ data-backups/
```

## 🔍 פתרון בעיות - מערכת משופרת

### 🚨 מדריך מהיר לפתרון בעיות

#### 1. בדיקה ראשונית
```bash
# בדיקת מערכת מורחבת
npm run debug

# בדיקת גיבויים זמינים
node scripts/restore-data.js list

# שחזור מגיבוי אחרון
npm run restore-data
```

#### 2. הנתונים לא נשמרים?
```bash
# בדיקת הרשאות מורחבת
ls -la data/ dist/data/ public/data/ 2>/dev/null || echo "Some directories missing"

# יצירת תיקיות חסרות
mkdir -p data dist/data public/data data-backups

# העתקה ידנית של נתונים אם צריך
cp public/data/*.json data/ 2>/dev/null || echo "No files to copy"
```

#### 3. שחזור נתונים מאובד
```bash
# רשימת גיבויים זמינים
npm run restore-data list

# שחזור מגיבוי ספציפי (תחליף TIMESTAMP)
node scripts/restore-data.js TIMESTAMP

# שחזור מגיבוי אחרון
npm run restore-data
```

#### 4. השרת לא מוצא נתונים
השרת החדש מחפש נתונים בסדר העדיפות הבא:
1. `data/` (עדיפות גבוהה)
2. `public/data/` (פיתוח)
3. `dist/data/` (בנייה)

הנתונים ינצלו אוטומטית לכל התיקיות.

## קובץ .env לפרודקשן (אופציונלי)
צור קובץ `.env` עם:
```
PORT=3001
NODE_ENV=production
```

## הגדרות נוספות

### שירות systemd (Linux)
צור קובץ `/etc/systemd/system/kablan.service`:
```ini
[Unit]
Description=Kablan Project Management
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/app
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
```

הפעל עם:
```bash
sudo systemctl enable kablan
sudo systemctl start kablan
```

### Apache/Nginx Reverse Proxy
הגדר reverse proxy לפורט 3001:

**Apache:**
```apache
ProxyPass / http://localhost:3001/
ProxyPassReverse / http://localhost:3001/
```

**Nginx:**
```nginx
location / {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 🔐 פרטי התחברות
- **שם משתמש:** litalb
- **סיסמה:** Papi2009

## 🔧 תחזוקה שוטפת

### גיבויים אוטומטיים
```bash
# גיבוי ידני
npm run backup-data

# רשימת גיבויים
node scripts/restore-data.js list

# ניקוי גיבויים ישנים (נשמרים 10 אחרונים אוטומטית)
```

### מיקומי נתונים
הנתונים נשמרים במספר מקומות לבטיחות מקסימלית:
- **מכון פרודקשן:** `data/`
- **פיתוח:** `public/data/`
- **בנייה:** `dist/data/`
- **גיבויים:** `data-backups/backup-TIMESTAMP/`
- **דפדפן:** `localStorage`

### מעקב ולוגים
```bash
# הרצה עם לוגים מפורטים
npm run server

# בדיקת מערכת
npm run debug

# בדיקת חיבור פשוטה
curl http://localhost:3001/api/projects -I
```

## 🚀 פתרון בעיות מתקדם

### הנתונים נעלמו לחלוטין?
1. בדוק localStorage בדפדפן (F12 → Application → Local Storage)
2. חפש גיבויים: `ls data-backups/`
3. שחזר מגיבוי: `npm run restore-data`
4. במקרה קיצון: נתונים בסיסיים יווצרו אוטומטית

### השרת לא עולה?
1. בדוק שהפורט 3001 פנוי: `netstat -tlnp | grep 3001`
2. הרץ עם לוגים: `npm run server`
3. בדוק הרשאות תיקיות
4. ודא שכל הקבצים הועלו

### ביצועים איטיים?
הנתונים מסתנכרנים כעת בין מספר מקומות - זה רגיל ובטוח.
