const mongoose = require("mongoose");

const flashSaleSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    productUrl: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FlashSale", flashSaleSchema);
