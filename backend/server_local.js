import express from "express";
import mysql from "mysql2/promise";

const app = express();
app.use(express.json());

const db = await mysql.createPool({
  host: "localhost",
  user: "root",
  password: "your_password",
  database: "master_sheets",
  charset: "utf8mb4",
});

app.post("/api/transaction", async (req, res) => {
  const { corp_id, t_date, description, amount, rate } = req.body;

  // get corp info
  const [corpRows] = await db.query(
    "SELECT is_foreign, inverse FROM corp_data WHERE id = ?",
    [corp_id]
  );

  const corp = corpRows[0];

  let total_mmk = corp.is_foreign
    ? amount * rate
    : amount;

  if (corp.inverse) total_mmk *= -1;

  await db.query(
    `INSERT INTO transaction_table 
     (corp_id, t_date, description, amount, rate, total_mmk)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [corp_id, t_date, description, amount, rate, total_mmk]
  );

  res.send({ success: true });
});


app.get("/api/transactions/:corp_id", async (req, res) => {
  const { corp_id } = req.params;

  const [rows] = await db.query(
    "SELECT * FROM transaction_table WHERE corp_id = ? ORDER BY t_date",
    [corp_id]
  );

  res.json(rows);
});


app.put("/api/transaction/:id", async (req, res) => {
  const { id } = req.params;
  const { amount, rate, corp_id } = req.body;

  const [corpRows] = await db.query(
    "SELECT is_foreign, inverse FROM corp_data WHERE id = ?",
    [corp_id]
  );

  const corp = corpRows[0];

  let total_mmk = corp.is_foreign
    ? amount * rate
    : amount;

  if (corp.inverse) total_mmk *= -1;

  await db.query(
    `UPDATE transaction_table 
     SET amount=?, rate=?, total_mmk=?
     WHERE id=?`,
    [amount, rate, total_mmk, id]
  );

  res.send({ success: true });
});

app.delete("/api/transaction/:id", async (req, res) => {
  const { id } = req.params;

  await db.query(
    "DELETE FROM transaction_table WHERE id=?",
    [id]
  );

  res.send({ success: true });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});