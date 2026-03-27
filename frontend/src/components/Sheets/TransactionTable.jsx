import { useState } from 'react';
import styles from '../../pages/Sheets.module.css';

export default function TransactionTable({ title, data, type, corpname, onDelete, onUpdate }) {
  const isEmpty = data.length === 0;
  const isBaht = corpname && corpname.includes('ဝယ်စာရင်း');

  // New state to toggle edit mode for the table
  const [isTableEditMode, setIsTableEditMode] = useState(false);

  // State to track which row is actively being edited
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  
  // State to hold the temporary edit values
  const [editFormData, setEditFormData] = useState({
    date: '',
    description: '',
    amount: '',
    rate: ''
  });

  const handleEditClick = (tx) => {
    setEditingRowIndex(tx.originalIndex);
    
    // Format the date for the date input (YYYY-MM-DD)
    let formattedDate = '';
    if (tx.date) {
      const [year, month, day] = tx.date.split('-');
      formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    setEditFormData({
      date: formattedDate,
      description: tx.description || '',
      amount: tx.amount || '',
      rate: tx.rate || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingRowIndex(null);
  };

  const handleSaveEdit = (originalIndex) => {
    // Determine the year, month, day from the input
    const [year, month, day] = editFormData.date.split('-');
    const formattedDate = `${year}-${Number(month)}-${Number(day)}`; // Strip leading zeros to match original format if desired

    const updatedTx = {
      date: formattedDate,
      description: editFormData.description,
      amount: editFormData.amount,
      ...(isBaht && { rate: editFormData.rate })
    };

    onUpdate(originalIndex, updatedTx);
    setEditingRowIndex(null);
  };

  const handleInputChange = (e, field) => {
    setEditFormData({
      ...editFormData,
      [field]: e.target.value
    });
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
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                {isBaht ? (
                  <>
                    <th style={{ textAlign: 'right' }}>Baht</th>
                    <th style={{ textAlign: 'right' }}>Rate</th>
                    <th style={{ textAlign: 'right' }}>Total MMK</th>
                  </>
                ) : (
                  <th style={{ textAlign: 'right' }}>Amount</th>
                )}
                {/* Provide a non-breaking space when hidden to maintain perfect border alignment */}
                <th style={{ textAlign: 'center', width: '150px' }}>
                  {isTableEditMode ? 'Actions' : '\u00A0'}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((tx, index) => {
                const isEditingThisRow = editingRowIndex === tx.originalIndex;

                // Dynamic Color Logic
                const amountColor = (type === 'income' || (type === 'all' && Number(tx.amount) >= 0)) 
                  ? 'var(--success-color)' 
                  : (type === 'expense' || (type === 'all' && Number(tx.amount) < 0)) 
                    ? '#ef4444' 
                    : 'inherit';

                return (
                  <tr key={index}>
                    {isEditingThisRow ? (
                      <>
                        <td>
                          <input 
                            type="date" 
                            value={editFormData.date} 
                            onChange={(e) => handleInputChange(e, 'date')} 
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            value={editFormData.description} 
                            onChange={(e) => handleInputChange(e, 'description')} 
                          />
                        </td>
                        {isBaht ? (
                          <>
                            <td style={{ textAlign: 'right' }}>
                              <input 
                                style={{ textAlign: 'right', width: '80px' }}
                                type="number" 
                                value={editFormData.amount} 
                                onChange={(e) => handleInputChange(e, 'amount')} 
                              />
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <input 
                                style={{ textAlign: 'right', width: '60px' }}
                                type="number" 
                                value={editFormData.rate} 
                                onChange={(e) => handleInputChange(e, 'rate')} 
                              />
                            </td>
                            <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                              Auto
                            </td>
                          </>
                        ) : (
                          <td style={{ textAlign: 'right' }}>
                            <input 
                              style={{ textAlign: 'right', width: '100px' }}
                              type="number" 
                              value={editFormData.amount} 
                              onChange={(e) => handleInputChange(e, 'amount')} 
                            />
                          </td>
                        )}
                        {/* Consistent 150px width and flex layout for inline editing */}
                        <td className={styles.actionCell} style={{ textAlign: 'center', width: '150px' }}>
                          <div className={styles.actionCellButtons}>
                            <button className={`${styles.actionBtn} ${styles.saveBtn}`} onClick={() => handleSaveEdit(tx.originalIndex)}>Save</button>
                            <button className={`${styles.actionBtn} ${styles.cancelBtn}`} onClick={handleCancelEdit}>Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{tx.date}</td>
                        <td>{tx.description}</td>
                        {isBaht ? (
                          <>
                            <td style={{ textAlign: 'right' }}>
                              <span style={{ color: amountColor, fontWeight: 'bold' }}>
                                {tx.amount === '-' ? '-' : tx.amount ? Number(tx.amount).toLocaleString() : ''}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {tx.rate === '-' ? '-' : tx.rate ? Number(tx.rate).toLocaleString() : ''}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <span style={{ color: amountColor, fontWeight: 'bold' }}>
                                {tx.total_mmk ? Number(tx.total_mmk).toLocaleString() : ''}
                              </span>
                            </td>
                          </>
                        ) : (
                          <td style={{ textAlign: 'right' }}>
                            <span style={{ color: amountColor, fontWeight: 'bold' }}>
                              {tx.amount === '-' ? '-' : tx.amount ? Number(tx.amount).toLocaleString() : ''}
                            </span>
                          </td>
                        )}
                        {/* Always render the td. If not in edit mode, insert a non-breaking space */}
                        <td className={styles.actionCell} style={{ textAlign: 'center', width: '150px' }}>
                          {isTableEditMode ? (
                            <div className={styles.actionCellButtons}>
                              <button className={`${styles.actionBtn} ${styles.saveBtn}`} onClick={() => handleEditClick(tx)}>
                                Edit
                              </button>
                              <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => onDelete(tx.originalIndex)}>
                                Delete
                              </button>
                            </div>
                          ) : (
                            <span>&nbsp;</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}