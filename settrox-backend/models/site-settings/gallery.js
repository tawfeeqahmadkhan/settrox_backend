const mongoose = require("mongoose");
const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    largeImage: { type: String, required: true },
    smallImages: {
      type: [{
        type: String,
        required: true,
        validate: [arrayLimit, '{PATH} must have exactly 4 items']
      }],
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length === 4;
}

module.exports = mongoose.model("Gallery", gallerySchema);