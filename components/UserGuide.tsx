import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

interface GuideSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

const UserGuide: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  const sections: GuideSection[] = [
    {
      id: 'overview',
      title: 'סקירה כללית',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border-r-4 border-blue-400">
            <h3 className="font-bold text-blue-800 mb-2">🏢 ברוכים הבאים למערכת "מחוברות"</h3>
            <p className="text-blue-700">
              מערכת ניהול פיננסי פשוטה וידידותית לקבלני בנייה תחת ניהולה של מורן מרקוביץ'. 
              המערכת מאפשרת מעקב אחר פרויקטים, הכנסות, הוצאות ודוחות בסיסיים בצורה פשוטה.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">✅ יכולות המערכת</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• ניהול פרויקטים פשוט</li>
                <li>• מעקב הכנסות והוצאות</li>
                <li>• מיילסטונים עם אחוזים</li>
                <li>• דוחות בסיסיים</li>
                <li>• פרופיל אישי</li>
                <li>• גיבוי אוטומטי</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-semibold text-amber-800 mb-2">👥 סוגי משתמשים</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• <strong>מנהל על:</strong> גישה לכל המערכת + דאשבורד מנהל</li>
                <li>• <strong>משתמש רגיל:</strong> גישה לפרויקטים האישיים</li>
                <li>• כל משתמש מקבל מערכת נפרדת</li>
                <li>• פרופיל אישי לכל משתמש</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'login',
      title: 'התחברות למערכת',
      content: (
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-bold text-indigo-800 mb-3">🔐 כניסה למערכת</h3>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border border-indigo-200">
                <h4 className="font-semibold text-indigo-700 mb-2">מנהל המערכת:</h4>
                <p className="text-sm text-indigo-600">
                  מנהל המערכת הוא המשתמש העיקרי בעל הרשאות מלאות לכל המערכת.
                </p>
                <p className="text-xs text-indigo-600 mt-2">*הרשאות מלאות - צפייה בכל המשתמשים והפעילות</p>
              </div>
              
              <div className="bg-white p-3 rounded border border-indigo-200">
                <h4 className="font-semibold text-indigo-700 mb-2">משתמש רגיל:</h4>
                <p className="text-sm text-indigo-600">
                  משתמשים רגילים יכולים לנהל רק את הפרוייקטים שלהם.
                </p>
                <p className="text-xs text-indigo-600 mt-2">*גישה לפרוייקטים אישיים בלבד</p>
              </div>
              
              <div className="bg-white p-3 rounded border border-indigo-200">
                <h4 className="font-semibold text-indigo-700 mb-2">קבלת פרטי התחברות:</h4>
                <p className="text-sm text-indigo-600">
                  פרטי ההתחברות יסופקו על ידי מנהל המערכת בנפרד.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border-r-4 border-yellow-400">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ הערות בטיחות</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• שמרו על הסיסמאות במקום בטוח</li>
              <li>• אל תשתפו פרטי התחברות עם אחרים</li>
              <li>• התנתקו מהמערכת כשמסיימים לעבוד</li>
              <li>• רק מנהל המערכת יכול ליצור משתמשים חדשים</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'projects',
      title: 'ניהול פרוייקטים',
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-bold text-purple-800 mb-3">🏗️ יצירה וניהול פרוייקטים</h3>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border border-purple-200">
                <h4 className="font-semibold text-purple-700 mb-2">שלב 1: יצירת פרוייקט חדש</h4>
                <ol className="text-sm text-purple-600 space-y-1 list-decimal list-inside">
                  <li>לחץ על "הוסף פרויקט חדש" בעמוד הראשי</li>
                  <li>מלא שם פרוייקט ותיאור</li>
                  <li>הזן את סכום החוזה הכולל</li>
                  <li>לחץ "שמור פרויקט"</li>
                </ol>
              </div>
              
              <div className="bg-white p-3 rounded border border-purple-200">
                <h4 className="font-semibold text-purple-700 mb-2">שלב 2: הגדרת מיילסטונים</h4>
                <ol className="text-sm text-purple-600 space-y-1 list-decimal list-inside">
                  <li>היכנס לפרוייקט ולחץ על טאב "מיילסטונים"</li>
                  <li>הוסף מיילסטונים עם שם, תיאור וסכום</li>
                  <li>קבע תאריכי יעד לכל מיילסטון</li>
                  <li>עדכן סטטוס כשמיילסטון מושלם</li>
                </ol>
              </div>
            </div>
            
            <div className="bg-green-100 p-3 rounded mt-3">
              <p className="text-xs text-green-700">
                💡 <strong>טיפ:</strong> סכום המיילסטונים צריך להיות שווה לסכום החוזה הכולל
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'income',
      title: 'ניהול הכנסות',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold text-green-800 mb-3">💰 רישום וניהול הכנסות</h3>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">רישום הכנסה חדשה:</h4>
                <ol className="text-sm text-green-600 space-y-1 list-decimal list-inside">
                  <li>היכנס לפרוייקט ולחץ על טאב "הכנסות"</li>
                  <li>לחץ "הוסף הכנסה חדשה"</li>
                  <li>מלא תיאור וסכום כולל</li>
                  <li>בחר אופן תשלום (העברה/מזומן/צ'ק)</li>
                  <li>הזן כמה שולם בפועל</li>
                  <li>הזן תאריך תשלום בפועל (שונה מתאריך הרישום!)</li>
                  <li>הוסף הערות אם נדרש</li>
                </ol>
              </div>
              
              <div className="bg-white p-3 rounded border border-green-200">
                <h4 className="font-semibold text-green-700 mb-2">מעקב תשלומים חלקיים:</h4>
                <ul className="text-sm text-green-600 space-y-1 list-disc list-inside">
                  <li><span className="font-semibold text-green-800">לגבייה:</span> לא שולם כלום</li>
                  <li><span className="font-semibold text-yellow-700">שולם חלקי:</span> שולם חלק מהסכום</li>
                  <li><span className="font-semibold text-green-800">שולם:</span> שולם הסכום המלא</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-blue-100 p-3 rounded mt-3">
              <p className="text-xs text-blue-700">
                📅 <strong>חשוב:</strong> תאריך התשלום בפועל שונה מתאריך הרישום במערכת - זה מאפשר לרשום תשלום שהתקבל בעבר
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'expenses',
      title: 'ניהול הוצאות',
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-bold text-red-800 mb-3">💸 רישום וניהול הוצאות</h3>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border border-red-200">
                <h4 className="font-semibold text-red-700 mb-2">רישום הוצאה חדשה:</h4>
                <ol className="text-sm text-red-600 space-y-1 list-decimal list-inside">
                  <li>היכנס לפרוייקט ולחץ על טאב "הוצאות"</li>
                  <li>לחץ "הוסף הוצאה חדשה"</li>
                  <li>בחר קטגוריה ותת-קטגוריה (אם קיימת)</li>
                  <li>בחר ספק או הוסף ספק חדש</li>
                  <li>מלא תיאור וסכום</li>
                  <li>סמן אם כולל מע"מ (יחושב אוטומטית)</li>
                  <li>בחר סוג הוצאה: רגילה/תוספת/חריגה/עובד יומי</li>
                  <li>סמן אם קיבלת חשבונית והזן מספר</li>
                  <li>הוסף הערות אם נדרש</li>
                </ol>
              </div>
              
              <div className="bg-white p-3 rounded border border-red-200">
                <h4 className="font-semibold text-red-700 mb-2">סוגי הוצאות:</h4>
                <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
                  <li><span className="font-semibold">רגילה:</span> הוצאות שוטפות בפרוייקט</li>
                  <li><span className="font-semibold">תוספת:</span> הוצאות נוספות שלא תוכננו</li>
                  <li><span className="font-semibold">חריגה:</span> הוצאות חריגות מהתקציב</li>
                  <li><span className="font-semibold">עובד יומי:</span> תשלומים לעובדים יומיים</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-orange-100 p-3 rounded mt-3">
              <p className="text-xs text-orange-700">
                🧾 <strong>זכור:</strong> חשוב לסמן האם קיבלת חשבונית ולרשום את המספר למעקב חשבונאי
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      title: 'דוחות ואנליטיקה',
      content: (
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-bold text-indigo-800 mb-3">📊 דוחות פיננסיים מתקדמים</h3>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border border-indigo-200">
                <h4 className="font-semibold text-indigo-700 mb-2">דוח מסכם פרוייקט:</h4>
                <ul className="text-sm text-indigo-600 space-y-1 list-disc list-inside">
                  <li>סה"כ הכנסות מול סה"כ הוצאות</li>
                  <li>רווח נקי וכלל אחוזי רווח</li>
                  <li>יתרת תקציב ומעקב מיילסטונים</li>
                  <li>התפלגות הוצאות לפי קטגוריות</li>
                  <li>מעקב תשלומים ויתרות לגבייה</li>
                </ul>
              </div>
              
              <div className="bg-white p-3 rounded border border-indigo-200">
                <h4 className="font-semibold text-indigo-700 mb-2">ייצוא נתונים:</h4>
                <ul className="text-sm text-indigo-600 space-y-1 list-disc list-inside">
                  <li>ייצוא לאקסל עם כל הפרטים</li>
                  <li>ייצוא דוח PDF מעוצב</li>
                  <li>אפשרויות סינון לפי תאריכים</li>
                  <li>דוחות נפרדים לפי קטגוריות</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-cyan-100 p-3 rounded mt-3">
              <p className="text-xs text-cyan-700">
                💼 <strong>לעסקים:</strong> הדוחות כוללים חישובי מס הכנסה ומע"מ לפי ההגדרות במערכת
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  if (isAdmin) {
    sections.push({
      id: 'admin',
      title: 'ניהול מערכת (מנהל)',
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-bold text-purple-800 mb-3">👑 אפשרויות מנהל מערכת</h3>
            
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border border-purple-200">
                <h4 className="font-semibold text-purple-700 mb-2">ניהול משתמשים:</h4>
                <ul className="text-sm text-purple-600 space-y-1 list-disc list-inside">
                  <li>הוספת משתמשים חדשים למערכת</li>
                  <li>עריכת פרטים והרשאות משתמשים</li>
                  <li>השבתת/הפעלת משתמשים</li>
                  <li>צפייה בפעילות כל המשתמשים</li>
                  <li>מעקב אחר שעות כניסה וכניסה אחרונה</li>
                </ul>
              </div>
              
              <div className="bg-white p-3 rounded border border-purple-200">
                <h4 className="font-semibold text-purple-700 mb-2">לוג פעילות:</h4>
                <ul className="text-sm text-purple-600 space-y-1 list-disc list-inside">
                  <li>מעקב אחר כל הפעולות במערכת</li>
                  <li>רישום מי ביצע מה ומתי</li>
                  <li>חותמות זמן מדויקות</li>
                  <li>סינון לפי משתמש או סוג פעולה</li>
                </ul>
              </div>
              
              <div className="bg-white p-3 rounded border border-purple-200">
                <h4 className="font-semibold text-purple-700 mb-2">הגדרות מערכת:</h4>
                <ul className="text-sm text-purple-600 space-y-1 list-disc list-inside">
                  <li>הגדרת אחוזי מס הכנסה או סכום קבוע</li>
                  <li>הגדרת אחוז מע"מ</li>
                  <li>עדכון פרטי החברה</li>
                  <li>ניהול קטגוריות ותת-קטגוריות</li>
                  <li>ניהול ספקים</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-red-100 p-3 rounded mt-3">
              <p className="text-xs text-red-700">
                ⚡ <strong>הרשאות על:</strong> רק מנהל המערכת יכול לצפות בפרוייקטים של משתמשים אחרים וביצע פעולות ניהול
              </p>
            </div>
          </div>
        </div>
      )
    });
  }

  const getSectionClass = (sectionId: string) => 
    `cursor-pointer p-3 rounded-lg transition-colors duration-200 ${
      activeSection === sectionId 
        ? 'bg-blue-600 text-white' 
        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    }`;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6">
        <div className="flex items-center space-x-4">
          <img 
            src="/mechubarot_logo_M.png" 
            alt="מחוברות - לוגו" 
            className="w-16 h-16 object-contain rounded-full border-2 border-yellow-400 shadow-lg"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
              e.currentTarget.className = "w-12 h-12 object-contain rounded-full";
            }}
          />
          <div>
            <h1 className="text-3xl font-bold">מדריך למשתמש - מערכת מחוברות</h1>
            <p className="text-blue-100 mt-2">ניהול פיננסי מתקדם לקבלני בנייה | בניהול מורן מרקוביץ'</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-4 sticky top-4">
            <h2 className="font-bold text-gray-800 mb-4">תוכן העניינים</h2>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={getSectionClass(section.id)}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {sections.find(s => s.id === activeSection)?.content}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-gray-800 text-white p-6 rounded-lg mt-6 text-center">
        <h3 className="font-bold mb-2">צוות התמיכה</h3>
        <p className="text-gray-300">
          לשאלות או בעיות טכניות, פנו למנהלת המערכת: מורן מרקוביץ'
        </p>
        <p className="text-sm text-gray-400 mt-2">
          המערכת פותחה במיוחד עבור מחוברות - ניהול פרוייקטי בנייה
        </p>
      </div>
    </div>
  );
};

export default UserGuide;
