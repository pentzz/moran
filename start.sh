#!/bin/bash

# הפעלת מערכת ניהול פרויקטים לקבלן

echo "🏗️ מתחיל הפעלת מערכת ניהול פרויקטים לקבלן..."

# בדיקת Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js לא מותקן! אנא התקן Node.js 18+ ונסה שוב."
    exit 1
fi

# בדיקת NPM
if ! command -v npm &> /dev/null; then
    echo "❌ NPM לא מותקן! אנא התקן NPM ונסה שוב."
    exit 1
fi

echo "✅ Node.js ו-NPM זמינים"

# התקנת תלויות אם לא קיימות
if [ ! -d "node_modules" ]; then
    echo "📦 מתקין תלויות..."
    npm install --production
fi

# בניית הפרוייקט
echo "🔨 בונה את הפרוייקט..."
npm run build

# יצירת תיקיית נתונים אם לא קיימת
if [ ! -d "data" ]; then
    echo "📁 יוצר תיקיית נתונים..."
    mkdir data
fi

# הגדרת הרשאות לתיקיית נתונים
echo "🔒 מגדיר הרשאות לתיקיית הנתונים..."
chmod 755 data/
if [ -f "data/projects.json" ]; then
    chmod 644 data/*.json
    echo "✅ נמצאו נתונים קיימים - ישמרו בשרת"
fi

echo "🚀 מפעיל את השרת..."
echo "🌐 האפליקציה תהיה זמינה ב: http://localhost:3001"
echo "👤 שם משתמש: litalb"
echo "🔑 סיסמה: Papi2009"
echo ""
echo "לעצירת השרת לחץ Ctrl+C"
echo ""

# הפעלת השרת
npm run server
