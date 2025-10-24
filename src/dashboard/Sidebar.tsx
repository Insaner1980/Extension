import React, { useState, useEffect } from 'react';
import { Collection, Tag, getCollections, getAllTags, addCollection } from '../services/db';
import ThemeSwitcher from '../components/ThemeSwitcher';
import Settings from '../components/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import TagIcon from '@mui/icons-material/Tag';
import SettingsIcon from '@mui/icons-material/Settings';
import styles from './Sidebar.module.css';

interface SidebarProps {
  activeCollectionId: number | 'all';
  activeTagId: number | null;
  onSelectCollection: (collectionId: number | 'all') => void;
  onSelectTag: (tagId: number | null) => void;
  onSearch: (query: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeCollectionId,
  activeTagId,
  onSelectCollection,
  onSelectTag,
  onSearch
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Fetch collections and tags on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadCollections(),
      loadTags()
    ]);
  };

  const loadCollections = async () => {
    try {
      const cols = await getCollections();
      setCollections(cols);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const loadTags = async () => {
    try {
      const allTags = await getAllTags();
      setTags(allTags);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    onSearch(value);
  };

  const handleNewCollection = async () => {
    const name = prompt('Enter collection name:');
    if (!name) return;

    const colors = ['#6366F1', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    try {
      await addCollection(name, color);
      await loadCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Notes</h1>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search notes..."
          value={searchInput}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
      </div>

      <nav className={styles.nav}>
        <div
          className={`${styles.navItem} ${activeCollectionId === 'all' && !activeTagId ? styles.active : ''}`}
          onClick={() => onSelectCollection('all')}
        >
          <DescriptionIcon className={styles.icon} sx={{ fontSize: 18 }} />
          <span>All Notes</span>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.sectionTitle}>Collections</div>

        {collections.map((collection) => (
          <div
            key={collection.id}
            className={`${styles.navItem} ${activeCollectionId === collection.id ? styles.active : ''}`}
            onClick={() => onSelectCollection(collection.id!)}
          >
            <span
              className={styles.colorDot}
              style={{ backgroundColor: collection.color }}
            ></span>
            <span>{collection.name}</span>
          </div>
        ))}

        <button className={styles.addCollectionBtn} onClick={handleNewCollection}>
          + New Collection
        </button>

        {tags.length > 0 && (
          <>
            <div className={styles.divider}></div>
            <div className={styles.sectionTitle}>Tags</div>

            {tags.map((tag) => (
              <div
                key={tag.id}
                className={`${styles.navItem} ${activeTagId === tag.id ? styles.active : ''}`}
                onClick={() => onSelectTag(tag.id!)}
              >
                <TagIcon className={styles.icon} sx={{ fontSize: 18 }} />
                <span>{tag.name}</span>
              </div>
            ))}
          </>
        )}
      </nav>

      <div className={styles.sidebarFooter}>
        <button
          className={styles.settingsButton}
          onClick={() => setShowSettings(!showSettings)}
        >
          <SettingsIcon className={styles.icon} sx={{ fontSize: 18 }} />
          <span>Settings</span>
        </button>

        {showSettings && (
          <div className={styles.settingsPanel}>
            <Settings />
          </div>
        )}

        <ThemeSwitcher />
      </div>
    </div>
  );
};

export default Sidebar;
