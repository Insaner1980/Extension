import React, { useState, useEffect } from 'react';
import { Note, getNotesByCollection, getAllNotes, searchNotes, addNote, getNotesByTag } from '../services/db';
import LinkIcon from '@mui/icons-material/Link';
import styles from './NoteList.module.css';

interface NoteListProps {
  activeCollectionId: number | 'all';
  activeTagId: number | null;
  searchQuery: string;
  activeNoteId: number | null;
  onSelectNote: (noteId: number) => void;
}

const NoteList: React.FC<NoteListProps> = ({
  activeCollectionId,
  activeTagId,
  searchQuery,
  activeNoteId,
  onSelectNote
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch notes whenever filters change
  useEffect(() => {
    loadNotes();
  }, [activeCollectionId, activeTagId, searchQuery]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      let fetchedNotes: Note[];

      if (searchQuery.trim()) {
        // Search mode
        fetchedNotes = await searchNotes(searchQuery);
      } else if (activeTagId !== null) {
        // Filter by tag
        fetchedNotes = await getNotesByTag(activeTagId);
      } else if (activeCollectionId === 'all') {
        // Show all notes
        fetchedNotes = await getAllNotes();
      } else {
        // Filter by collection
        fetchedNotes = await getNotesByCollection(activeCollectionId);
      }

      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    // Don't allow creating notes without a specific collection selected
    if (activeCollectionId === 'all') {
      alert('Please select a collection first');
      return;
    }

    try {
      const newNoteId = await addNote({
        collectionId: activeCollectionId,
        title: 'Untitled Note',
        content: ''
      });

      await loadNotes();

      // Auto-select the newly created note
      onSelectNote(newNoteId);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - noteDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return noteDate.toLocaleDateString();
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className={styles.noteList}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {searchQuery ? 'Search Results' : activeCollectionId === 'all' ? 'All Notes' : 'Notes'}
        </h2>
        <button
          className={styles.newNoteBtn}
          onClick={handleCreateNote}
          disabled={activeCollectionId === 'all'}
        >
          + New Note
        </button>
      </div>

      <div className={styles.notesContainer}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : notes.length === 0 ? (
          <div className={styles.empty}>
            <p>No notes found</p>
            {activeCollectionId !== 'all' && (
              <button className={styles.emptyBtn} onClick={handleCreateNote}>
                Create your first note
              </button>
            )}
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`${styles.noteCard} ${activeNoteId === note.id ? styles.selected : ''}`}
              onClick={() => onSelectNote(note.id!)}
            >
              {note.noteColor && (
                <div
                  className={styles.colorBar}
                  style={{ backgroundColor: note.noteColor }}
                ></div>
              )}
              <div className={styles.noteContent}>
                <h3 className={styles.noteTitle}>{note.title || 'Untitled'}</h3>
                <p className={styles.notePreview}>
                  {stripHtml(note.content).substring(0, 100)}
                  {stripHtml(note.content).length > 100 ? '...' : ''}
                </p>
                <div className={styles.noteMeta}>
                  <span className={styles.noteDate}>{formatDate(note.createdAt)}</span>
                  {note.sourceUrl && (
                    <LinkIcon className={styles.sourceIcon} sx={{ fontSize: 14 }} titleAccess={note.sourceUrl} />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NoteList;
