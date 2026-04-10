import { useState } from 'react';
import styles from '../../pages/Sheets.module.css';
import TransactionTableHeader from './TransactionTableHeader';
import TransactionRow from './TransactionRow';

export default function TransactionTable({ title, data, type, currencyName, isForeign, onDelete, onUpdate }) {
  const isEmpty = data.length === 0;
  const isBaht = isForeign;

  const [isTableEditMode, setIsTableEditMode] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  
  const [editFormData, setEditFormData] = useState({
    date: '', description: '', amount: '', rate: '', total_mmk: ''
  });

  const handleEditClick = (tx) => {
    setEditingRowIndex(tx.originalIndex);
    
    let formattedDate = '';
    if (tx.date) {
      const [year, month, day] = tx.date.split('-');
      formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    setEditFormData({
      date: formattedDate,
      description: tx.description || '',
      amount: tx.amount || '',
      rate: tx.rate || '',
      total_mmk: tx.total_mmk || ''
    });
  };

  const handleSaveEdit = (originalIndex) => {
    const [year, month, day] = editFormData.date.split('-');
    const formattedDate = `${year}-${Number(month)}-${Number(day)}`; 

    const updatedTx = {
      date: formattedDate,
      description: editFormData.description,
      amount: editFormData.amount,
      ...(isBaht && { rate: editFormData.rate, total_mmk: editFormData.total_mmk })
    };

    onUpdate(originalIndex, updatedTx);
    setEditingRowIndex(null);
  };

  const handleInputChange = (e, field) => {
    setEditFormData({ ...editFormData, [field]: e.target.value });
  };

  return (
    <>
      <div className={styles.txHeader} style={{ marginBottom: '10px' }}>
        <h3 className={styles.tableTitle}>{title}</h3>
        {!isEmpty && (
          <button 
            onClick={() => {
              setIsTableEditMode(!isTableEditMode);
              setEditingRowIndex(null); 
            }}
          >
            {isTableEditMode ? 'Done' : 'Edit Table'}
          </button>
        )}
      </div>

      <div className={styles.tableScroll}>
        {isEmpty ? (
          <p style={{ padding: '15px', color: 'var(--text-muted)' }}>No transactions yet.</p>
        ) : (
          <table className={styles.txTable}>
            <TransactionTableHeader 
              isBaht={isBaht} 
              currencyName={currencyName} 
              isTableEditMode={isTableEditMode} 
            />
            <tbody>
              {/* ✅ FIX APPLIED HERE: Using tx.originalIndex instead of the map index */}
              {data.map((tx) => (
                <TransactionRow
                  key={`tx-${tx.originalIndex}`}
                  tx={tx}
                  type={type}
                  isBaht={isBaht}
                  isTableEditMode={isTableEditMode}
                  isEditing={editingRowIndex === tx.originalIndex}
                  editFormData={editFormData}
                  onInputChange={handleInputChange}
                  onSave={() => handleSaveEdit(tx.originalIndex)}
                  onCancel={() => setEditingRowIndex(null)}
                  onEditClick={() => handleEditClick(tx)}
                  onDelete={() => onDelete(tx.originalIndex)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}