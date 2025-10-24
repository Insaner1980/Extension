import { db, Collection, Note, Tag, NoteTag } from './db';

// Google Drive API endpoints
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

// Backup file name
const BACKUP_FILE_NAME = 'my_notes_backup.json';

// OAuth scopes
export const OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/drive.appdata'
];

interface BackupData {
  version: string;
  timestamp: string;
  collections: Collection[];
  notes: Note[];
  tags: Tag[];
  note_tags: NoteTag[];
}

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

/**
 * Get OAuth token for Google Drive API
 */
export async function getAuthToken(interactive: boolean = false): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!token) {
        reject(new Error('Failed to get auth token'));
      } else {
        resolve(token);
      }
    });
  });
}

/**
 * Remove cached OAuth token (logout)
 */
export async function removeCachedAuthToken(): Promise<void> {
  try {
    const token = await getAuthToken(false);
    return new Promise((resolve, reject) => {
      chrome.identity.removeCachedAuthToken({ token }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Error removing cached token:', error);
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = await getAuthToken(false);
    return !!token;
  } catch (error) {
    return false;
  }
}

/**
 * Backup entire database to Google Drive
 */
export async function backupDatabase(): Promise<void> {
  try {
    // Get auth token
    const token = await getAuthToken(true);

    // Get all data from database
    const [collections, notes, tags, note_tags] = await Promise.all([
      db.collections.toArray(),
      db.notes.toArray(),
      db.tags.toArray(),
      db.note_tags.toArray()
    ]);

    // Convert dates to ISO strings for JSON serialization
    const serializedNotes = notes.map(note => ({
      ...note,
      createdAt: note.createdAt.toISOString()
    }));

    // Create backup data
    const backupData: BackupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      collections,
      notes: serializedNotes as any,
      tags,
      note_tags
    };

    const jsonData = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Check if backup file already exists
    const existingFileId = await findBackupFile(token);

    if (existingFileId) {
      // Update existing file
      await updateDriveFile(token, existingFileId, blob);
      console.log('Backup updated successfully');
    } else {
      // Create new file
      await createDriveFile(token, BACKUP_FILE_NAME, blob);
      console.log('Backup created successfully');
    }
  } catch (error) {
    console.error('Error backing up database:', error);
    throw error;
  }
}

/**
 * Restore database from Google Drive backup
 */
export async function restoreDatabase(): Promise<void> {
  try {
    // Get auth token
    const token = await getAuthToken(true);

    // Find backup file
    const fileId = await findBackupFile(token);

    if (!fileId) {
      throw new Error('No backup file found in Google Drive');
    }

    // Download backup file
    const backupData = await downloadDriveFile(token, fileId);

    // Parse JSON
    const data: BackupData = JSON.parse(backupData);

    // Convert ISO string dates back to Date objects
    const restoredNotes = data.notes.map(note => ({
      ...note,
      createdAt: new Date(note.createdAt as any)
    }));

    // CRITICAL: Use transaction to clear and restore all tables
    await db.transaction('rw', [db.collections, db.notes, db.tags, db.note_tags], async () => {
      // Clear all existing data
      await Promise.all([
        db.collections.clear(),
        db.notes.clear(),
        db.tags.clear(),
        db.note_tags.clear()
      ]);

      // Restore data using bulkPut
      await Promise.all([
        db.collections.bulkPut(data.collections),
        db.notes.bulkPut(restoredNotes as any),
        db.tags.bulkPut(data.tags),
        db.note_tags.bulkPut(data.note_tags)
      ]);
    });

    console.log('Database restored successfully');
  } catch (error) {
    console.error('Error restoring database:', error);
    throw error;
  }
}

/**
 * Find backup file in Google Drive appdata folder
 */
async function findBackupFile(token: string): Promise<string | null> {
  try {
    const query = `name='${BACKUP_FILE_NAME}'`;
    const url = `${DRIVE_API_BASE}/files?spaces=appDataFolder&q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Drive API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const files: DriveFile[] = data.files || [];

    if (files.length > 0) {
      return files[0].id;
    }

    return null;
  } catch (error) {
    console.error('Error finding backup file:', error);
    throw error;
  }
}

/**
 * Create new file in Google Drive appdata folder
 */
async function createDriveFile(token: string, fileName: string, blob: Blob): Promise<string> {
  try {
    // Step 1: Create metadata
    const metadata = {
      name: fileName,
      parents: ['appDataFolder'],
      mimeType: 'application/json'
    };

    // Step 2: Upload using multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });

    const multipartBody = new Blob([
      delimiter,
      'Content-Type: application/json\r\n\r\n',
      metadataBlob,
      delimiter,
      'Content-Type: application/json\r\n\r\n',
      blob,
      closeDelimiter
    ]);

    const url = `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: multipartBody
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Drive API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error creating drive file:', error);
    throw error;
  }
}

/**
 * Update existing file in Google Drive
 */
async function updateDriveFile(token: string, fileId: string, blob: Blob): Promise<void> {
  try {
    const url = `${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=media`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: blob
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Drive API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error updating drive file:', error);
    throw error;
  }
}

/**
 * Download file from Google Drive
 */
async function downloadDriveFile(token: string, fileId: string): Promise<string> {
  try {
    const url = `${DRIVE_API_BASE}/files/${fileId}?alt=media`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Drive API error: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error downloading drive file:', error);
    throw error;
  }
}

/**
 * Get last backup info
 */
export async function getLastBackupInfo(): Promise<{ date: Date; size: string } | null> {
  try {
    const token = await getAuthToken(false);
    const fileId = await findBackupFile(token);

    if (!fileId) {
      return null;
    }

    const url = `${DRIVE_API_BASE}/files/${fileId}?fields=modifiedTime,size`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      date: new Date(data.modifiedTime),
      size: formatBytes(parseInt(data.size || '0'))
    };
  } catch (error) {
    console.error('Error getting backup info:', error);
    return null;
  }
}

/**
 * Format bytes to human readable size
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
