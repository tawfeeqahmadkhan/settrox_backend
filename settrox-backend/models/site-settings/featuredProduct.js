const mongoose = require('mongoose');

const featuredProductSchema = new mongoose.Schema(
    {
      image: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String, required: true },
      productUrl: { type: String, required: true },
      status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model('FeaturedProduct', featuredProductSchema);
  