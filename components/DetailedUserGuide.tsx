import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface GuideSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

const DetailedUserGuide: React.FC = () => {
  const { isAdmin, user } = useAuth();
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
              מערכת ניהול פרויקטים פיננסית מתקדמת לקבלני בנייה
            </p>
            <div className="mt-4 p-4 bg-white rounded border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">פרטי התחברות:</h4>
              {isAdmin ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded">
                    <strong>מנהל המערכת:</strong><br/>
                    שם משתמש: <code className="bg-gray-100 px-1 rounded">moran</code><br/>
                    סיסמה: <code className="bg-gray-100 px-1 rounded">M123456</code>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <strong>משתמש רגיל:</strong><br/>
                    שם משתמש: <code className="bg-gray-100 px-1 rounded">litalb</code><br/>
                    סיסמה: <code className="bg-gray-100 px-1 rounded">Papi2009</code>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 p-3 rounded text-center">
                  <p className="text-blue-700">
                    <strong>פרטי ההתחברות שלך:</strong><br/>
                    שם משתמש: <code className="bg-gray-100 px-1 rounded">{user?.username || 'לא זמין'}</code><br/>
                    סיסמה: <code className="bg-gray-100 px-1 rounded">***</code>
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    פרטי התחברות נוספים זמינים רק למנהל המערכת<br/>
                    לקבלת פרטי התחברות חדשים, פנה למנהל המערכת
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">✅ יכולות המערכת</h4>
              <ul className="text-green-700 space-y-2">
                <li>📁 ניהול פרויקטים מרובים</li>
                <li>💰 מעקב הכנסות עם תשלומים חלקיים</li>
                <li>💸 ניהול הוצאות עם תת-קטגוריות</li>
                <li>🎯 מיילסטונים עם אחוזים אוטומטיים</li>
                <li>📊 דוחות פיננסיים מפורטים</li>
                <li>🏢 ספקים ייחודיים לכל פרויקט</li>
                <li>👤 פרופיל אישי לכל משתמש</li>
                <li>🔍 חיפוש מתקדם וסינון</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 p-6 rounded-lg">
              <h4 className="font-semibold text-amber-800 mb-3">👥 סוגי משתמשים</h4>
              <ul className="text-amber-700 space-y-2">
                <li><strong>מנהל עליון:</strong> גישה מלאה + דאשבורד מנהל</li>
                <li><strong>משתמש רגיל:</strong> פרויקטים אישיים בלבד</li>
                <li>כל משתמש מקבל מערכת נפרדת</li>
                <li>מעקב פעילות מלא לכל משתמש</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'projects',
      title: 'ניהול פרויקטים',
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-bold text-purple-800 mb-4">🏗️ יצירה וניהול פרויקטים</h3>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded border-r-4 border-purple-400">
                <h4 className="font-semibold text-purple-700 mb-2">שלב 1: יצירת פרויקט חדש</h4>
                <div className="text-purple-600 space-y-2">
                  <p><strong>דוגמה:</strong> יצירת פרויקט "בית פרטי ברמת גן"</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>לחץ על "הוסף פרויקט חדש" בעמוד הראשי</li>
                    <li>מלא שם פרויקט: <code className="bg-gray-100 px-1 rounded">בית פרטי ברמת גן</code></li>
                    <li>הוסף תיאור: <code className="bg-gray-100 px-1 rounded">בניית בית פרטי 4 חדרים</code></li>
                    <li>הזן סכום חוזה: <code className="bg-gray-100 px-1 rounded">1,200,000</code> ₪</li>
                    <li>לחץ "שמור פרויקט"</li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-green-400">
                <h4 className="font-semibold text-green-700 mb-2">שלב 2: הוספת מיילסטונים</h4>
                <div className="text-green-600 space-y-2">
                  <p><strong>דוגמה:</strong> מיילסטונים לפרויקט הבית</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>היכנס לפרויקט ולחץ על טאב "מיילסטונים"</li>
                    <li>לחץ "הוסף מיילסטון חדש"</li>
                    <li>שם: <code className="bg-gray-100 px-1 rounded">יסודות</code>, סכום: <code className="bg-gray-100 px-1 rounded">200,000</code> ₪</li>
                    <li>המערכת תחשב אוטומטית: <code className="bg-gray-100 px-1 rounded">16.7%</code> מהתקציב</li>
                    <li>הוסף מיילסטונים נוספים: <code className="bg-gray-100 px-1 rounded">קירות, גג, גמר</code></li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-blue-400">
                <h4 className="font-semibold text-blue-700 mb-2">שלב 3: מעקב התקדמות</h4>
                <div className="text-blue-600 space-y-2">
                  <p><strong>דוגמה:</strong> עדכון סטטוס מיילסטון</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>כשמיילסטון הושלם, לחץ על "ערוך" ליד המיילסטון</li>
                    <li>שנה סטטוס ל: <code className="bg-gray-100 px-1 rounded">הושלם</code></li>
                    <li>המערכת תעדכן את אחוז ההתקדמות אוטומטית</li>
                    <li>בטאב "סיכום" תראה את ההתקדמות הכוללת</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'income',
      title: 'ניהול הכנסות',
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-bold text-green-800 mb-4">💰 רישום וניהול הכנסות</h3>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded border-r-4 border-green-400">
                <h4 className="font-semibold text-green-700 mb-2">רישום הכנסה חדשה</h4>
                <div className="text-green-600 space-y-2">
                  <p><strong>דוגמה:</strong> קבלת תשלום מקדמה מהלקוח</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>היכנס לפרויקט ולחץ על טאב "הכנסות"</li>
                    <li>לחץ "הוסף הכנסה חדשה"</li>
                    <li>תיאור: <code className="bg-gray-100 px-1 rounded">תשלום מקדמה - יסודות</code></li>
                    <li>סכום: <code className="bg-gray-100 px-1 rounded">150,000</code> ₪</li>
                    <li>תאריך: <code className="bg-gray-100 px-1 rounded">15/01/2024</code></li>
                    <li>סטטוס: <code className="bg-gray-100 px-1 rounded">שולם</code></li>
                    <li>לחץ "שמור הכנסה"</li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-blue-400">
                <h4 className="font-semibold text-blue-700 mb-2">תשלומים חלקיים</h4>
                <div className="text-blue-600 space-y-2">
                  <p><strong>דוגמה:</strong> תשלום חלקי של 50,000 ₪ מתוך 200,000 ₪</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>בטאב "הכנסות", לחץ "ערוך" על ההכנסה</li>
                    <li>סמן "תשלום חלקי"</li>
                    <li>הזן סכום התשלום: <code className="bg-gray-100 px-1 rounded">50,000</code></li>
                    <li>המערכת תחשב אוטומטית: <code className="bg-gray-100 px-1 rounded">150,000</code> ₪ נותר</li>
                    <li>סטטוס יהפוך ל: <code className="bg-gray-100 px-1 rounded">חלקי</code></li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-orange-400">
                <h4 className="font-semibold text-orange-700 mb-2">מעקב יתרות</h4>
                <div className="text-orange-600 space-y-2">
                  <p><strong>דוגמה:</strong> מעקב אחר תשלומים נדרשים</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>בטאב "סיכום" תראה את כל ההכנסות</li>
                    <li>סכום כולל: <code className="bg-gray-100 px-1 rounded">150,000</code> ₪</li>
                    <li>יתרה נדרשת: <code className="bg-gray-100 px-1 rounded">50,000</code> ₪</li>
                    <li>אחוז גבייה: <code className="bg-gray-100 px-1 rounded">75%</code></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'expenses',
      title: 'ניהול הוצאות',
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="font-bold text-red-800 mb-4">💸 רישום וניהול הוצאות</h3>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded border-r-4 border-red-400">
                <h4 className="font-semibold text-red-700 mb-2">רישום הוצאה חדשה</h4>
                <div className="text-red-600 space-y-2">
                  <p><strong>דוגמה:</strong> רכישת חומרי בנייה</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>היכנס לפרויקט ולחץ על טאב "הוצאות"</li>
                    <li>לחץ "הוסף הוצאה חדשה"</li>
                    <li>תיאור: <code className="bg-gray-100 px-1 rounded">רכישת בטון ופלדה</code></li>
                    <li>סכום: <code className="bg-gray-100 px-1 rounded">25,000</code> ₪</li>
                    <li>קטגוריה: <code className="bg-gray-100 px-1 rounded">חומרי בנייה</code></li>
                    <li>תת-קטגוריה: <code className="bg-gray-100 px-1 rounded">בטון ופלדה</code></li>
                    <li>ספק: <code className="bg-gray-100 px-1 rounded">חברת בטון גליל</code></li>
                    <li>לחץ "שמור הוצאה"</li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-blue-400">
                <h4 className="font-semibold text-blue-700 mb-2">הוצאות עם תת-קטגוריות</h4>
                <div className="text-blue-600 space-y-2">
                  <p><strong>דוגמה:</strong> הוצאות עבודה</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>קטגוריה: <code className="bg-gray-100 px-1 rounded">עבודה</code></li>
                    <li>תת-קטגוריות: <code className="bg-gray-100 px-1 rounded">פועלים, מהנדס, מנהל עבודה</code></li>
                    <li>סכום פועלים: <code className="bg-gray-100 px-1 rounded">15,000</code> ₪</li>
                    <li>סכום מהנדס: <code className="bg-gray-100 px-1 rounded">8,000</code> ₪</li>
                    <li>סכום מנהל עבודה: <code className="bg-gray-100 px-1 rounded">5,000</code> ₪</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-green-400">
                <h4 className="font-semibold text-green-700 mb-2">מעקב הוצאות לפי קטגוריות</h4>
                <div className="text-green-600 space-y-2">
                  <p><strong>דוגמה:</strong> סיכום הוצאות חודשי</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>חומרי בנייה: <code className="bg-gray-100 px-1 rounded">45,000</code> ₪ (45%)</li>
                    <li>עבודה: <code className="bg-gray-100 px-1 rounded">28,000</code> ₪ (28%)</li>
                    <li>ציוד: <code className="bg-gray-100 px-1 rounded">15,000</code> ₪ (15%)</li>
                    <li>אחר: <code className="bg-gray-100 px-1 rounded">12,000</code> ₪ (12%)</li>
                    <li><strong>סה"כ הוצאות:</strong> <code className="bg-gray-100 px-1 rounded">100,000</code> ₪</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'suppliers',
      title: 'ניהול ספקים',
      content: (
        <div className="space-y-6">
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="font-bold text-indigo-800 mb-4">🏢 ניהול ספקים ייחודיים לפרויקט</h3>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded border-r-4 border-indigo-400">
                <h4 className="font-semibold text-indigo-700 mb-2">הוספת ספק חדש לפרויקט</h4>
                <div className="text-indigo-600 space-y-2">
                  <p><strong>דוגמה:</strong> הוספת ספק בטון לפרויקט</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>היכנס לפרויקט ולחץ על טאב "ספקים"</li>
                    <li>לחץ "הוסף ספק"</li>
                    <li>שם הספק: <code className="bg-gray-100 px-1 rounded">חברת בטון גליל בע"מ</code></li>
                    <li>איש קשר: <code className="bg-gray-100 px-1 rounded">יוסי כהן</code></li>
                    <li>טלפון: <code className="bg-gray-100 px-1 rounded">03-1234567</code></li>
                    <li>אימייל: <code className="bg-gray-100 px-1 rounded">yossi@beton-galil.co.il</code></li>
                    <li>ח.פ: <code className="bg-gray-100 px-1 rounded">123456789</code></li>
                    <li>הערות לפרויקט: <code className="bg-gray-100 px-1 rounded">מחיר מיוחד לפרויקט זה</code></li>
                    <li>לחץ "הוסף ספק"</li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-blue-400">
                <h4 className="font-semibold text-blue-700 mb-2">חיפוש ספקים קיימים</h4>
                <div className="text-blue-600 space-y-2">
                  <p><strong>דוגמה:</strong> חיפוש ספק בטון מהרשימה הכללית</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>בטאב "ספקים", לחץ "הוסף ספק"</li>
                    <li>בשדה החיפוש הקלד: <code className="bg-gray-100 px-1 rounded">בטון</code></li>
                    <li>המערכת תציג: <code className="bg-gray-100 px-1 rounded">חברת בטון גליל</code></li>
                    <li>לחץ על הספק מהרשימה</li>
                    <li>כל הפרטים יועתקו אוטומטית</li>
                    <li>הוסף הערות ספציפיות לפרויקט</li>
                    <li>לחץ "הוסף ספק"</li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-green-400">
                <h4 className="font-semibold text-green-700 mb-2">ניהול ספקי הפרויקט</h4>
                <div className="text-green-600 space-y-2">
                  <p><strong>דוגמה:</strong> רשימת ספקי הפרויקט</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>ספק בטון: <code className="bg-gray-100 px-1 rounded">חברת בטון גליל</code> (מספקים כלליים)</li>
                    <li>ספק פלדה: <code className="bg-gray-100 px-1 rounded">מתכת גליל</code> (ספק ייחודי)</li>
                    <li>ספק ציוד: <code className="bg-gray-100 px-1 rounded">ציוד בנייה כהן</code> (ספק ייחודי)</li>
                    <li>לחץ "ערוך" לעדכון פרטי ספק</li>
                    <li>לחץ "מחק" להסרת ספק מהפרויקט</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      title: 'דוחות וסיכומים',
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-bold text-blue-800 mb-4">📊 דוחות פיננסיים וסיכומים</h3>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded border-r-4 border-blue-400">
                <h4 className="font-semibold text-blue-700 mb-2">דוח סיכום פרויקט</h4>
                <div className="text-blue-600 space-y-2">
                  <p><strong>דוגמה:</strong> סיכום פרויקט "בית פרטי ברמת גן"</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>תקציב כולל:</strong> <code className="bg-gray-100 px-1 rounded">1,200,000</code> ₪</li>
                    <li><strong>הכנסות:</strong> <code className="bg-gray-100 px-1 rounded">900,000</code> ₪ (75%)</li>
                    <li><strong>הוצאות:</strong> <code className="bg-gray-100 px-1 rounded">650,000</code> ₪ (54%)</li>
                    <li><strong>רווח נקי:</strong> <code className="bg-gray-100 px-1 rounded">250,000</code> ₪ (21%)</li>
                    <li><strong>התקדמות מיילסטונים:</strong> <code className="bg-gray-100 px-1 rounded">3/5</code> (60%)</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-green-400">
                <h4 className="font-semibold text-green-700 mb-2">דוח הוצאות לפי קטגוריות</h4>
                <div className="text-green-600 space-y-2">
                  <p><strong>דוגמה:</strong> פירוט הוצאות חודשי</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>חומרי בנייה: <code className="bg-gray-100 px-1 rounded">300,000</code> ₪ (46%)</li>
                    <li>עבודה: <code className="bg-gray-100 px-1 rounded">200,000</code> ₪ (31%)</li>
                    <li>ציוד: <code className="bg-gray-100 px-1 rounded">100,000</code> ₪ (15%)</li>
                    <li>אחר: <code className="bg-gray-100 px-1 rounded">50,000</code> ₪ (8%)</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-orange-400">
                <h4 className="font-semibold text-orange-700 mb-2">מעקב מיילסטונים</h4>
                <div className="text-orange-600 space-y-2">
                  <p><strong>דוגמה:</strong> סטטוס מיילסטונים</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>✅ יסודות: <code className="bg-gray-100 px-1 rounded">200,000</code> ₪ (16.7%) - הושלם</li>
                    <li>✅ קירות: <code className="bg-gray-100 px-1 rounded">300,000</code> ₪ (25%) - הושלם</li>
                    <li>🔄 גג: <code className="bg-gray-100 px-1 rounded">250,000</code> ₪ (20.8%) - בתהליך</li>
                    <li>⏳ גמר: <code className="bg-gray-100 px-1 rounded">450,000</code> ₪ (37.5%) - ממתין</li>
                  </ul>
                </div>
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
                <h3 className="font-bold text-indigo-800 mb-4">⚡ דאשבורד מנהל מתקדם</h3>
                <div className="text-indigo-700 mb-3">
                  כמנהל, יש לך גישה לדאשבורד מנהל מיוחד עם תכונות מתקדמות.
                </div>
                <div className="bg-white p-4 rounded">
                  <h4 className="font-semibold text-indigo-700 mb-2">פעולות מהירות בדאשבורד:</h4>
                  <ul className="text-indigo-600 space-y-1 text-sm">
                    <li>• <strong>כל הפרויקטים:</strong> צפייה בכל הפרויקטים עם חיפוש ומסננים</li>
                    <li>• <strong>מעקב פעילות:</strong> לוג מפורט של כל הפעולות במערכת</li>
                    <li>• <strong>ניהול משתמשים:</strong> הוספה, עריכה, צפייה כמשתמש אחר</li>
                    <li>• <strong>הגדרות מערכת:</strong> שינוי הגדרות כלליות (רק למנהל)</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="font-bold text-yellow-800 mb-4">🔍 חיפוש מתקדם בכל הפרויקטים</h3>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded">
                    <h4 className="font-semibold text-yellow-700 mb-2">דוגמה: חיפוש פרויקטים</h4>
                    <div className="text-yellow-600 space-y-1 text-sm">
                      <p><strong>חיפוש לפי שם:</strong> הקלד "בית" למציאת כל הפרויקטים עם "בית" בשם</p>
                      <p><strong>חיפוש לפי משתמש:</strong> בחר "ליטל ב" לראות רק את הפרויקטים שלה</p>
                      <p><strong>מיון לפי רווח:</strong> ראה את הפרויקטים הרווחיים ביותר</p>
                      <p><strong>מסנן סטטוס:</strong> בחר "פעילים" או "ארכיון"</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-bold text-green-800 mb-4">📈 מעקב פעילות מתקדם</h3>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded">
                    <h4 className="font-semibold text-green-700 mb-2">דוגמה: מעקב פעילות</h4>
                    <div className="text-green-600 space-y-1 text-sm">
                      <p><strong>מסנן זמן:</strong> "היום" לראות פעולות של היום</p>
                      <p><strong>מסנן משתמש:</strong> "מורן" לראות רק את הפעולות שלי</p>
                      <p><strong>מסנן פעולה:</strong> "יצר" לראות רק יצירות חדשות</p>
                      <p><strong>חיפוש חופשי:</strong> "בטון" למציאת כל הפעולות הקשורות לבטון</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h3 className="font-bold text-gray-600 mb-2">👤 משתמש רגיל</h3>
              <p className="text-gray-500 mb-3">
                תכונות מנהל זמינות רק למנהל המערכת
              </p>
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="text-xs text-yellow-700">
                  🔒 <strong>אבטחה:</strong> פרטי התחברות של משתמשים אחרים מוגנים<br/>
                  לקבלת הרשאות נוספות, פנה למנהל המערכת
                </p>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'mobile',
      title: 'שימוש במובייל',
      content: (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-6 rounded-lg border-2 border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3 sm:mb-4 text-base sm:text-lg">📱 המערכת מותאמת במלואה למכשירים ניידים</h3>
            <p className="text-blue-700 text-sm sm:text-base mb-3">
              כעת תוכלו לנהל את הפרויקטים שלכם בנוחות מכל מקום - מהטלפון, הטאבלט או המחשב!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">📱</div>
                <h4 className="font-semibold text-blue-700 mb-2 text-sm sm:text-base">סמארטפון</h4>
                <p className="text-blue-600 text-xs sm:text-sm">תצוגה מותאמת למסכים קטנים עם תפריטים ידידותיים למגע</p>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">📱</div>
                <h4 className="font-semibold text-blue-700 mb-2 text-sm sm:text-base">טאבלט</h4>
                <p className="text-blue-600 text-xs sm:text-sm">ניצול מיטבי של שטח המסך עם עיצוב רספונסיבי</p>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                <div className="text-2xl mb-2">💻</div>
                <h4 className="font-semibold text-blue-700 mb-2 text-sm sm:text-base">מחשב</h4>
                <p className="text-blue-600 text-xs sm:text-sm">חוויה מלאה עם כל התכונות המתקדמות</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 sm:p-6 rounded-lg">
            <h3 className="font-bold text-purple-800 mb-3 sm:mb-4 text-base sm:text-lg">✨ תכונות מותאמות למובייל</h3>

            <div className="space-y-3 sm:space-y-4">
              <div className="bg-white p-3 sm:p-4 rounded border-r-4 border-purple-400">
                <h4 className="font-semibold text-purple-700 mb-2 text-sm sm:text-base">🎯 כפתורים גדולים ונוחים למגע</h4>
                <p className="text-purple-600 text-xs sm:text-sm">
                  כל הכפתורים במערכת תוכננו להיות נוחים ללחיצה במובייל, עם גודל מינימלי של 44x44 פיקסלים
                </p>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded border-r-4 border-green-400">
                <h4 className="font-semibold text-green-700 mb-2 text-sm sm:text-base">📋 טבלאות הופכות לכרטיסים</h4>
                <p className="text-green-600 text-xs sm:text-sm">
                  במסכים קטנים, טבלאות מורכבות מוצגות כרשימת כרטיסים נוחים לגלילה
                </p>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded border-r-4 border-blue-400">
                <h4 className="font-semibold text-blue-700 mb-2 text-sm sm:text-base">📊 גרפים רספונסיביים</h4>
                <p className="text-blue-600 text-xs sm:text-sm">
                  כל הגרפים והתרשימים מתאימים את עצמם אוטומטית לגודל המסך
                </p>
              </div>

              <div className="bg-white p-3 sm:p-4 rounded border-r-4 border-orange-400">
                <h4 className="font-semibold text-orange-700 mb-2 text-sm sm:text-base">↔️ גלילה אופקית חכמה</h4>
                <p className="text-orange-600 text-xs sm:text-sm">
                  טאבים ותפריטים רחבים ניתנים לגלילה אופקית בצורה חלקה
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 sm:p-6 rounded-lg">
            <h3 className="font-bold text-amber-800 mb-3 sm:mb-4 text-base sm:text-lg">💡 טיפים לשימוש במובייל</h3>
            <div className="space-y-2 text-xs sm:text-sm text-amber-700">
              <div className="flex items-start gap-2">
                <span className="text-base sm:text-lg">✓</span>
                <p><strong>סובבו את המסך:</strong> חלק מהטבלאות והדוחות נוחים יותר לצפייה במצב אופקי (Landscape)</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base sm:text-lg">✓</span>
                <p><strong>זום:</strong> ניתן לעשות זום (pinch to zoom) על גרפים ותרשימים לצפייה מפורטת</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base sm:text-lg">✓</span>
                <p><strong>שמירה למסך הבית:</strong> הוסיפו את המערכת למסך הבית של הטלפון לגישה מהירה</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-base sm:text-lg">✓</span>
                <p><strong>חיבור יציב:</strong> המערכת פועלת גם ללא אינטרנט ומסנכרנת אוטומטית בחזרה</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tips',
      title: 'טיפים ועצות',
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 sm:p-6 rounded-lg">
            <h3 className="font-bold text-green-800 mb-4 text-base sm:text-lg">💡 טיפים לשימוש נכון</h3>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded border-r-4 border-green-400">
                <h4 className="font-semibold text-green-700 mb-2">🎯 מיילסטונים</h4>
                <div className="text-green-600 space-y-2">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>סכום כל המיילסטונים צריך להיות שווה לסכום החוזה הכולל</li>
                    <li>המערכת מחשבת אוטומטית את האחוז מכל מיילסטון</li>
                    <li>עדכן סטטוס מיילסטון כשהעבודה הושלמה</li>
                    <li>השתמש בתיאורים ברורים למיילסטונים</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-blue-400">
                <h4 className="font-semibold text-blue-700 mb-2">💰 תשלומים</h4>
                <div className="text-blue-600 space-y-2">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>רשום תשלומים חלקיים כדי לעקוב אחר יתרות</li>
                    <li>השתמש בסטטוס "חלקי" לתשלומים לא מלאים</li>
                    <li>עדכן תאריך תשלום אמיתי כשהכסף מתקבל</li>
                    <li>הוסף הערות לתשלומים מיוחדים</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded border-r-4 border-purple-400">
                <h4 className="font-semibold text-purple-700 mb-2">📊 דוחות</h4>
                <div className="text-purple-600 space-y-2">
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>השתמש בטאב "סיכום" לראות את המצב הפיננסי</li>
                    <li>בדוק את אחוז ההתקדמות במיילסטונים</li>
                    <li>עקוב אחר הוצאות לפי קטגוריות</li>
                    <li>השתמש בדוחות לניתוח רווחיות</li>
                  </ul>
                </div>
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
              <li>🔄 רענון הדף לא יגרום להתנתקות</li>
              <li>📊 כל הנתונים נשמרים בשרת - לא יאבדו</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 md:p-6">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-lg">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center">📚 מדריך מפורט למערכת מחוברות</h1>
          <p className="text-sm sm:text-base text-gray-600 text-center mt-2">מדריך מקיף עם דוגמאות מפורטות לכל פעולה</p>
          <div className="mt-3 text-center">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              💡 גרסה מותאמת למובייל וטאבלט
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex flex-nowrap gap-1 sm:gap-2 px-2 sm:px-4 md:px-6 overflow-x-auto scrollbar-hide py-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-2 px-2 sm:px-3 md:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap rounded-t-lg transition-all duration-200 touch-manipulation ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50 shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-100'
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
          {sections.find(s => s.id === activeSection)?.content}
        </div>
      </div>
    </div>
  );
};

export default DetailedUserGuide;
