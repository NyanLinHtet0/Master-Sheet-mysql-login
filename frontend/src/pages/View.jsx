import { useState, useEffect } from 'react';
import CorpDropdown from '../components/CorpDropdown';
import styles from './View.module.css';

function View({ corps }) {
  // Parent holds the state
  const [selectedCorp, setSelectedCorp] = useState(null);

  // Set default on load
  useEffect(() => {
    if (corps?.length > 0 && !selectedCorp) {
      setSelectedCorp(corps[0]);
    }
  }, [corps, selectedCorp]);

  return (
    <div className={styles.viewContainer}>
      <CorpDropdown 
        corps={corps} 
        selectedCorp={selectedCorp} 
        onSelect={(corp) => setSelectedCorp(corp)} 
      />

      {/* Other components will now automatically update because they use selectedCorp */}
      <div className={styles.content}>
      </div>
    </div>
  );
}

export default View;