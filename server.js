const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Database setup
const db = new sqlite3.Database("finance_tracker.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the database");
    db.run(
      `CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY, type TEXT, description TEXT, amount REAL, date TEXT)`,
      (err) => {
        if (err) console.error("Error creating transactions table:", err.message);
      }
    );
    db.run(
      `CREATE TABLE IF NOT EXISTS budgets (id INTEGER PRIMARY KEY, category TEXT, amount REAL)`,
      (err) => {
        if (err) console.error("Error creating budgets table:", err.message);
      }
    );
  }
});

// Routes
app.get("/api/transactions", (req, res) => {
  db.all("SELECT * FROM transactions", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post("/api/transactions", (req, res) => {
  const { type, description, amount, date } = req.body;
  db.run(
    `INSERT INTO transactions (type, description, amount, date) VALUES (?, ?, ?, ?)`,
    [type, description, amount, date],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

app.delete("/api/transactions/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM transactions WHERE id = ?", id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: "Transaction deleted" });
    }
  });
});

app.get("/api/budgets", (req, res) => {
  db.all("SELECT * FROM budgets", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post("/api/budgets", (req, res) => {
  const { category, amount } = req.body;
  db.run(
    `INSERT INTO budgets (category, amount) VALUES (?, ?)`,
    [category, amount],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID });
      }
    }
  );
});

app.delete("/api/budgets/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM budgets WHERE id = ?", id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: "Budget deleted" });
    }
  });
});

// Generate Report
app.get("/api/reports", (req, res) => {
  db.get(
    "SELECT SUM(amount) AS total_income FROM transactions WHERE type = 'income'",
    (err, income) => {
      if (err) return res.status(500).json({ message: "Error generating income data" });

      db.get(
        "SELECT SUM(amount) AS total_expenses FROM transactions WHERE type = 'expense'",
        (err, expenses) => {
          if (err) return res.status(500).json({ message: "Error generating expense data" });

          db.get("SELECT SUM(amount) AS total_budget FROM budgets", (err, budget) => {
            if (err) return res.status(500).json({ message: "Error generating budget data" });

            const report = {
              income: income.total_income || 0,
              expenses: expenses.total_expenses || 0,
              budget: budget.total_budget || 0,
              remaining: (income.total_income || 0) - (expenses.total_expenses || 0),
            };

            res.json(report);
          });
        }
      );
    }
  );
});

// Serve Front-End
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
