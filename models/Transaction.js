import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["income", "expense"], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Transaction", transactionSchema);
