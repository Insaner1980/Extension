import React, { useState, useEffect } from 'react';
import { Collection, getCollections, addNote, addTagToNote } from '../services/db';
import styles from './Popup.module.css';

interface TabInfo {
  title: string;
  url: string;
  favIconUrl?: string;
}

const Popup: React.FC = () => {
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [noteTitle, setNoteTitle] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      // Get current tab info
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (tab) {
        const info: TabInfo = {
          title: tab.title || 'Untitled',
          url: tab.url || '',
          favIconUrl: tab.favIconUrl
        };
        setTabInfo(info);
        setNoteTitle(info.title);
      }

      // Fetch collections
      const cols = await getCollections();
      setCollections(cols);

      // Select first collection by default
      if (cols.length > 0 && cols[0].id) {
        setSelectedCollectionId(cols[0].id);
      }
    } catch (error) {
      console.error('Error initializing popup:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClip = async () => {
    if (!tabInfo || !selectedCollectionId) {
      alert('Please select a collection');
      return;
    }

    setIsSaving(true);

    try {
      // Create simple HTML content with the clipped URL
      const content = `<p>Clipped from: <a href="${tabInfo.url}" target="_blank">${tabInfo.url}</a></p>`;

      // Save the note
      const noteId = await addNote({
        collectionId: selectedCollectionId,
        title: noteTitle,
        content: content,
        sourceUrl: tabInfo.url,
        faviconUrl: tabInfo.favIconUrl
      });

      // Add tags if provided
      if (tagsInput.trim()) {
        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);

        for (const tagName of tags) {
          await addTagToNote(noteId, tagName);
        }
      }

      // Close the popup after successful save
      window.close();
    } catch (error) {
      console.error('Error saving clip:', error);
      alert('Failed to save clip. Please try again.');
      setIsSaving(false);
    }
  };

  const handleOpenDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  };

  if (loading) {
    return (
      <div className={styles.popup}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className={styles.popup}>
        <div className={styles.header}>
          <h1 className={styles.title}>Quick Clip</h1>
        </div>
        <div className={styles.emptyState}>
          <p>No collections found.</p>
          <p>Please create a collection first.</p>
          <button className={styles.dashboardBtn} onClick={handleOpenDashboard}>
            Open Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quick Clip</h1>
      </div>

      <div className={styles.form}>
        {tabInfo?.favIconUrl && (
          <div className={styles.faviconContainer}>
            <img src={tabInfo.favIconUrl} alt="" className={styles.favicon} />
            <span className={styles.url}>{new URL(tabInfo.url).hostname}</span>
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.label}>Title</label>
          <input
            type="text"
            className={styles.input}
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Note title"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Collection</label>
          <select
            className={styles.select}
            value={selectedCollectionId || ''}
            onChange={(e) => setSelectedCollectionId(Number(e.target.value))}
          >
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Tags (comma-separated)</label>
          <input
            type="text"
            className={styles.input}
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g., research, important, todo"
          />
        </div>

        <div className={styles.actions}>
          <button
            className={styles.saveBtn}
            onClick={handleSaveClip}
            disabled={isSaving || !selectedCollectionId}
          >
            {isSaving ? 'Saving...' : 'Save Clip'}
          </button>
          <button
            className={styles.dashboardBtn}
            onClick={handleOpenDashboard}
            disabled={isSaving}
          >
            Open Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
