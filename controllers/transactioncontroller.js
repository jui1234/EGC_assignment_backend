import Transaction from '../models/Transaction.js';


// Create
export const addTransaction = async (req, res) => {
  try {
    const newTransaction = await Transaction.create(req.body);
    res.status(201).json({
      success: true,
      message: "Transaction created",
      data: newTransaction,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Read (All + Filters)
export const getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json({ success: true, message: "Transactions fetched", data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update
export const updateTransaction = async (req, res) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }
    res.json({ success: true, message: "Transaction updated", data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete
export const deleteTransaction = async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }
    res.json({ success: true, message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Summary for bar graph (monthly income vs expense and difference)
export const getIncomeExpenseSummary = async (req, res) => {
  try {
    const { startDate: qStart, endDate: qEnd, month, year } = { ...req.query, ...req.body };

    // Build date range
    let startDate;
    let endDate;
    if (month && year) {
      const y = Number(year);
      const m = Number(month); // 1-12 expected
      if (!Number.isNaN(y) && !Number.isNaN(m) && m >= 1 && m <= 12) {
        startDate = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
        endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
      }
    }
    if (!startDate && qStart) {
      const d = new Date(qStart);
      if (!Number.isNaN(d.getTime())) startDate = d;
    }
    if (!endDate && qEnd) {
      const d = new Date(qEnd);
      if (!Number.isNaN(d.getTime())) endDate = d;
    }

    const matchStage = {};
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = startDate;
      if (endDate) matchStage.date.$lte = endDate;
    }

    const pipeline = [
      Object.keys(matchStage).length ? { $match: matchStage } : null,
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          income: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          income: 1,
          expense: 1,
          difference: { $subtract: ["$income", "$expense"] },
        },
      },
      { $sort: { year: 1, month: 1 } },
    ].filter(Boolean);

    const summary = await Transaction.aggregate(pipeline);

    return res.json({
      success: true,
      message: "Income/Expense summary fetched",
      data: summary,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
