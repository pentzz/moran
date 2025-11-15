import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface GuideSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

const SimpleUserGuide: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  const sections: GuideSection[] = [
    {
      id: 'overview',
      title: 'התחלה מהירה',
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg border-r-4 border-blue-400">
            <h3 className="font-bold text-blue-800 mb-3">🏢 ברוכים הבאים למערכת "מחוברות"</h3>
            <p className="text-blue-700 text-lg">
              מערכת פשוטה וידידותית לניהול פרויקטים פיננסיים
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">✅ מה המערכת מאפשרת</h4>
              <ul className="text-green-700 space-y-2">
                <li>📁 ניהול פרויקטים</li>
                <li>💰 מעקב הכנסות והוצאות</li>
                <li>🎯 מיילסטונים עם אחוזים</li>
                <li>📊 דוחות פיננסיים</li>
                <li>👤 פרופיל אישי</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-lg">
              <h4 className="font-semibold text-amber-800 mb-3">👥 סוגי משתמשים</h4>
              <ul className="text-amber-700 space-y-2">
                <li><strong>מנהל:</strong> גישה מלאה + דאשבורד</li>
                <li><strong>משתמש:</strong> פרויקטים אישיים</li>
                <li>כל משתמש מקבל מערכת נפרדת</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'basics',
      title: 'פעולות בסיסיות',
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-bold text-purple-800 mb-4">🏗️ עבודה עם פרויקטים</h3>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded border-r-4 border-purple-400">
                <h4 className="font-semibold text-purple-700 mb-2">יצירת פרויקט חדש</h4>
                <p className="text-purple-600">
                  לחץ "הוסף פרויקט חדש" ← מלא שם ותיאור ← הזן סכום חוזה ← שמור
                </p>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-green-400">
                <h4 className="font-semibold text-green-700 mb-2">הוספת הכנסות</h4>
                <p className="text-green-600">
                  כנס לפרויקט ← טאב "הכנסות" ← הוסף הכנסה ← מלא פרטים ← שמור
                </p>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-red-400">
                <h4 className="font-semibold text-red-700 mb-2">הוספת הוצאות</h4>
                <p className="text-red-600">
                  כנס לפרויקט ← טאב "הוצאות" ← הוסף הוצאה ← בחר קטגוריה ← שמור
                </p>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-blue-400">
                <h4 className="font-semibold text-blue-700 mb-2">מיילסטונים</h4>
                <p className="text-blue-600">
                  טאב "מיילסטונים" ← הוסף מיילסטון ← הזן סכום (יחושב אחוז אוטומטי) ← שמור
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'admin',
      title: 'תכונות מנהל',
      content: (
        <div className="space-y-6">
          {isAdmin ? (
            <>
              <div className="bg-indigo-50 p-6 rounded-lg">
                <h3 className="font-bold text-indigo-800 mb-4">⚡ דאשבורד מנהל</h3>
                <p className="text-indigo-700 mb-3">
                  כמנהל, יש לך גישה לדאשבורד מנהל מיוחד עם סטטיסטיקות ופעולות מהירות.
                </p>
                <div className="bg-white p-4 rounded">
                  <h4 className="font-semibold text-indigo-700 mb-2">לחיצה על הכפתור ⚡ בכותרת</h4>
                  <ul className="text-indigo-600 space-y-1">
                    <li>• סיכום כל הפרויקטים במערכת</li>
                    <li>• סטטיסטיקות משתמשים</li>
                    <li>• פעולות מהירות לניהול</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="font-bold text-yellow-800 mb-4">👥 ניהול משתמשים</h3>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded">
                    <h4 className="font-semibold text-yellow-700 mb-2">הוספת משתמש חדש</h4>
                    <p className="text-yellow-600">
                      כותרת → כפתור משתמשים → "הוסף משתמש חדש" → מלא פרטים → שמור
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded">
                    <h4 className="font-semibold text-yellow-700 mb-2">צפייה במשתמש אחר</h4>
                    <p className="text-yellow-600">
                      ניהול משתמשים → לחץ "צפה כמשתמש" → תראה את המערכת מנקודת המבט שלו
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="font-bold text-gray-600 mb-2">👤 משתמש רגיל</h3>
              <p className="text-gray-500">
                תכונות מנהל זמינות רק למנהל המערכת
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'tips',
      title: 'טיפים חשובים',
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-bold text-green-800 mb-4">💡 טיפים לשימוש נכון</h3>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded border-r-4 border-green-400">
                <h4 className="font-semibold text-green-700 mb-2">🎯 מיילסטונים</h4>
                <p className="text-green-600">
                  סכום כל המיילסטונים צריך להיות שווה לסכום החוזה הכולל
                </p>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-blue-400">
                <h4 className="font-semibold text-blue-700 mb-2">💰 תשלומים</h4>
                <p className="text-blue-600">
                  ניתן לרשום תשלומים חלקיים ולעקוב אחר יתרות
                </p>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-purple-400">
                <h4 className="font-semibold text-purple-700 mb-2">📊 דוחות</h4>
                <p className="text-purple-600">
                  השתמש בטאב "סיכום" לראות את המצב הפיננסי של הפרויקט
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="font-bold text-red-800 mb-4">⚠️ הערות חשובות</h3>
            <ul className="text-red-700 space-y-2">
              <li>🔒 שמור על פרטי ההתחברות בסוד</li>
              <li>💾 המערכת שומרת אוטומטית - לא צריך לחסוך ידנית</li>
              <li>🌐 ניתן לגשת מכל מכשיר עם אותם פרטי התחברות</li>
              <li>📱 המערכת מותאמת לנייד וטאבלט</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 text-center">מדריך למשתמש - מערכת מחוברות</h1>
          <p className="text-gray-600 text-center mt-2">מדריך פשוט ומהיר לשימוש במערכת</p>
        </div>

        {/* Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {sections.find(s => s.id === activeSection)?.content}
        </div>
      </div>
    </div>
  );
};

export default SimpleUserGuide;
