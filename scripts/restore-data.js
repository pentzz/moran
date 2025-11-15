// סקריפט לשחזור נתוני JSON מגיבוי
const fs = require('fs').promises;
const path = require('path');

async function restoreData(backupTimestamp = null) {
  console.log('🔄 Starting data restore process...');
  
  const backupDir = path.join(__dirname, '..', 'data-backups');
  
  try {
    // מציאת הגיבוי המתאים
    let selectedBackup;
    
    if (backupTimestamp) {
      selectedBackup = `backup-${backupTimestamp}`;
    } else {
      // מציאת הגיבוי הכי אחרון
      const entries = await fs.readdir(backupDir);
      const backupDirs = entries
        .filter(entry => entry.startsWith('backup-'))
        .sort()
        .reverse();
      
      if (backupDirs.length === 0) {
        throw new Error('No backup directories found');
      }
      
      selectedBackup = backupDirs[0];
    }
    
    const backupPath = path.join(backupDir, selectedBackup);
    console.log(`📂 Restoring from: ${backupPath}`);
    
    // בדיקה שהגיבוי קיים
    await fs.access(backupPath);
    
    // קריאת metadata
    try {
      const metadataPath = path.join(backupPath, 'backup-metadata.json');
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      console.log(`📋 Backup metadata:`, metadata);
    } catch (error) {
      console.log('⚠️  No metadata found, continuing anyway...');
    }
    
    // יצירת תיקיות היעד
    const targetDirectories = [
      path.join(__dirname, '..', 'data'),
      path.join(__dirname, '..', 'public', 'data'),
      path.join(__dirname, '..', 'dist', 'data')
    ];
    
    for (const targetDir of targetDirectories) {
      await fs.mkdir(targetDir, { recursive: true });
      console.log(`📁 Ensured directory exists: ${targetDir}`);
    }
    
    // שחזור קבצים
    const backupFiles = await fs.readdir(backupPath);
    const dataFiles = backupFiles.filter(file => file.endsWith('.json') && file !== 'backup-metadata.json');
    
    let filesRestored = 0;
    
    for (const file of dataFiles) {
      const sourcePath = path.join(backupPath, file);
      
      // קביעת שם הקובץ המקורי (הסרת prefix של התיקייה)
      let originalFileName = file;
      const prefixes = ['public-data-', 'dist-data-', 'data-'];
      for (const prefix of prefixes) {
        if (file.startsWith(prefix)) {
          originalFileName = file.substring(prefix.length);
          break;
        }
      }
      
      // העתקה לכל התיקיות
      for (const targetDir of targetDirectories) {
        const targetPath = path.join(targetDir, originalFileName);
        
        try {
          await fs.copyFile(sourcePath, targetPath);
          console.log(`✅ Restored: ${sourcePath} -> ${targetPath}`);
          filesRestored++;
        } catch (error) {
          console.error(`❌ Failed to restore to ${targetPath}:`, error.message);
        }
      }
    }
    
    console.log(`✅ Restore completed! ${Math.floor(filesRestored / targetDirectories.length)} files restored to ${targetDirectories.length} locations`);
    
  } catch (error) {
    console.error('❌ Restore failed:', error);
    process.exit(1);
  }
}

async function listBackups() {
  console.log('📋 Available backups:');
  
  const backupDir = path.join(__dirname, '..', 'data-backups');
  
  try {
    const entries = await fs.readdir(backupDir);
    const backupDirs = entries
      .filter(entry => entry.startsWith('backup-'))
      .sort()
      .reverse();
    
    if (backupDirs.length === 0) {
      console.log('⚠️  No backups found');
      return;
    }
    
    for (const [index, backup] of backupDirs.entries()) {
      const timestamp = backup.replace('backup-', '').replace(/-/g, ':');
      console.log(`${index + 1}. ${backup} (${timestamp})`);
      
      // מידע נוסף אם יש metadata
      try {
        const metadataPath = path.join(backupDir, backup, 'backup-metadata.json');
        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
        console.log(`   📊 Files: ${metadata.filesBackedUp}, Created: ${metadata.timestamp}`);
      } catch {
        console.log(`   📊 No metadata available`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to list backups:', error);
  }
}

// טיפול בארגומנטים מ-command line
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'list') {
    listBackups();
  } else if (args[0]) {
    restoreData(args[0]);
  } else {
    restoreData();
  }
}

module.exports = { restoreData, listBackups };
