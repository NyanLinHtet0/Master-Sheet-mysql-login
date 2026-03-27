const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// This allows Express to understand JSON data sent from React
app.use(express.json());

// The absolute path to your JSON database file
const DATA_FILE = path.join(__dirname, 'data', 'corps.json');

// --- GET: Send the corporations to React ---
app.get('/api/corps', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read data' });
    }
    try {
      let corps = JSON.parse(data);
      res.json(corps);
    } catch (parseError) {
      return res.status(500).json({ error: 'Database JSON is corrupted' });
    }
  });
});

// --- POST: Save a new corp OR update an existing corp ---
app.post('/api/corps', (req, res) => {
  const incomingCorp = req.body;

  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    let corps = data.trim() ? JSON.parse(data) : [];
    if (!Array.isArray(corps)) corps = [];

    const existingIndex = corps.findIndex(c => c.name === incomingCorp.name);

    if (existingIndex >= 0) {
      corps[existingIndex] = incomingCorp;
    } else {
      corps.push(incomingCorp);
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(corps, null, 2));
    res.json({ success: true, message: 'Saved successfully!' });

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: 'Failed to process data' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
  console.log(`(Accessible on your network)`);
});