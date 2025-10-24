import Dexie, { Table } from 'dexie';

// Type definitions for our database tables
export interface Collection {
  id?: number;
  name: string;
  color: string;
}

export interface Note {
  id?: number;
  collectionId: number;
  title: string;
  content: string;
  sourceUrl?: string;
  faviconUrl?: string;
  noteColor?: string;
  createdAt: Date;
}

export interface Tag {
  id?: number;
  name: string;
}

export interface NoteTag {
  id?: number;
  noteId: number;
  tagId: number;
}

export interface AudioClip {
  id?: number;
  noteId: number;
  audioBlob: Blob;
  transcription?: string;
}

export interface FullNoteDetails extends Note {
  tags: Tag[];
  audioClips: AudioClip[];
  collection?: Collection;
}

// Dexie database class
export class MyNoteAppDB extends Dexie {
  collections!: Table<Collection>;
  notes!: Table<Note>;
  tags!: Table<Tag>;
  note_tags!: Table<NoteTag>;
  audio_clips!: Table<AudioClip>;

  constructor() {
    super('MyNoteAppDB');

    this.version(1).stores({
      collections: '++id, name, color',
      notes: '++id, &collectionId, title, content, sourceUrl, faviconUrl, noteColor, createdAt',
      tags: '++id, &name',
      note_tags: '++id, &noteId, &tagId, [noteId+tagId]',
      audio_clips: '++id, &noteId, audioBlob, transcription'
    });
  }
}

// Export a singleton instance
export const db = new MyNoteAppDB();

// ============================================================================
// COLLECTION HELPER FUNCTIONS
// ============================================================================

export async function addCollection(name: string, color: string): Promise<number> {
  return await db.collections.add({ name, color });
}

export async function getCollections(): Promise<Collection[]> {
  return await db.collections.toArray();
}

export async function getCollectionById(id: number): Promise<Collection | undefined> {
  return await db.collections.get(id);
}

export async function updateCollection(id: number, updates: Partial<Collection>): Promise<number> {
  return await db.collections.update(id, updates);
}

export async function deleteCollection(id: number): Promise<void> {
  // Delete all notes in this collection first
  const notes = await db.notes.where('collectionId').equals(id).toArray();

  for (const note of notes) {
    if (note.id) {
      await deleteNote(note.id);
    }
  }

  await db.collections.delete(id);
}

// ============================================================================
// NOTE HELPER FUNCTIONS
// ============================================================================

export async function addNote(noteData: Omit<Note, 'id' | 'createdAt'>): Promise<number> {
  return await db.notes.add({
    ...noteData,
    createdAt: new Date()
  });
}

export async function updateNoteContent(id: number, content: string): Promise<number> {
  return await db.notes.update(id, { content });
}

export async function updateNote(id: number, updates: Partial<Note>): Promise<number> {
  return await db.notes.update(id, updates);
}

export async function getNoteById(id: number): Promise<Note | undefined> {
  return await db.notes.get(id);
}

export async function getNotesByCollection(collectionId: number): Promise<Note[]> {
  return await db.notes.where('collectionId').equals(collectionId).reverse().sortBy('createdAt');
}

export async function getAllNotes(): Promise<Note[]> {
  return await db.notes.orderBy('createdAt').reverse().toArray();
}

export async function deleteNote(id: number): Promise<void> {
  // Delete associated tags
  await db.note_tags.where('noteId').equals(id).delete();

  // Delete associated audio clips
  await db.audio_clips.where('noteId').equals(id).delete();

  // Delete the note itself
  await db.notes.delete(id);
}

// ============================================================================
// TAG HELPER FUNCTIONS
// ============================================================================

export async function addTag(name: string): Promise<number> {
  // Check if tag already exists
  const existingTag = await db.tags.where('name').equals(name).first();
  if (existingTag && existingTag.id) {
    return existingTag.id;
  }

  return await db.tags.add({ name });
}

export async function getAllTags(): Promise<Tag[]> {
  return await db.tags.toArray();
}

export async function getTagById(id: number): Promise<Tag | undefined> {
  return await db.tags.get(id);
}

export async function deleteTag(id: number): Promise<void> {
  // Remove all note-tag associations
  await db.note_tags.where('tagId').equals(id).delete();

  // Delete the tag
  await db.tags.delete(id);
}

export async function addTagToNote(noteId: number, tagName: string): Promise<void> {
  // Get or create the tag
  const tagId = await addTag(tagName);

  // Check if this note-tag relationship already exists
  const existing = await db.note_tags
    .where('[noteId+tagId]')
    .equals([noteId, tagId])
    .first();

  if (!existing) {
    await db.note_tags.add({ noteId, tagId });
  }
}

export async function removeTagFromNote(noteId: number, tagId: number): Promise<void> {
  await db.note_tags
    .where('[noteId+tagId]')
    .equals([noteId, tagId])
    .delete();
}

