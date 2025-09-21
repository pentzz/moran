// 🔍 סקריפט לבדיקת בעיות שמירת נתונים בשרת

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

async function debugServerData() {
  console.log('🔍 DEBUG - בדיקת מערכת שמירת נתונים');
  console.log('=' .repeat(50));
  
  // בדיקת תיקייה נוכחית
  console.log('📁 Current working directory:', process.cwd());
  
  // בדיקת תיקיית data
  try {
    await fs.access(DATA_DIR);
    console.log('✅ תיקיית data קיימת:', DATA_DIR);
    
    // בדיקת הרשאות
    try {
      await fs.access(DATA_DIR, fs.constants.W_OK);
      console.log('✅ יש הרשאות כתיבה לתיקיית data');
    } catch {
      console.error('❌ אין הרשאות כתיבה לתיקיית data!');
      console.log('💡 פתרון: הרץ chmod 755 data/');
    }
    
    // רשימת קבצים בתיקייה
    const files = await fs.readdir(DATA_DIR);
    console.log('📋 קבצים בתיקיית data:', files);
    
  } catch {
    console.error('❌ תיקיית data לא קיימת!');
    console.log('💡 פתרון: צור תיקייה mkdir data');
  }
  
  // בדיקת קובץ פרויקטים
  try {
    await fs.access(PROJECTS_FILE);
    console.log('✅ קובץ projects.json קיים');
    
    const content = await fs.readFile(PROJECTS_FILE, 'utf8');
    const projects = JSON.parse(content);
    console.log(`📊 מספר פרויקטים בקובץ: ${projects.length}`);
    
    // בדיקת הרשאות לקובץ
    try {
      await fs.access(PROJECTS_FILE, fs.constants.W_OK);
      console.log('✅ יש הרשאות כתיבה לקובץ projects.json');
    } catch {
      console.error('❌ אין הרשאות כתיבה לקובץ projects.json!');
      console.log('💡 פתרון: הרץ chmod 644 public/data/projects.json');
    }
    
  } catch (error) {
    console.error('❌ בעיה עם קובץ projects.json:', error.message);
  }
  
  // ניסיון כתיבת בדיקה
  console.log('\n🧪 ניסיון כתיבת קובץ בדיקה...');
  try {
    const testFile = path.join(DATA_DIR, 'test-write.json');
    const testData = { test: 'data', timestamp: new Date().toISOString() };
    
    await fs.writeFile(testFile, JSON.stringify(testData, null, 2));
    console.log('✅ כתיבת קובץ בדיקה הצליחה!');
    
    // מחיקת קובץ הבדיקה
    await fs.unlink(testFile);
    console.log('✅ מחיקת קובץ בדיקה הצליחה!');
    
  } catch (error) {
    console.error('❌ כתיבת קובץ בדיקה נכשלה:', error.message);
    console.log('💡 זוהי הבעיה העיקרית! בדוק הרשאות תיקייה');
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🏁 בדיקה הושלמה');
}

// הרצת הבדיקה
debugServerData().catch(console.error);
