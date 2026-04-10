import React, { useState } from 'react';
import TransactionTable from './TransactionTable';
import styles from '../../pages/Sheets.module.css';

export default function CorpDetails({ selectedCorp, onDeleteTransaction, onUpdateTransaction}) {
  const [isSingleTableView, setIsSingleTableView] = useState(false);

  if (!selectedCorp) {
    return (
      <div className={styles.corpDetails} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Select a Corporation</h2>
        <p>Click on a corporation from the sidebar to view details and add transactions.</p>
      </div>
    );
  }

  // <--- INVERSE LOGIC FOR DISPLAY --->
  const isInverse = selectedCorp.inverse === true;

  const transactions = selectedCorp.transactions || [];
  const txWithIndex = transactions.map((tx, index) => {
      let displayTx = { ...tx, originalIndex: index };
      if (isInverse) {
          // Visually flip the amounts so negatives look positive
          displayTx.amount = -Number(tx.amount || 0);
          displayTx.total_mmk = -Number(tx.total_mmk || 0);
      }
      return displayTx;
  });

  // Note: If you want transactions to stay in their original Income/Expense tables 
  // regardless of the visual flip, change `displayTx.amount` to `tx.amount` below.
  const incomeTx = txWithIndex.filter(tx => tx.amount >= 0);
  const expenseTx = txWithIndex.filter(tx => tx.amount < 0);

  const isForeign = selectedCorp.is_foreign;
  // Fallback to 'Baht' or similar if the name doesn't contain the split word anymore
  const currencyName = isForeign ? selectedCorp.name.split('ဝယ်စာရင်း')[0].trim() : '';

  // <--- APPLY INVERSE LOGIC TO HEADER TOTALS --->
  const displayTotalMmk = isInverse ? -Number(selectedCorp.total_mmk || 0) : Number(selectedCorp.total_mmk || 0);
  const displayTotalForeign = isInverse ? -Number(selectedCorp.total_foreign || 0) : Number(selectedCorp.total_foreign || 0);

  // FIXED: Math.abs applied before toLocaleString
  const currentRate = (isForeign && Number(selectedCorp.total_foreign)) 
    ? Math.abs(displayTotalMmk / displayTotalForeign).toLocaleString(undefined, { maximumFractionDigits: 2 })
    : '-';

  return (
    <div className={styles.corpDetails}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-main)' }}>{selectedCorp.name}</h2>
      </div>

      <div className={styles.balanceContainer} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          {/* <--- USE INVERTED TOTALS ---> */}
          <span style={{ fontWeight: '600' }}>Balance: {displayTotalMmk.toLocaleString(undefined, {maximumFractionDigits: 0})} MMK</span>
          {isForeign && (
            <>
              <span className={styles.divider}>|</span>
              <span className={styles.foreignText} style={{ fontWeight: '600' }}>
                {currencyName} Balance: {displayTotalForeign.toLocaleString()}
              </span>
              <span className={styles.divider}>|</span>
              <span className={styles.rateText}>Rate: {currentRate}</span>
            </>
          )}
        </div>
        
        <button 
          onClick={() => setIsSingleTableView(!isSingleTableView)}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600', color: 'var(--text-main)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
        >
          {isSingleTableView ? 'Split View' : 'Single View'}
        </button>
      </div>

      <div className={styles.tablesContainer}>
        {isSingleTableView ? (
          <div className={styles.tableWrapper} style={{ width: '100%' }}>
            <TransactionTable 
              title="All Transactions"
              data={txWithIndex} 
              type="all" 
              currencyName={currencyName}
              isForeign={selectedCorp.is_foreign}
              onDelete={onDeleteTransaction}
              onUpdate={onUpdateTransaction}
            />
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <TransactionTable 
                title="Income (In)"
                data={incomeTx} 
                type="income" 
                currencyName={currencyName}
                isForeign={selectedCorp.is_foreign}
                onDelete={onDeleteTransaction}
                onUpdate={onUpdateTransaction}
              />
            </div>
            <div className={styles.tableWrapper}>
              <TransactionTable 
                title="Expense (Out)"
                data={expenseTx} 
                type="expense" 
                currencyName={currencyName}
                isForeign={selectedCorp.is_foreign}
                onDelete={onDeleteTransaction}
                onUpdate={onUpdateTransaction}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}