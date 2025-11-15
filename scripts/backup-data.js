// סקריפט לגיבוי נתוני JSON לפני פריסה
const fs = require('fs').promises;
const path = require('path');

async function backupData() {
  console.log('🔄 Starting data backup process...');
  
  const sourceDirectories = [
    path.join(__dirname, '..', 'public', 'data'),
    path.join(__dirname, '..', 'dist', 'data'),
    path.join(__dirname, '..', 'data')
  ];
  
  const backupDir = path.join(__dirname, '..', 'data-backups');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const timestampedBackupDir = path.join(backupDir, `backup-${timestamp}`);
  
  try {
    // יצירת תיקיית גיבוי
    await fs.mkdir(timestampedBackupDir, { recursive: true });
    console.log(`📁 Created backup directory: ${timestampedBackupDir}`);
    
    const dataFiles = ['projects.json', 'categories.json', 'suppliers.json'];
    let filesBackedUp = 0;
    
    // חיפוש קבצים בכל התיקיות האפשריות
    for (const sourceDir of sourceDirectories) {
      try {
        await fs.access(sourceDir);
        console.log(`🔍 Checking directory: ${sourceDir}`);
        
        for (const file of dataFiles) {
          const sourcePath = path.join(sourceDir, file);
          const backupPath = path.join(timestampedBackupDir, `${path.basename(sourceDir)}-${file}`);
          
          try {
            await fs.access(sourcePath);
            await fs.copyFile(sourcePath, backupPath);
            console.log(`✅ Backed up: ${sourcePath} -> ${backupPath}`);
            filesBackedUp++;
          } catch (error) {
            console.log(`⚠️  File not found: ${sourcePath}`);
          }
        }
      } catch (error) {
        console.log(`⚠️  Directory not accessible: ${sourceDir}`);
      }
    }
    
    // שמירת metadata של הגיבוי
    const metadata = {
      timestamp: new Date().toISOString(),
      filesBackedUp,
      sourceDirectories: sourceDirectories.filter(async dir => {
        try {
          await fs.access(dir);
          return true;
        } catch {
          return false;
        }
      })
    };
    
    await fs.writeFile(
      path.join(timestampedBackupDir, 'backup-metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(`✅ Backup completed! ${filesBackedUp} files backed up to ${timestampedBackupDir}`);
    
    // ניקוי גיבויים ישנים (שמירת 10 אחרונים)
    await cleanOldBackups(backupDir);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  }
}

async function cleanOldBackups(backupDir) {
  try {
    const entries = await fs.readdir(backupDir);
    const backupDirs = entries
      .filter(entry => entry.startsWith('backup-'))
      .sort()
      .reverse(); // הכי חדש קודם
    
    if (backupDirs.length > 10) {
      const dirsToDelete = backupDirs.slice(10);
      for (const dir of dirsToDelete) {
        const fullPath = path.join(backupDir, dir);
        await fs.rmdir(fullPath, { recursive: true });
        console.log(`🗑️  Cleaned old backup: ${dir}`);
      }
    }
  } catch (error) {
    console.log('⚠️  Failed to clean old backups:', error.message);
  }
}

if (require.main === module) {
  backupData();
}

module.exports = { backupData };
