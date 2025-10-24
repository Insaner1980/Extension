import React, { useState, useEffect, useRef } from 'react';
import {
  getAuthToken,
  removeCachedAuthToken,
  isAuthenticated,
  backupDatabase,
  restoreDatabase,
  getLastBackupInfo
} from '../services/driveSync';
import { exportAllData, importData } from '../services/db';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WarningIcon from '@mui/icons-material/Warning';
import styles from './Settings.module.css';

// Feature flag: Set to false to disable Google Drive sync
const ENABLE_GOOGLE_DRIVE_SYNC = false;

const Settings: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<{ date: Date; size: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ENABLE_GOOGLE_DRIVE_SYNC) {
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    if (!ENABLE_GOOGLE_DRIVE_SYNC) return;

    try {
      const authenticated = await isAuthenticated();
      setIsLoggedIn(authenticated);

      if (authenticated) {
        loadBackupInfo();
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    }
  };

  const loadBackupInfo = async () => {
    try {
      const info = await getLastBackupInfo();
      setLastBackup(info);
    } catch (err) {
      console.error('Error loading backup info:', err);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await getAuthToken(true);
      setIsLoggedIn(true);
      setSuccess('Successfully logged in to Google Drive!');
      await loadBackupInfo();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(`Login failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await removeCachedAuthToken();
      setIsLoggedIn(false);
      setLastBackup(null);
      setSuccess('Successfully logged out from Google Drive');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(`Logout failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await backupDatabase();
      setSuccess('Backup completed successfully!');
      await loadBackupInfo();
    } catch (err: any) {
      console.error('Backup error:', err);
      setError(`Backup failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    const confirmed = confirm(
      'This will replace ALL your current notes with the backup from Google Drive. Are you sure?'
    );

    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await restoreDatabase();
      setSuccess('Database restored successfully! Please refresh the page.');

      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error('Restore error:', err);
      setError(`Restore failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Local export: Download JSON file
  const handleLocalExport = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await exportAllData();

      // Create JSON blob
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-notes-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess('Backup downloaded successfully!');
    } catch (err: any) {
      console.error('Export error:', err);
      setError(`Export failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Local import: Upload JSON file
  const handleLocalImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const confirmed = confirm(
      'This will replace ALL your current notes with the backup file. Are you sure?'
    );

    if (!confirmed) {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Read file
      const text = await file.text();
      const data = JSON.parse(text);

      // Import data
      await importData(data);

      setSuccess('Backup restored successfully! Reloading page...');

      // Reload after short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error('Import error:', err);
      setError(`Import failed: ${err.message}`);
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={styles.settings}>
      <div className={styles.header}>
        <h2 className={styles.title}>Settings</h2>
      </div>

      {ENABLE_GOOGLE_DRIVE_SYNC ? (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Google Drive Sync</h3>

          {!isLoggedIn ? (
          <div className={styles.loginSection}>
            <p className={styles.description}>
              Connect to Google Drive to backup and sync your notes across devices.
            </p>
            <button
              className={styles.primaryButton}
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : '🔐 Login to Google Drive'}
            </button>
          </div>
        ) : (
          <div className={styles.syncSection}>
            <div className={styles.statusBox}>
              <div className={styles.statusItem}>
                <CheckCircleIcon className={styles.statusIcon} sx={{ fontSize: 18, color: '#10b981' }} />
                <span className={styles.statusText}>Connected to Google Drive</span>
              </div>

              {lastBackup && (
                <div className={styles.backupInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Last backup:</span>
                    <span className={styles.infoValue}>
                      {lastBackup.date.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Size:</span>
                    <span className={styles.infoValue}>{lastBackup.size}</span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.buttonGroup}>
              <button
                className={styles.primaryButton}
                onClick={handleBackup}
                disabled={isLoading}
              >
                {isLoading ? 'Backing up...' : (
                  <>
                    <SaveIcon sx={{ fontSize: 16, marginRight: '4px' }} />
                    Backup Now
                  </>
                )}
              </button>

              <button
                className={styles.secondaryButton}
                onClick={handleRestore}
                disabled={isLoading || !lastBackup}
              >
                {isLoading ? 'Restoring...' : (
                  <>
                    <CloudDownloadIcon sx={{ fontSize: 16, marginRight: '4px' }} />
                    Restore from Backup
                  </>
                )}
              </button>

              <button
                className={styles.dangerButton}
                onClick={handleLogout}
                disabled={isLoading}
              >
                <LogoutIcon sx={{ fontSize: 16, marginRight: '4px' }} />
                Logout
              </button>
            </div>
          </div>
        )}
        </div>
      ) : null}

      {/* Local Backup Section - Always available */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Local Backup</h3>
        <p className={styles.description}>
          Export your notes to a JSON file or import from a previous backup.
        </p>

        <div className={styles.buttonGroup}>
          <button
            className={styles.primaryButton}
            onClick={handleLocalExport}
            disabled={isLoading}
          >
            {isLoading ? 'Exporting...' : (
              <>
                <DownloadIcon sx={{ fontSize: 16, marginRight: '4px' }} />
                Download Backup
              </>
            )}
          </button>

          <button
            className={styles.secondaryButton}
            onClick={handleLocalImport}
            disabled={isLoading}
          >
            {isLoading ? 'Importing...' : (
              <>
                <UploadFileIcon sx={{ fontSize: 16, marginRight: '4px' }} />
                Upload Backup
              </>
            )}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileSelected}
        />
      </div>

      {/* Google Drive disabled message */}
      {!ENABLE_GOOGLE_DRIVE_SYNC && (
        <div className={styles.section}>
          <p className={styles.description} style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            💡 Want cloud sync? Enable Google Drive by setting{' '}
            <code>ENABLE_GOOGLE_DRIVE_SYNC = true</code> in Settings.tsx.
            See <strong>GOOGLE_DRIVE_SETUP.md</strong> for instructions.
          </p>
        </div>
      )}

      {error && (
        <div className={styles.alert} data-type="error">
          <WarningIcon className={styles.alertIcon} sx={{ fontSize: 18 }} />
          <span className={styles.alertText}>{error}</span>
        </div>
      )}

      {success && (
        <div className={styles.alert} data-type="success">
          <CheckCircleIcon className={styles.alertIcon} sx={{ fontSize: 18 }} />
          <span className={styles.alertText}>{success}</span>
        </div>
      )}
    </div>
  );
};

export default Settings;
