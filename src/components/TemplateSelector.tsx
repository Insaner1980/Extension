import React, { useState, useRef, useEffect } from 'react';
import { NOTE_TEMPLATES, NoteTemplate } from '../constants/templates';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import TemplateIcon from './TemplateIcon';
import styles from './TemplateSelector.module.css';

interface TemplateSelectorProps {
  onSelectTemplate: (content: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleTemplateSelect = (template: NoteTemplate) => {
    if (template.content) {
      // Confirm before replacing content (except for blank template)
      if (template.id !== 'blank') {
        const confirmed = confirm(
          `This will replace the current content with the "${template.name}" template. Continue?`
        );
        if (!confirmed) {
          setIsOpen(false);
          return;
        }
      }
    }

    onSelectTemplate(template.content);
    setIsOpen(false);
  };

  return (
    <div className={styles.templateSelector} ref={dropdownRef}>
      <button
        className={styles.templateButton}
        onClick={() => setIsOpen(!isOpen)}
        title="Insert template"
      >
        <ContentPasteIcon className={styles.icon} sx={{ fontSize: 18 }} />
        <span className={styles.text}>Templates</span>
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span>Select a Template</span>
          </div>
          <div className={styles.templateList}>
            {NOTE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                className={styles.templateItem}
                onClick={() => handleTemplateSelect(template)}
              >
                <TemplateIcon iconName={template.icon} className={styles.templateIcon} size={20} />
                <div className={styles.templateInfo}>
                  <div className={styles.templateName}>{template.name}</div>
                  <div className={styles.templateDescription}>{template.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
