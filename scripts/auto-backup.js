#!/usr/bin/env node

/**
 * Automatic Backup Script
 * Creates timestamped backups of all data files
 * Deletes backups older than retention period
 */

const fs = require('fs').promises;
const path = require('path');

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data');
const BACKUP_BASE_DIR = path.join(__dirname, '..', 'data-backups');
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
const MAX_BACKUPS = 50; // Maximum number of backups to keep

// List of files to backup
const FILES_TO_BACKUP = [
  'projects.json',
  'categories.json',
  'suppliers.json',
  'users.json',
  'notifications.json',
  'settings.json'
];

/**
 * Format date for backup folder name
 */
function getBackupTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `backup-${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Create backup of all data files
 */
async function createBackup() {
  try {
    console.log('🔄 Starting automatic backup...');

    // Ensure backup directory exists
    await fs.mkdir(BACKUP_BASE_DIR, { recursive: true });

    // Create timestamped backup folder
    const backupTimestamp = getBackupTimestamp();
    const backupDir = path.join(BACKUP_BASE_DIR, backupTimestamp);
    await fs.mkdir(backupDir, { recursive: true });

    // Copy each file
    let backedUpFiles = 0;
    for (const file of FILES_TO_BACKUP) {
      const sourcePath = path.join(DATA_DIR, file);
      const destPath = path.join(backupDir, file);

      try {
        await fs.access(sourcePath);
        await fs.copyFile(sourcePath, destPath);
        console.log(`  ✓ Backed up: ${file}`);
        backedUpFiles++;
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(`  ⚠ Skipped (not found): ${file}`);
        } else {
          console.error(`  ✗ Error backing up ${file}:`, error.message);
        }
      }
    }

    // Create metadata file
    const metadata = {
      timestamp: new Date().toISOString(),
      filesBackedUp: backedUpFiles,
      backupPath: backupDir,
      retention: `${RETENTION_DAYS} days`
    };

    await fs.writeFile(
      path.join(backupDir, 'backup-info.json'),
      JSON.stringify(metadata, null, 2)
    );

    console.log(`✅ Backup completed: ${backupTimestamp}`);
    console.log(`   Files backed up: ${backedUpFiles}/${FILES_TO_BACKUP.length}`);
    console.log(`   Location: ${backupDir}`);

    return backupDir;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

/**
 * Delete old backups based on retention policy
 */
async function cleanOldBackups() {
  try {
    console.log('\n🧹 Cleaning old backups...');

    const backups = await fs.readdir(BACKUP_BASE_DIR);
    const backupDirs = [];

    // Get all backup directories with their creation time
    for (const backup of backups) {
      const backupPath = path.join(BACKUP_BASE_DIR, backup);
      const stats = await fs.stat(backupPath);

      if (stats.isDirectory() && backup.startsWith('backup-')) {
        backupDirs.push({
          name: backup,
          path: backupPath,
          created: stats.birthtime
        });
      }
    }

    // Sort by creation time (oldest first)
    backupDirs.sort((a, b) => a.created - b.created);

    let deletedCount = 0;
    const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;
    const now = Date.now();

    for (const backup of backupDirs) {
      const age = now - backup.created.getTime();
      const shouldDelete =
        age > retentionMs ||
        backupDirs.length - deletedCount > MAX_BACKUPS;

      if (shouldDelete) {
        try {
          await fs.rm(backup.path, { recursive: true, force: true });
          console.log(`  ✓ Deleted old backup: ${backup.name}`);
          deletedCount++;
        } catch (error) {
          console.error(`  ✗ Failed to delete ${backup.name}:`, error.message);
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`✅ Cleaned up ${deletedCount} old backup(s)`);
    } else {
      console.log('✅ No old backups to clean');
    }

    const remaining = backupDirs.length - deletedCount;
    console.log(`   Remaining backups: ${remaining}`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

/**
 * Get backup statistics
 */
async function getBackupStats() {
  try {
    const backups = await fs.readdir(BACKUP_BASE_DIR);
    let totalSize = 0;
    let count = 0;

    for (const backup of backups) {
      const backupPath = path.join(BACKUP_BASE_DIR, backup);
      const stats = await fs.stat(backupPath);

      if (stats.isDirectory() && backup.startsWith('backup-')) {
        count++;
        // Calculate directory size
        const files = await fs.readdir(backupPath);
        for (const file of files) {
          const filePath = path.join(backupPath, file);
          const fileStats = await fs.stat(filePath);
          totalSize += fileStats.size;
        }
      }
    }

    const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`\n📊 Backup Statistics:`);
    console.log(`   Total backups: ${count}`);
    console.log(`   Total size: ${sizeMB} MB`);
    console.log(`   Average size: ${(sizeMB / count || 0).toFixed(2)} MB`);

  } catch (error) {
    console.error('Failed to get stats:', error);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('═══════════════════════════════════════');
    console.log('  Moran - Automatic Backup System');
    console.log('═══════════════════════════════════════\n');

    // Create backup
    await createBackup();

    // Clean old backups
    await cleanOldBackups();

    // Show statistics
    await getBackupStats();

    console.log('\n═══════════════════════════════════════');
    console.log('✅ Backup process completed successfully!');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Backup process failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { createBackup, cleanOldBackups, getBackupStats };
