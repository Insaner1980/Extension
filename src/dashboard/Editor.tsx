import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { FullNoteDetails, getFullNoteDetails, updateNote, deleteNote } from '../services/db';
import AudioRecorder from '../components/AudioRecorder';
import TemplateSelector from '../components/TemplateSelector';
import RichTextEditor from '../components/RichTextEditor';
import EditNoteIcon from '@mui/icons-material/EditNote';
import styles from './Editor.module.css';

interface EditorProps {
  activeNoteId: number | null;
  onNoteDeleted: () => void;
}

const Editor: React.FC<EditorProps> = ({ activeNoteId, onNoteDeleted }) => {
  const [noteDetails, setNoteDetails] = useState<FullNoteDetails | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Debounce title and content changes (1 second delay)
  const [debouncedTitle] = useDebounce(title, 1000);
  const [debouncedContent] = useDebounce(content, 1000);

  // Fetch full note details when activeNoteId changes
  useEffect(() => {
    if (activeNoteId) {
      loadNoteDetails(activeNoteId);
    } else {
      setNoteDetails(null);
      setTitle('');
      setContent('');
    }
  }, [activeNoteId]);

  // Auto-save when debounced values change
  useEffect(() => {
    if (noteDetails && noteDetails.id) {
      // Only save if the values actually changed from the loaded note
      if (debouncedTitle !== noteDetails.title || debouncedContent !== noteDetails.content) {
        autoSave();
      }
    }
  }, [debouncedTitle, debouncedContent]);

  const loadNoteDetails = async (noteId: number) => {
    try {
      const details = await getFullNoteDetails(noteId);
      if (details) {
        setNoteDetails(details);
        setTitle(details.title);
        setContent(details.content);
      }
    } catch (error) {
      console.error('Error loading note details:', error);
    }
  };

  const autoSave = async () => {
    if (!noteDetails || !noteDetails.id) return;

    setIsSaving(true);
    try {
      await updateNote(noteDetails.id, { title: debouncedTitle, content: debouncedContent });
      setLastSaved(new Date());

      // Update local note details
      setNoteDetails({
        ...noteDetails,
        title: debouncedTitle,
        content: debouncedContent
      });
    } catch (error) {
      console.error('Error auto-saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (html: string) => {
    setContent(html);
  };

  const handleDelete = async () => {
    if (!noteDetails || !noteDetails.id) return;

    if (confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(noteDetails.id);
        onNoteDeleted();
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleTranscriptionComplete = (transcription: string) => {
    // Append transcription to the content as paragraph
    setContent((prevContent) => {
      const newContent = prevContent
        ? `${prevContent}<p>${transcription}</p>`
        : `<p>${transcription}</p>`;
      return newContent;
    });
  };

  const handleTemplateSelect = (templateContent: string) => {
    // Replace current content with template content
    setContent(templateContent);
  };

  if (!noteDetails) {
    return (
      <div className={styles.editor}>
        <div className={styles.emptyState}>
          <EditNoteIcon className={styles.emptyIcon} sx={{ fontSize: 64, color: 'var(--text-tertiary)' }} />
          <h2>No note selected</h2>
          <p>Select a note from the list or create a new one to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editor}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {noteDetails.sourceUrl && (
            <a
              href={noteDetails.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sourceLink}
              title={noteDetails.sourceUrl}
            >
              {noteDetails.faviconUrl && (
                <img src={noteDetails.faviconUrl} alt="" className={styles.favicon} />
              )}
              <span>View Source</span>
            </a>
          )}
          <AudioRecorder
            noteId={noteDetails.id!}
            onTranscriptionComplete={handleTranscriptionComplete}
          />
          <TemplateSelector onSelectTemplate={handleTemplateSelect} />
        </div>
        <div className={styles.toolbarRight}>
          <div className={styles.saveStatus}>
            {isSaving ? (
              <span className={styles.saving}>Saving...</span>
            ) : lastSaved ? (
              <span className={styles.saved}>Saved {lastSaved.toLocaleTimeString()}</span>
            ) : null}
          </div>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className={styles.editorContent}>
        <input
          type="text"
          className={styles.titleInput}
          placeholder="Untitled Note"
          value={title}
          onChange={handleTitleChange}
        />

        <RichTextEditor
          content={content}
          onChange={handleContentChange}
          placeholder="Start writing..."
        />
      </div>

      <div className={styles.metadata}>
        <span className={styles.metaItem}>
          Created: {new Date(noteDetails.createdAt).toLocaleString()}
        </span>
        {noteDetails.tags.length > 0 && (
          <span className={styles.metaItem}>
            Tags: {noteDetails.tags.map(tag => tag.name).join(', ')}
          </span>
        )}
        {noteDetails.audioClips.length > 0 && (
          <span className={styles.metaItem}>
            Audio clips: {noteDetails.audioClips.length}
          </span>
        )}
      </div>
    </div>
  );
};

export default Editor;
