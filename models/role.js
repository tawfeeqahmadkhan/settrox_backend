const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true
    },
    permissions: [
      {
        module: { 
          type: String, 
          required: true,
          enum: [
            "dashboard", "categories", "brand", 
            "specification", "product", "siteSettings",
            "customers", "orders", "settings"
          ]
        },
        actions: [{ 
          type: String, 
          enum: ["view", "add", "edit", "delete"] 
        }],
      },
    ],
    status: { 
      type: String, 
      enum: ["active", "inactive"], 
      default: "active" 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", roleSchema);