export async function getTagsForNote(noteId: number): Promise<Tag[]> {
  const noteTags = await db.note_tags.where('noteId').equals(noteId).toArray();
  const tagIds = noteTags.map(nt => nt.tagId);

  const tags: Tag[] = [];
  for (const tagId of tagIds) {
    const tag = await db.tags.get(tagId);
    if (tag) {
      tags.push(tag);
    }
  }

  return tags;
}

export async function getNotesByTag(tagId: number): Promise<Note[]> {
  const noteTags = await db.note_tags.where('tagId').equals(tagId).toArray();
  const noteIds = noteTags.map(nt => nt.noteId);

  const notes: Note[] = [];
  for (const noteId of noteIds) {
    const note = await db.notes.get(noteId);
    if (note) {
      notes.push(note);
    }
  }

  return notes;
}

// ============================================================================
// AUDIO CLIP HELPER FUNCTIONS
// ============================================================================

export async function addAudioToNote(
  noteId: number,
  audioBlob: Blob,
  transcription?: string
): Promise<number> {
  return await db.audio_clips.add({
    noteId,
    audioBlob,
    transcription
  });
}

export async function updateAudioTranscription(id: number, transcription: string): Promise<number> {
  return await db.audio_clips.update(id, { transcription });
}

export async function getAudioClipsForNote(noteId: number): Promise<AudioClip[]> {
  return await db.audio_clips.where('noteId').equals(noteId).toArray();
}

export async function deleteAudioClip(id: number): Promise<void> {
  await db.audio_clips.delete(id);
}

// ============================================================================
// COMPLEX QUERY FUNCTIONS
// ============================================================================

export async function getFullNoteDetails(noteId: number): Promise<FullNoteDetails | undefined> {
  const note = await db.notes.get(noteId);
  if (!note) {
    return undefined;
  }

  const tags = await getTagsForNote(noteId);
  const audioClips = await getAudioClipsForNote(noteId);
  const collection = note.collectionId
    ? await db.collections.get(note.collectionId)
    : undefined;

  return {
    ...note,
    tags,
    audioClips,
    collection
  };
}

export async function searchNotes(query: string): Promise<Note[]> {
  if (!query || query.trim() === '') {
    return await getAllNotes();
  }

  const searchTerm = query.toLowerCase();
  const allNotes = await db.notes.toArray();

  // Search in title, content, and audio transcriptions
  const matchingNotes: Note[] = [];

  for (const note of allNotes) {
    let matches = false;

    // Search in title
    if (note.title.toLowerCase().includes(searchTerm)) {
      matches = true;
    }

    // Search in content (strip HTML tags for better search)
    if (!matches) {
      const plainContent = stripHtmlTags(note.content).toLowerCase();
      if (plainContent.includes(searchTerm)) {
        matches = true;
      }
    }

    // Search in audio transcriptions
    if (!matches && note.id) {
      const audioClips = await getAudioClipsForNote(note.id);
      for (const clip of audioClips) {
        if (clip.transcription && clip.transcription.toLowerCase().includes(searchTerm)) {
          matches = true;
          break;
        }
      }
    }

    if (matches) {
      matchingNotes.push(note);
    }
  }

  return matchingNotes;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function stripHtmlTags(html: string): string {
  // Create a temporary div element to parse HTML
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// ============================================================================
// DATABASE INITIALIZATION & SEEDING
// ============================================================================

export async function initializeDatabase(): Promise<void> {
  // Check if database is empty and seed with default data
  const collectionsCount = await db.collections.count();

  if (collectionsCount === 0) {
    // Add default collection
    await addCollection('General', '#6366F1');
    await addCollection('Work', '#EF4444');
    await addCollection('Personal', '#10B981');
  }
}

// ============================================================================
// EXPORT ALL NOTES (for backup/export features)
// ============================================================================

export async function exportAllData(): Promise<{
  collections: Collection[];
  notes: Note[];
  tags: Tag[];
  note_tags: NoteTag[];
}> {
  return {
    collections: await db.collections.toArray(),
    notes: await db.notes.toArray(),
    tags: await db.tags.toArray(),
    note_tags: await db.note_tags.toArray(),
    // Note: Audio clips are excluded due to Blob size
  };
}

export async function importData(data: {
  collections?: Collection[];
  notes?: Note[];
  tags?: Tag[];
  note_tags?: NoteTag[];
}): Promise<void> {
  if (data.collections) {
    await db.collections.bulkAdd(data.collections);
  }
  if (data.notes) {
    await db.notes.bulkAdd(data.notes);
  }
  if (data.tags) {
    await db.tags.bulkAdd(data.tags);
  }
  if (data.note_tags) {
    await db.note_tags.bulkAdd(data.note_tags);
  }
}
