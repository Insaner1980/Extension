import React, { useState } from 'react';
import Sidebar from './Sidebar';
import NoteList from './NoteList';
import Editor from './Editor';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  // State management for the entire dashboard
  const [activeCollectionId, setActiveCollectionId] = useState<number | 'all'>('all');
  const [activeTagId, setActiveTagId] = useState<number | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handler for collection selection
  const handleSelectCollection = (collectionId: number | 'all') => {
    setActiveCollectionId(collectionId);
    setActiveTagId(null); // Clear tag filter when switching collections
    setActiveNoteId(null); // Clear selected note when switching collections
  };

  // Handler for tag selection
  const handleSelectTag = (tagId: number | null) => {
    setActiveTagId(tagId);
    setActiveCollectionId('all'); // Show all collections when filtering by tag
    setActiveNoteId(null); // Clear selected note when switching tags
  };

  // Handler for note selection
  const handleSelectNote = (noteId: number) => {
    setActiveNoteId(noteId);
  };

  // Handler for search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // When searching, clear collection/tag filters
      setActiveCollectionId('all');
      setActiveTagId(null);
    }
  };

  return (
    <div className={styles.dashboard}>
      <Sidebar
        activeCollectionId={activeCollectionId}
        activeTagId={activeTagId}
        onSelectCollection={handleSelectCollection}
        onSelectTag={handleSelectTag}
        onSearch={handleSearch}
      />
      <NoteList
        activeCollectionId={activeCollectionId}
        activeTagId={activeTagId}
        searchQuery={searchQuery}
        activeNoteId={activeNoteId}
        onSelectNote={handleSelectNote}
      />
      <Editor
        activeNoteId={activeNoteId}
        onNoteDeleted={() => setActiveNoteId(null)}
      />
    </div>
  );
};

export default Dashboard;
