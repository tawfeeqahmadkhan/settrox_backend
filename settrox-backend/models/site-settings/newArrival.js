const mongoose = require('mongoose');

const newArrivalSchema = new mongoose.Schema(
  {
    videoUrl: { type: String, required: true }, 
    images: [{ type: String}], 
  },
  { timestamps: true } 
);

module.exports = mongoose.model('NewArrival', newArrivalSchema);
