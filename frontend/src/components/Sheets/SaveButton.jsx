// frontend/src/components/Sheets/SaveButton.jsx

import React from 'react';
import styles from './SaveButton.module.css';

export default function SaveButton({ onSave, isDirty }) {
  return (
    <button 
      className={`${styles.saveBtn} ${isDirty ? styles.dirty : ''}`} 
      onClick={onSave}
      disabled={!isDirty}
    >
      {isDirty ? 'Save Changes' : 'Saved'}
    </button>
  );
}