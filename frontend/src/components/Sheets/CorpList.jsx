import styles from '../../pages/Sheets.module.css';
import CorpDropdown from '../CorpDropdown';
import TransactionForm from './TransactionForm'; 

function CorpList({ 
  corps, 
  grandTotal, 
  setSelectedCorpIndex,
  selectedCorp, 
  showAddCorpForm, 
  setShowAddCorpForm, 
  newCorpName, 
  setNewCorpName, 
  newCorpBalance, 
  setNewCorpBalance, 
  handleAddCorp, 
  newCorpForeign, 
  setNewCorpForeign,
  onAddTransaction 
}) {
  const isBahtCorp = newCorpName.includes('ဝယ်စာရင်း');
  return (
    <div className={styles.corpList}>
      <div className={styles.corpListHeader}>
        <h2>Corporations</h2>
        <button onClick={() => setShowAddCorpForm(true)}>Add</button>
      </div>

      {showAddCorpForm && (
        <form onSubmit={handleAddCorp} className={styles.formContainer}>
          <div className={styles.corpFormWrapper} style={{ alignItems: 'center' }}>
            <div className={styles.inputFieldCont} style={{flex:'2' }}>
              <input
                type="text"
                placeholder="Corporation Name ('.../i' for inverse)"
                required
                value={newCorpName}
                onChange={(e) => setNewCorpName(e.target.value)}
              />
            </div>
            
            <div className={styles.inputFieldCont} style={{flex:'.5' }}>
              <input
                type="text"
                placeholder={isBahtCorp ? "Initial Kyat" : "Balance"}
                value={newCorpBalance === '-' ? '-' : newCorpBalance ? Number(newCorpBalance).toLocaleString() : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, '');
                  if (raw === '' || raw === '-' || !isNaN(raw)) {
                      setNewCorpBalance(raw);
                  }
                }}
              />
            </div>
            
            {isBahtCorp && (
              <div className={styles.inputFieldCont} style={{ flex: '1' }}>
                <input
                  type="text"
                  placeholder="Initial Baht"
                  value={newCorpForeign === '-' ? '-' : newCorpForeign ? Number(newCorpForeign).toLocaleString() : ''}
                  onChange={(e) => {
                    const raw2 = e.target.value.replace(/,/g, '');
                    if (raw2 === '' || raw2 === '-' || !isNaN(raw2)) {
                      setNewCorpForeign(raw2);
                    }
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <button type="submit">Submit</button>
            <button type="button" onClick={() => setShowAddCorpForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className={styles.grandTotal}>
        <span>Grand Total: </span>
        <span>{Number(grandTotal).toLocaleString()}</span>
      </div>

      <div className={styles.dropdownContainer}>
        <CorpDropdown 
          corps={corps}
          selectedCorp={selectedCorp}
          onSelect={(selectedCorpObject) => {
            const newIndex = corps.findIndex((c) => c === selectedCorpObject);
            setSelectedCorpIndex(newIndex !== -1 ? newIndex : null);
          }}
        />
      </div>

      {selectedCorp && (
        <TransactionForm 
           corpname={selectedCorp.name} 
           isForeign={selectedCorp.is_foreign}
           onSubmit={onAddTransaction} 
        />
      )}
    </div>
  );
}

export default CorpList;