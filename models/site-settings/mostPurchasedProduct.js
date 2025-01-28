const mongoose = require("mongoose");
const mostPurchasedSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true,
      unique: true,
    },
    order: { type: Number, default: 0, unique: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MostPurchased", mostPurchasedSchema);
