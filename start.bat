@echo off
echo 🏗️ מתחיל הפעלת מערכת ניהול פרויקטים לקבלן...

REM בדיקת Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js לא מותקן! אנא התקן Node.js 18+ ונסה שוב.
    pause
    exit /b 1
)

REM בדיקת NPM
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ NPM לא מותקן! אנא התקן NPM ונסה שוב.
    pause
    exit /b 1
)

echo ✅ Node.js ו-NPM זמינים

REM התקנת תלויות אם לא קיימות
if not exist "node_modules" (
    echo 📦 מתקין תלויות...
    npm install --production
)

REM בניית הפרוייקט
echo 🔨 בונה את הפרוייקט...
npm run build

REM יצירת תיקיית נתונים אם לא קיימת
if not exist "data" (
    echo 📁 יוצר תיקיית נתונים...
    mkdir data
)

echo 🚀 מפעיל את השרת...
echo 🌐 האפליקציה תהיה זמינה ב: http://localhost:3001
echo 👤 שם משתמש: litalb
echo 🔑 סיסמה: Papi2009
echo.
echo לעצירת השרת לחץ Ctrl+C
echo.

REM הפעלת השרת
npm run server

pause
