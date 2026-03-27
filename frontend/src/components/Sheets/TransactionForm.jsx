import { useState, useEffect, useRef } from 'react';
import styles from '../../pages/Sheets.module.css';
import transactionstyles from './TransactionForm.module.css';

const today = new Date();
const years = Array.from({ length: 3 }, (_, i) => today.getFullYear() - 1 + i);
const months = Array.from({ length: 12 }, (_, i) => i + 1);

export default function TransactionForm({ onSubmit, corpname }) {
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [day, setDay] = useState(today.getDate());

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  
  // References for focusing
  const dayInputRef = useRef(null);
  const descriptionInputRef = useRef(null);

  const isBaht = corpname && corpname.includes('ဝယ်စာရင်း');
  
  const daysInSelectedMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  useEffect(() => {
    if (day > daysInSelectedMonth) {
      setDay(daysInSelectedMonth);
    }
  }, [year, month, daysInSelectedMonth, day]);

  // UPDATED: Helper function to handle commas AND negative numbers
  const handleNumberChange = (setter) => (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    
    // Explicitly allow an empty string or a lone minus sign
    if (rawValue === '' || rawValue === '-') {
      setter(rawValue);
    } 
    // Otherwise, check if it's a valid number
    else if (!isNaN(rawValue)) {
      setter(rawValue);
    }
  };

  const processSubmit = (isShiftEnter) => {
    // Prevent submission if amount is just a lone minus sign
    if (!description || !amount || amount === '-' || (isBaht && (!rate || rate === '-'))) return;

    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const txData = {
      date: formattedDate,
      description,
      amount: Number(amount),
      ...(isBaht && { rate: Number(rate) })
    };

    onSubmit(txData);
    
    // Reset form fields
    setDescription('');
    setAmount('');
    setRate('');

    if (isShiftEnter) {
      const nextDate = new Date(year, month - 1, day + 1);
      setYear(nextDate.getFullYear());
      setMonth(nextDate.getMonth() + 1);
      setDay(nextDate.getDate());
      
      if (descriptionInputRef.current) {
        descriptionInputRef.current.focus();
      }
    } else {
      if (dayInputRef.current) {
        dayInputRef.current.focus();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processSubmit(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault(); 
      processSubmit(true);
    }
  };

  const spacing = [.5, 2, .5, .5];

  // Helper function to format the value for display
  const formatValue = (val) => {
    if (val === '' || val === '-') return val;
    return Number(val).toLocaleString();
  };

  return (
    <div className={styles.transactionFormWrapper}>
      <h3 className={styles.formTitle}>Add New Transaction</h3>
      
      <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className={styles.formContainer}>
        <div className={transactionstyles.inputRow}>
          <div style={styles.inputDatefields}>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={styles.flexInput}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={styles.flexInput}
            >
              {months.map(m => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleString('default', { month: 'short' })}
                </option>
              ))}
            </select>
            <select
              ref={dayInputRef}
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className={styles.flexInput}
            >
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          
          <input
            ref={descriptionInputRef}
            style={{flex: spacing[1] }}
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          
          <input
            style={{flex: spacing[2] }}
            type="text"
            placeholder="Amount"
            // UPDATED: Safely handle "-" during formatting
            value={formatValue(amount)}
            onChange={handleNumberChange(setAmount)}
            required
          />
          
          {isBaht && (
            <input
              style={{flex: spacing[3] }}
              type="text"
              placeholder="Rate"
              // UPDATED: Safely handle "-" during formatting
              value={formatValue(rate)}
              onChange={handleNumberChange(setRate)}
              required
            />
          )}
        </div>
        <button type="submit" className={styles.submitBtn}>Add Transaction</button>
      </form>
    </div>
  );
}