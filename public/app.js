document.addEventListener("DOMContentLoaded", () => {
  const transactionForm = document.getElementById("transaction-form");
  const budgetForm = document.getElementById("budget-form");
  const transactionTable = document.getElementById("transaction-table").querySelector("tbody");
  const budgetTable = document.getElementById("budget-table").querySelector("tbody");
  const reportButton = document.getElementById("generate-report");
  const reportOutput = document.getElementById("report-output");

  const fetchTransactions = async () => {
    const response = await fetch("/api/transactions");
    const transactions = await response.json();
    transactionTable.innerHTML = transactions
      .map(
        (t) =>
          `<tr>
            <td>${t.type}</td>
            <td>${t.description}</td>
            <td>${t.amount}</td>
            <td>${t.date}</td>
            <td><button class="delete-btn" data-id="${t.id}">Delete</button></td>
          </tr>`
      )
      .join("");
  };

  const fetchBudgets = async () => {
    const response = await fetch("/api/budgets");
    const budgets = await response.json();
    budgetTable.innerHTML = budgets
      .map(
        (b) =>
          `<tr>
            <td>${b.category}</td>
            <td>${b.amount}</td>
            <td><button class="delete-btn" data-id="${b.id}">Delete</button></td>
          </tr>`
      )
      .join("");
  };

  transactionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(transactionForm));
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    transactionForm.reset();
    fetchTransactions();
  });

  budgetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(budgetForm));
    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    budgetForm.reset();
    fetchBudgets();
  });

  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const id = e.target.dataset.id;
      const isTransaction = e.target.closest("table").id === "transaction-table";
      await fetch(`/${isTransaction ? "api/transactions" : "api/budgets"}/${id}`, { method: "DELETE" });
      isTransaction ? fetchTransactions() : fetchBudgets();
    }
  });

  reportButton.addEventListener("click", async () => {
    const response = await fetch("/api/reports");
    const report = await response.json();
    reportOutput.innerHTML = `
      <p>Total Income: $${report.income.toFixed(2)}</p>
      <p>Total Expenses: $${report.expenses.toFixed(2)}</p>
      <p>Total Budget: $${report.budget.toFixed(2)}</p>
      <p>Remaining Balance: $${report.remaining.toFixed(2)}</p>
    `;
  });

  fetchTransactions();
  fetchBudgets();
});
