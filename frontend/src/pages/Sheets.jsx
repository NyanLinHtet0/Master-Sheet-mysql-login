import React, { useState, useEffect } from 'react';
import CorpList from '../components/Sheets/CorpList';
import CorpDetails from '../components/Sheets/CorpDetails';
import styles from './Sheets.module.css';

function Sheets({ corps, fetchCorps }) {
  const [selectedCorpIndex, setSelectedCorpIndex] = useState(null);
  const [showAddCorpForm, setShowAddCorpForm] = useState(false);
  
  // New Corp State
  const [newCorpName, setNewCorpName] = useState('');
  const [newCorpBalance, setNewCorpBalance] = useState('');
  const [newCorpForeign, setNewCorpForeign] = useState('');

  const selectedCorp = selectedCorpIndex !== null ? corps[selectedCorpIndex] : null;

  const grandTotal = corps.reduce((sum, corp) => sum + Number(corp.total_mmk || 0), 0);

  const handleAddCorp = (e) => {
    e.preventDefault();
    
    // Parse name for '/i' suffix
    let parsedName = newCorpName.trim();
    let isInverse = false;
    
    if (parsedName.toLowerCase().endsWith('/i')) {
        isInverse = true;
        parsedName = parsedName.slice(0, -2).trim(); // Remove the '/i' from the name
    }

    if (corps.some(c => c?.name === parsedName)) {
      alert("A corporation with this name already exists!");
      return;
    }
    
    const isBaht = parsedName.includes('ဝယ်စာရင်း');
    const kyatVal = Number(newCorpBalance) || 0;
    const foreignVal = Number(newCorpForeign) || 0;
    
    // Apply inverse multiplier based on the parsed flag
    const multiplier = isInverse ? -1 : 1;
    const initialTotalMmk = kyatVal * multiplier;
    const initialTotalForeign = foreignVal * multiplier;
    const calculatedRate = (isBaht && foreignVal !== 0) ? kyatVal / foreignVal : 0;
    
    const newCorp = {
      name: parsedName, // Save the clean name
      inverse: isInverse, // Save inverse flag to the database
      total_mmk: initialTotalMmk,
      ...(isBaht && { total_foreign: initialTotalForeign }),
      order: corps.length + 1,
      transactions: (kyatVal !== 0 || foreignVal !== 0) ?
      [ { 
          description: "Initial Balance", 
          amount: isBaht ? (foreignVal * multiplier) : (kyatVal * multiplier), 
          date: new Date().toLocaleDateString('en-CA'), 
          ...(isBaht && { rate: calculatedRate }), 
          total_mmk: initialTotalMmk 
        } ] : []
    };
  
    fetch('/api/corps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCorp) })
    .then(() => { 
      fetchCorps(); 
      setNewCorpName(''); 
      setNewCorpBalance(''); 
      setNewCorpForeign(''); 
      setShowAddCorpForm(false); 
    });
  };

  const handleAddTx = (newTx) => {
    if (!newTx.date) newTx.date = new Date().toLocaleDateString('en-CA');
    const isBaht = selectedCorp.name.includes('ဝယ်စာရင်း');
    
    // Invert the submitted positive value into negative for the database
    if (selectedCorp.inverse) {
        newTx.amount = Number(newTx.amount) * -1;
    }
  
    const txTotalMmk = isBaht ? Number(newTx.amount) * Number(newTx.rate) : Number(newTx.amount);
    newTx.total_mmk = txTotalMmk;
  
    const updatedCorp = { ...selectedCorp, transactions: selectedCorp.transactions ? [...selectedCorp.transactions, newTx] : [newTx] };
    const currentTotalMmk = Number(updatedCorp.total_mmk || 0);
    updatedCorp.total_mmk = currentTotalMmk + txTotalMmk;
    
    if (isBaht) {
        const currentForeign = Number(updatedCorp.total_foreign || 0);
        updatedCorp.total_foreign = currentForeign + Number(newTx.amount);
    }
    
    fetch('/api/corps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedCorp) })
    .then(() => fetchCorps());
  };

  const handleUpdateTx = (index, updatedTx) => {
    // If the user updates an edited transaction, the value they put in is visually positive, invert it back before saving
    if (selectedCorp.inverse) {
       updatedTx.amount = Number(updatedTx.amount) * -1;
    }
    
    const isBaht = selectedCorp.name.includes('ဝယ်စာရင်း');
    const txTotalMmk = isBaht ? Number(updatedTx.amount) * Number(updatedTx.rate) : Number(updatedTx.amount);
    updatedTx.total_mmk = txTotalMmk;

    const newTransactions = [...selectedCorp.transactions];
    newTransactions[index] = updatedTx;

    let totalMmk = 0;
    let totalForeign = 0;

    newTransactions.forEach(tx => {
        totalMmk += Number(tx.total_mmk || 0);
        if (isBaht) {
            totalForeign += Number(tx.amount || 0);
        }
    });

    const updatedCorp = { ...selectedCorp, transactions: newTransactions, total_mmk: totalMmk };
    if (isBaht) {
        updatedCorp.total_foreign = totalForeign;
    }

    fetch('/api/corps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedCorp) })
    .then(() => fetchCorps());
  };

  const handleDeleteTx = (index) => {
      const newTransactions = selectedCorp.transactions.filter((_, i) => i !== index);
      const isBaht = selectedCorp.name.includes('ဝယ်စာရင်း');
      
      let totalMmk = 0;
      let totalForeign = 0;
      
      newTransactions.forEach(tx => {
          totalMmk += Number(tx.total_mmk || 0);
          if (isBaht) totalForeign += Number(tx.amount || 0);
      });

      const updatedCorp = { ...selectedCorp, transactions: newTransactions, total_mmk: totalMmk };
      if (isBaht) {
          updatedCorp.total_foreign = totalForeign;
      }

      fetch('/api/corps', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedCorp) })
      .then(() => fetchCorps());
  };

  return (
    <div className={styles.appContainer}>
      <CorpList 
        corps={corps} 
        grandTotal={grandTotal} 
        setSelectedCorpIndex={setSelectedCorpIndex} 
        selectedCorp={selectedCorp} 
        showAddCorpForm={showAddCorpForm} 
        setShowAddCorpForm={setShowAddCorpForm} 
        newCorpName={newCorpName} 
        setNewCorpName={setNewCorpName} 
        newCorpBalance={newCorpBalance} 
        setNewCorpBalance={setNewCorpBalance} 
        newCorpForeign={newCorpForeign} 
        setNewCorpForeign={setNewCorpForeign} 
        handleAddCorp={handleAddCorp} 
        onAddTransaction={handleAddTx} 
      />
      <CorpDetails 
        selectedCorp={selectedCorp} 
        onDeleteTransaction={handleDeleteTx} 
        onUpdateTransaction={handleUpdateTx} 
      />
    </div>
  );
}

export default Sheets;