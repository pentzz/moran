# מנהל פרויקטים לקבלן - מערכת עם שרת

## התקנה והפעלה

### 1. התקנת התלויות
```bash
npm install
```

### 2. הפעלת המערכת

#### לפיתוח (מצב development):
```bash
# הפעלת השרת בנפרד (טרמינל 1):
npm run server

# הפעלת הקליינט בנפרד (טרמינל 2):
npm run dev
```

#### לייצור (מצב production):
```bash
# בניית הפרויקט והפעלת השרת:
npm start
```

### 3. גישה למערכת
- **פיתוח**: http://localhost:5173 (קליינט) + http://localhost:3001 (שרת)
- **ייצור**: http://localhost:3001

### פרטי כניסה:
- **שם משתמש**: `litalb`
- **סיסמה**: `Papi2009`

## תכונות המערכת

### 🔐 אבטחה
- מסך כניסה מאובטח
- אימות משתמש מול שרת
- שמירת מצב התחברות

### 📊 ניהול נתונים
- **שמירה בשרת**: כל הנתונים נשמרים בקבצי JSON בשרת
- **גישה ממספר מכשירים**: הנתונים זמינים מכל מכשיר
- **גיבוי אוטומטי**: הנתונים נשמרים ברגע השינוי

### 📈 דוחות מתקדמים
- ייצוא לאקסל ברמה מקצועית
- עיצוב RTL מושלם
- צביעה מותנית וניתוח פיננסי
- לוגו חברה (🏗️) בדוחות

### 🎨 עיצוב מקצועי
- ממשק עברי מלא
- לוגו מותאם אישית
- עיצוב responsive לכל המכשירים

## מבנה הקבצים

```
📁 data/                 # נתוני השרת (נוצר אוטומטית)
├── projects.json        # נתוני הפרויקטים
└── categories.json      # קטגוריות ההוצאות

📁 services/
├── api.ts              # חיבור לשרת API
└── excelExport.ts      # ייצוא אקסל מתקדם

📁 context/             # ניהול מצב האפליקציה
├── AuthContext.tsx     # אימות משתמשים
├── ProjectsContext.tsx # ניהול פרויקטים
└── CategoriesContext.tsx # ניהול קטגוריות

📁 components/          # רכיבי UI
└── ... (all components)

server.js              # שרת Node.js + Express
logo.png              # לוגו החברה
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - כניסה למערכת

### Projects
- `GET /api/projects` - קבלת כל הפרויקטים
- `POST /api/projects` - יצירת פרויקט חדש
- `PUT /api/projects/:id` - עדכון פרויקט
- `DELETE /api/projects/:id` - מחיקת פרויקט
- `DELETE /api/projects` - מחיקת כל הפרויקטים

### Incomes & Expenses
- `POST /api/projects/:id/incomes` - הוספת הכנסה
- `DELETE /api/projects/:projectId/incomes/:incomeId` - מחיקת הכנסה
- `POST /api/projects/:id/expenses` - הוספת הוצאה
- `DELETE /api/projects/:projectId/expenses/:expenseId` - מחיקת הוצאה

### Categories
- `GET /api/categories` - קבלת כל הקטגוריות
- `POST /api/categories` - יצירת קטגוריה חדשה
- `PUT /api/categories/:id` - עדכון קטגוריה
- `DELETE /api/categories/:id` - מחיקת קטגוריה

## בעיות נפוצות ופתרונות

### השרת לא עולה
```bash
# ודא שהפורט 3001 פנוי:
netstat -ano | findstr :3001

# אם הפורט תפוס, שנה ב-server.js:
const PORT = process.env.PORT || 3002;
```

### שגיאות חיבור לשרת
- ודא שהשרת רץ על http://localhost:3001
- בדוק את הקונסול לשגיאות
- ודא ש יש גישה לאינטרנט לטעינת הספריות

### נתונים לא נשמרים
- ודא שיש הרשאות כתיבה לתיקיית `data/`
- בדוק את לוגי השרת בקונסול

## טכנולוגיות

### Frontend
- React 19 + TypeScript
- Tailwind CSS
- Recharts (גרפים)
- XLSX (ייצוא אקסל)

### Backend
- Node.js + Express
- File-based storage (JSON)
- CORS support

## פיתוח נוסף

להוספת תכונות חדשות:
1. עדכן את ה-API ב-`server.js`
2. הוסף services ב-`services/api.ts`
3. עדכן את ה-context המתאים
4. הוסף רכיבי UI לפי הצורך

---

© 2024 כל הזכויות שמורות לאופיר ברנס
