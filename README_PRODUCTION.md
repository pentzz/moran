# מערכת ניהול פרויקטים לקבלן - הוראות העלאה לשרת

## דרישות השרת
- Node.js 18+ 
- NPM או Yarn
- פורט פנוי (ברירת מחדל: 3001)

## הכנה לפרודקשן

### 1. בניית הפרוייקט
```bash
npm run build
```

### 2. העלאה לשרת
העלה את כל הקבצים לשרת שלך, כולל:
- `dist/` - קבצי הפרונטאנד הבנויים
- `server.js` - השרת
- `package.json` - התלויות
- `data/` - **תיקיית הנתונים הקיימים (חשוב מאוד!)**
  - `projects.json` - כל הפרויקטים שלך
  - `categories.json` - הקטגוריות שיצרת
  - `suppliers.json` - רשימת הספקים
- `logo.png` - לוגו האפליקציה
- `.gitkeep` - קובץ לשמירת תיקיית data

### 3. התקנה בשרת
```bash
# התקנת תלויות
npm install --production

# הרצת השרת
npm start
```

### 4. הרשאות תיקיית נתונים (חשוב!)
ודא שלשרת יש הרשאות כתיבה לתיקיית data:
```bash
# Linux/Mac
chmod 755 data/
chmod 644 data/*.json

# או אם צריך יותר הרשאות:
chmod 777 data/
```

## 🔍 אם יש בעיות עם שמירת נתונים

### בדיקה ראשונית
```bash
# הרץ בדיקת מערכת
npm run debug
```

### 🛠️ פתרונות נפוצים

#### 1. אין הרשאות לתיקייה
```bash
chmod 755 data/
chmod 644 data/*.json
```

#### 2. תיקיית data לא קיימת
```bash
mkdir data
```

#### 3. הקבצים לא הועלו
ודא שהועלו:
- data/projects.json
- data/categories.json  
- data/suppliers.json
- data/.gitkeep

#### 4. בעיות כלליות
- ודא שהפורט 3001 פנוי
- בדוק שכל הקבצים הועלו למקום הנכון
- הסתכל בלוגים של השרת לפרטים נוספים

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

## נתוני ברירת מחדל
- **שם משתמש:** litalb
- **סיסמה:** Papi2009
- **נתונים נשמרים ב:** `data/` directory

## תחזוקה
- גיבוי קבצי JSON מתיקיית `data/`
- לוגים נשמרים ב-console
- הפעלה מחדש: `npm restart` או systemctl restart

## פתרון בעיות
1. ודא שפורט 3001 פנוי
2. ודא שיש הרשאות קריאה/כתיבה לתיקיית `data/`
3. בדוק לוגים עם `npm run server` (ללא background)
