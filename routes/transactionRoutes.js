import express from "express";
import {addTransaction, getTransactions, updateTransaction, deleteTransaction, getIncomeExpenseSummary} from "../controllers/transactioncontroller.js";

const router = express.Router();

router.post("/", addTransaction);
router.get("/", getTransactions);
router.get("/summary", getIncomeExpenseSummary);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;

